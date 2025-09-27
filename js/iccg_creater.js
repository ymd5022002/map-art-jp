const SVG_NS = "http://www.w3.org/2000/svg";

let vertices = [];
let edges = []; 
let allPoints = []; 
let allSegments = []; 

// 座標の丸めを行うための定数 
const COORD_PRECISION = 3; 

/**
 * 座標を四捨五入して量子化し、浮動小数点誤差による重複を防ぎます。
 */
function roundCoord(coord) {
    return Math.round(coord * (10 ** COORD_PRECISION)) / (10 ** COORD_PRECISION);
}

// =================================================================
// ユーティリティ関数
// =================================================================

/**
 * 線分の方向によらず一意なキーを生成します。
 * 座標の丸め込みをキーに含めることで、浮動小数点誤差による判定失敗を防ぎます。
 */
function getSegmentKey(p1, p2) {
    const key1 = `${p1.id}-${roundCoord(p1.x)}-${roundCoord(p1.y)}`;
    const key2 = `${p2.id}-${roundCoord(p2.x)}-${roundCoord(p2.y)}`;
    const ids = [key1, key2].sort();
    return `${ids[0]}-${ids[1]}`;
}

function getLineIntersection(p1, p2, p3, p4) {
    const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if (Math.abs(d) < 1e-9) return null;
    
    const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
    const u = -((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)) / d;

    if (t > 1e-9 && t < 1 - 1e-9 && u > 1e-9 && u < 1 - 1e-9) {
        return {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y)
        };
    }
    return null;
}

function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

/**
 * 線分上の点判定を強化（誤差許容度を上げる）
 */
function isPointOnLineSegment(p, a, b) {
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);

    if (p.x < minX - 1e-5 || p.x > maxX + 1e-5 || p.y < minY - 1e-5 || p.y > maxY + 1e-5) return false;

    const distAB = distance(a, b);
    const distAP = distance(a, p);
    const distPB = distance(p, b);
    // 誤差許容度を 1e-5 に設定
    return Math.abs(distAP + distPB - distAB) < 1e-5; 
}

function angle(center, p) {
    return Math.atan2(p.y - center.y, p.x - center.x);
}

// =================================================================
// グラフ生成ロジック (drawGraph)
// =================================================================

/**
 * ステップ入力欄を新しいUIに合わせて生成します。
 */
function generateStepInputs() {
    const stepCount = parseInt(document.getElementById("stepCount").value);
    
    // parseFloatを使用して浮動小数点数として値を取得
    const startStep = parseFloat(document.getElementById("startStep").value);
    const stepGap = parseFloat(document.getElementById("stepGap").value);
    
    const container = document.getElementById("stepInputs");
    container.innerHTML = "";

    // 画像の初期値と対応する色を保持 (色を繰り返すロジックは保持)
    const initialColors = [
        "#F2FEFB", "#FFF6C8", "#F5C85E", "#CB7405", "#7D00A0",
        "#0068EC", "#00C1FF", "#86F5DE", "#DCFF85", "#FFE200",
        "#FF9E7B", "#F138D5", "#9A42FB", "#00A3ED", "#00E1B1",
        "#4EF95F", "#D6EC69", "#FFBFB7", "#FF7FE6", "#F461EB",
        "#9D8FC9", "#00C495", "#00E382", "#6BE6A8", "#CFD1D0"
    ]; 
    const colorCount = initialColors.length;

    for (let i = 0; i < stepCount; i++) {
        const group = document.createElement("div");
        group.className = "step-row";
        
        // ステップ番号 (01, 02, ...)
        const indexText = (i + 1).toString().padStart(2, '0');
        
        // 計算された値の小数点以下1桁目を四捨五入して整数にする
        const calculatedValue = startStep + (i * stepGap);
        const defaultValue = Math.round(calculatedValue); 
        
        // 色を繰り返す
        const defaultColor = initialColors[i % colorCount];
        
        group.innerHTML = `
            <span class="step-index">${indexText}</span>
            <input type="number" id="step${i}" value="${defaultValue}" min="1" title="ステップの間隔">
            <input type="color" id="color${i}" value="${defaultColor}" title="線の色">
        `;
        container.appendChild(group);

        // 新しく生成されたインプットにイベントリスナーを設定
        const stepInput = document.getElementById(`step${i}`);
        const colorInput = document.getElementById(`color${i}`);
        
        // oninputイベントでグラフを再描画
        stepInput.addEventListener('input', drawGraph);
        colorInput.addEventListener('input', drawGraph);
    }
    
    // ステップ入力欄の再生成後、すぐにグラフを描画
    drawGraph();
}

function drawGraph() {
    const n = parseInt(document.getElementById("vertexCount").value);
    const stepCount = parseInt(document.getElementById("stepCount").value);
    const steps = [];
    const colors = [];

    for (let i = 0; i < stepCount; i++) {
        const stepInput = document.getElementById(`step${i}`);
        const colorInput = document.getElementById(`color${i}`);
        if (stepInput && colorInput) {
            steps.push(parseInt(stepInput.value));
            colors.push(colorInput.value);
        }
    }

    // グラフサイズ 900x900
    const width = 900, height = 900; 
    const cx = width / 2, cy = height / 2;
    const radius = 420; 

    const svgContainer = document.getElementById("svgContainer");
    svgContainer.innerHTML = "";

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // 1. 頂点を計算・記録
    vertices = [];
    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        vertices.push({
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
            id: `v${i}`,
            isVertex: true
        });
    }

    // 2. エッジ（線分）を計算・記録
    edges = [];
    steps.forEach((step, idx) => {
        const color = colors[idx];
        for (let i = 0; i < n; i++) {
            const j = (i + step) % n;
            edges.push({
                p1: vertices[i],
                p2: vertices[j],
                color: color, 
                stepIndex: idx
            });
        }
    });

    // グラフの描画
    edges.forEach(edge => {
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", edge.p1.x);
        line.setAttribute("y1", edge.p1.y);
        line.setAttribute("x2", edge.p2.x);
        line.setAttribute("y2", edge.p2.y);
        line.setAttribute("stroke", edge.color);
        line.setAttribute("stroke-width", "1"); // 線の太さ
        svg.appendChild(line);
    });
    
    svgContainer.appendChild(svg);
}

/**
 * 頂点数とステップ数のインプットにイベントリスナーを設定します。
 */
function setupEventListeners() {
    const vertexCountInput = document.getElementById("vertexCount");
    const stepCountInput = document.getElementById("stepCount");
    
    // 新しい入力欄
    const startStepInput = document.getElementById("startStep");
    const stepGapInput = document.getElementById("stepGap");
    
    // 頂点数Nの変更時にグラフを再描画
    vertexCountInput.addEventListener('input', drawGraph);
    
    // ステップ数X、開始ステップ、ギャップの変更時は、まず入力欄を再生成し、その中でグラフを再描画
    stepCountInput.addEventListener('input', generateStepInputs);
    startStepInput.addEventListener('input', generateStepInputs);
    stepGapInput.addEventListener('input', generateStepInputs);
}


// =================================================================
// 面の着色ロジック (無効化)
// =================================================================
function colorFaces() {
    alert("面検出と着色の処理は無効化されています。");
}


// 初期処理
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners(); // 頂点数とステップ数にリスナーを設定
    generateStepInputs(); // 初期ステップ入力欄を生成し、その中で初回グラフ描画も実行
});