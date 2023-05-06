
/* *********************************************************

  干渉色・抽出色地図アート作成ツール
  Copyright c <2022> MapArtResearch All rights reserved.

********************************************************** */

// カラーパレット作成
var toneNum = 25
var interferenceColor = ["#F2FEFB","#FFF6C8","#F5C85E","#CB7405","#7D00A0","#0068EC","#00C1FF","#86F5DE","#DCFF85","#FFE200","#FF9E7B","#F138D5","#9A42FB","#00A3ED","#00E1B1","#4EF95F","#D6EC69","#FFBFB7","#FF7FE6","#F461EB","#9D8FC9","#00C495","#00E382","#6BE6A8","#CFD1D0"];
var rainbowColor      = ["#3300FF","#0000FF","#0040FF","#0080FF","#00C0FF","#00FFFF","#00FFC0","#00FF80","#00FF40","#00FF00","#40FF00","#80FF00","#C0FF00","#FFFF00","#FFC000","#FF8000","#FF4000","#FF0000","#FF0040","#FF0080","#FF00C0","#FF00FF","#CC00FF","#9900FF","#6600FF"];
var blackAndWhite     = ["#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF"];
var redAndBlue        = ["#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#105D95","#105D95","#105D95","#105D95","#105D95","#105D95","#105D95","#105D95","#105D95","#105D95","#105D95","#105D95"];
var black             = ["#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000"];
var gray              = ["#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080"];
var white             = ["#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF"];
var colorPallet = [interferenceColor, rainbowColor, blackAndWhite, redAndBlue, black, gray, white ]

// カラーパレットの選択
function colorsSelect(palette){
    for(let i = 0; i < toneNum; i++){
        document.getElementById('c' + String(i + 1)).value = palette[i];
    }
}

function clickBtn2(){
    colorsSelect(colorPallet[0]);
}

function clickBtn3(){
    colorsSelect(colorPallet[1]);
}

function clickBtn4(){
    colorsSelect(colorPallet[2]);
}

function clickBtn5(){
    colorsSelect(colorPallet[3]);
}

function clickBtn6(){
    colorsSelect(colorPallet[4]);
}

function clickBtn7(){
    colorsSelect(colorPallet[5]);
}

function clickBtn8(){
    colorsSelect(colorPallet[6]);
}

// 配色ファイルを出力する関数
function txtsave(FileName) {
    const txt = document.getElementById('result').value;
    const blob = new Blob([txt], {type:'text/plain'});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = FileName;
    link.click();
}

//小数あり10進数を小数あり16進数に変換する関数
function dec2hex( num, digit = 10 ){  
    var num_int = Math.floor(num); //整数部
    var num_dcm = Math.round( 16**digit * (num - num_int) ); //小数部を16進10桁分桁上げ
    var str_hex_int = num_int.toString(16).toUpperCase(); //16進の整数部文字列
    var str_hex_dcm = num_dcm.toString(16).toUpperCase(); //16進の小数部文字列
    var len_str_hex_dcm = str_hex_dcm.length; //16進小数部の文字数
    for (let i = 0 ; i < digit - len_str_hex_dcm ; i++ ){ //0埋め処理
        str_hex_dcm = "0" + str_hex_dcm;
    }
    //16進小数部文字列末尾の連続する0を除去する
    for (let i = 0 ; i < digit ; i++ ){    
        if (str_hex_dcm.slice( -1 ) == "0"){
            str_hex_dcm = str_hex_dcm.slice( 0, -1 );    //末尾の0を削除
        }else{
            break;
        }
    }
    if (str_hex_dcm == ""){
        str_hex = str_hex_int;
    }else{
        str_hex = str_hex_int + "." + str_hex_dcm;
    }
    return str_hex;
}

//小数点以下１桁までに丸めた文字列にする関数
function round1Str(number){
    if ( Math.round(number) == number){
        str_number = String(number)
    }else{
        str_number = String(number.toFixed(1))
    }
    return str_number;
}

//配色ファイルを作成する関数
function palletSave(){
    // カラーパレットファイルの初期化
    document.getElementById("result").value = " ";

    // 入力値取得
    var str_minHeight = document.getElementById("minHeight").value;
    var str_maxHeight = document.getElementById("maxHeight").value;
    var str_intHeight = document.getElementById("intHeight").value;
    var minHeight = Number(str_minHeight);
    var maxHeight = Number(str_maxHeight);
    var intHeight = Number(str_intHeight);  //刻み
    var cycleHeight = toneNum * intHeight;
    //エラー処理
    const difHeight = maxHeight - minHeight;
    if (difHeight < 0){
        alert('最大標高は最小標高よりも大きくしてください');
    }

    // 標高値の配列作成
    var endNum = difHeight / intHeight + 1;
    var height = []
    for (let i=0; i<endNum; i++){
        height[i] = minHeight + intHeight*i
    }

    // 色調の読取
    // 色調の数値表示
    var str_color = [];
    for (let i = 0; i < toneNum; i++){
        str_color[i] = document.getElementById('c'+ String(i+1)).value;
        document.getElementById('label_c' + String(i+1)).textContent = round1Str(height[i]) + "～" + round1Str(height[i+1]);
    }

    // 色の配列作成
    var colors = []
    var colorsNum = 0
    for (let i = 0; i < endNum; i++){
        for (let j = 0; j < toneNum; j++){
            if (colorsNum % 25 == j ){
                colors.push(str_color[j]);
                colorsNum++;
                break;
            }
        }
    }

    // 凡例のテキスト作成
    var text1 = "{\n  \"gradate\":";

    const grad = document.gradation.grad;
    if(grad.checked) {
        var text2 ="true,";
    } else {
        var text2 ="false,";
    }
    
    var text3 = "  \"useHillshademap\": ";

    const shade = document.shade.shade;
    if(shade.checked){
        var text4 ="true,";
    } else {
        var text4 ="false,";
    }
    
    var text5 = "  \"desc\": false,\n  \"colors\": \["
    var text6 = "    \{\n      \"h\": "
    var text7 = ",\n      \"color\": \""
    var text8 = "\"\n    \},\n"
    var text9 = "    \{\n      \"h\": null,\n      \"color\": \"";
    var text10 = "\"\n    \}\n  ]\n}";

    document.getElementById('result').value += text1 + text2 + "\n" + text3 + text4 + "\n" + text5;
    for (let i=1; i<endNum; i++){
        document.getElementById('result').value += text6 + round1Str(height[i]) + text7 + colors[i] + text8;
    }
    document.getElementById('result').value += text9 + colors[0] + text10;

    txtsave('GSIMap_StrPattern.txt');
}

//色別標高図を描画する関数
function mapDrawing() {  
    // 入力値取得
    var str_minHeight = document.getElementById("minHeight").value;
    var str_maxHeight = document.getElementById("maxHeight").value;
    var str_intHeight = document.getElementById("intHeight").value;
    var minHeight = Number(str_minHeight);
    var maxHeight = Number(str_maxHeight);
    var intHeight = Number(str_intHeight);  //刻み
    var cycleHeight = toneNum * intHeight;
    var zoomLevel = 8
    var str_position = "/35.715370/139.840268/";
    var str_zoomPosition = "#"+ String(zoomLevel) + str_position

    //エラー表示
    const difHeight = maxHeight - minHeight;
    if (difHeight < 0){
        alert('【エラー】最大値は最小値よりも小さくできませんので、入力値を見直してください');
    }

    // 標高値の配列作成
    var endNum = difHeight / intHeight + 1;
    var height = null
    height =[]
    
    for (let i=0; i<endNum; i++){
        height[i] = minHeight + intHeight*i
    }

    // 色調の読取
    // 色調の数値表示
    var str_color = [];
    for (let i = 0; i < toneNum; i++){
        str_color[i] = document.getElementById('c'+ String(i+1)).value;
        document.getElementById('label_c' + String(i+1)).textContent = round1Str(height[i]) + "～" + round1Str(height[i+1]);
    }

    // 色コードの配列作成
    var colors = []
    var colorsNum = 0
    for (let i = 0; i < endNum; i++){
        for (let j = 0; j < toneNum; j++){
            if (colorsNum % 25 == j ){
                colors.push(str_color[j]);
                colorsNum++;
                break;
            }
        }
    }

    //地理院地図URLの標高＆色データ列の生成
    g__id =""
    for (let i = 0; i < endNum; i++){
        if (height[i] < 0) {
            hexHeight = dec2hex(Math.abs(height[i])); //.toString(16);
            g__id = g__id + "-" + String(hexHeight);
        }else{
            hexHeight = dec2hex(height[i]); //.toString(16);
            g__id = g__id + String(hexHeight);
        }
        g__id = g__id + "G" + colors[i].substring(colors[i].length -6) + "G";
    }
    //終末端の処理            
        g__id = g__id + "GG" + colors[endNum - 1].substring(colors[endNum - 1].length -6);

    //地理院地図URLの生成

    // 0.1刻みテストサイトでの描画がうまく行かないので非使用
    // const kizami = document.kizami.kizami10;
    // if(kizami.checked){
    //     windowGsiURL = "https://gsi-cyberjapan.github.io/krmsp/?hc=hic";
    //     gsiURL       = "https://gsi-cyberjapan.github.io/krmsp/";
    // }else{
    //     windowGsiURL = "https://maps.gsi.go.jp/?hc=hic";
    //     gsiURL       = "https://maps.gsi.go.jp/";
    // }

    windowGsiURL = "https://maps.gsi.go.jp/?hc=hic";
    gsiURL       = "https://maps.gsi.go.jp/";
    n = 0;

    windowGsiURL += str_zoomPosition + "/&base_grayscale=1&ls=slopemap%2C0.37%7Chillshademap%2C0.58%7Crelief_free&blend=11&disp=0";
    
    str_zoomPosition = "#"+ String(zoomLevel + 2) + str_position
    gsiURL       += str_zoomPosition + "/&base_grayscale=1&ls=std%2C0.71%7Cslopemap%2C0.37%7Chillshademap%2C0.58%7Crelief_free&blend=111&disp=0";

    const shade = document.shade.shade;
    if(shade.checked) {
        windowGsiURL += "1";
        gsiURL       += "11";
    }else{
        windowGsiURL += "0";
        gsiURL       += "00";
    }

    windowGsiURL += "1&lcd=slopemap&vs=c0j0h0k0l0u0t0z0r0s0m0f1&reliefdata=";
    gsiURL       += "1&lcd=slopemap&vs=c0j0h0k0l0u0t0z0r0s0m0f1&d=m&reliefdata=";

    const grad = document.gradation.grad;
    if(grad.checked) {
        windowGsiURL += "2";
        gsiURL       += "2";
    } else {
        windowGsiURL += "0";
        gsiURL       += "0";
    }

    windowGsiURL += g__id;
    gsiURL       += g__id;
    n++;

    //地理院地図の書き換え
    document.getElementById('mapFrame1').contentWindow.location.replace(windowGsiURL);    


    // ■■■■ 地図窓のURL ■■■
    // ["https://gsi-cyberjapan.github.io/krmsp/?hc=hic","https://maps.gsi.go.jp/?hc=hic"] ⇒ 0.1m刻み[ON,OFF]
    // + str_zoomPosition + "/&base_grayscale=1&ls=slopemap%2C0.37%7Chillshademap%2C0.58%7Crelief_free&blend=11&disp=0"
    // + ["1","0"] ⇒陰影[ON, OFF]
    // + "1&lcd=slopemap&vs=c0j0h0k0l0u0t0z0r0s0m0f1&reliefdata="
    // + ["2","0"] ⇒ グラデーション[ON,OFF]
    // +g__id

    // ■■■■ 別窓のURL ■■■
    // ["https://gsi-cyberjapan.github.io/krmsp/","https://maps.gsi.go.jp/"] ⇒ 0.1m刻み[ON, OFF]
    // + str_zoomPosition + "/&base_grayscale=1&ls=std%2C0.71%7Cslopemap%2C0.37%7Chillshademap%2C0.58%7Crelief_free&blend=111&disp=0"
    // + ["11","00"] ⇒陰影[ON, OFF]
    // + "1&lcd=slopemap&vs=c0j0h0k0l0u0t0z0r0s0m0f1&d=m&reliefdata="
    // + ["2","0"] ⇒ グラデーション[ON,OFF]
    // +g__id

    //'https://maps.gsi.go.jp/?hc=hic'+ str_zoomPosition +'/&base_grayscale=1&ls=slopemap%2C0.37%7Chillshademap%2C0.58%7Crelief_free&blend=11&disp=011&lcd=slopemap&vs=c0j0h0k0l0u0t0z0r0s0m0f1&reliefdata=2'+g__id
        
    gsiURL='https://maps.gsi.go.jp/'+ str_zoomPosition +'/&base_grayscale=1&ls=std%2C0.71%7Cslopemap%2C0.37%7Chillshademap%2C0.58%7Crelief_free&blend=111&disp=0111&lcd=slopemap&vs=c0j0h0k0l0u0t0z0r0s0m0f1&d=m&reliefdata=2'+g__id

}

//拡大地図を表示する関数
function jumpToGSIMap(){        
    if ( n==0 ){
        mapDrawing()
    }
    window.open( gsiURL, '_blank');
}

// 数値の入力欄を0.5刻みから0.1刻みに変更する関数　⇒上手く機能しないのでボツ
// function kizami10(){
//     var form_element = document.querySelector("form");
//     var minHeight_element = document.querySelector("input[id=minHeight]");
//     var maxHeight_element = document.querySelector("input[id=maxHeight]");
//     var intHeight_element = document.querySelector("input[id=intHeight]");

//     const kizami = document.kizami.kizami10;
//     if(kizami.checked) {
//         minHeight_element.step = '0.1';
//         maxHeight_element.step = '0.1';
//         intHeight_element.step = '0.1';        
//     } else {
//         minHeight_element.step = '0.5';
//         maxHeight_element.step = '0.5';
//         intHeight_element.step = '0.5';
//     console.log(minHeight_element.step);
//     }
// }

window.onload = function(){
    // ページ読み込み時に実行したい処理
    //mapDrawing()
}


