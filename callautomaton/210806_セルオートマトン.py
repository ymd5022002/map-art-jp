import numpy as np
import matplotlib.pyplot as plt

rowNum = int(input("何段にしますか?"))
originNum = int(input("起点は何か所にしますか?(0-255)"))
if originNum < 1 or originNum > 255 :
    print("起点か所が範囲外なので1か所に変更しました!")
    k = 1
ruleNum = int(input("ルール番号は幾つにしますか?(0－255)")) 
if ruleNum < 0 or ruleNum > 255:
    print("ルール番号が範囲外なので90に変更しました!")
    ruleNum = 90

print("描画中")

automaton= np.zeros(8, dtype= int )
a = np.zeros((rowNum*2+2, rowNum+2), dtype=int)

# 初期条件(1段目)の定義
for i in range(1,originNum+1):
    a[int(2*rowNum/( originNum + 1) * i), 1] = 1

# x,y の初期条件
x=[]
y=[]
n = 0
for i in range(1, rowNum*2 +1):
    if a[i, 1] == 1:
        x.append(i)
        y.append(rowNum)
        n += 1
n = 0

# ルール番号の2進化
for i in range(8):
    automaton[7-i] = ruleNum // 2**(7-i)
    ruleNum -= automaton[7-i] * 2**(7-i)

for j in range(2,rowNum+1):
    for i in range(1, rowNum*2 +1):
        hantei = a[i-1, j-1] * 4 + a[i, j-1] * 2 + a[i+1,j-1] 
        a[i, j] = automaton[hantei]
        #print(a[i, j], end ="") #i段目の結果表示
        if a[i, j] == 1:
            x.append(i)
            y.append(rowNum+1 - j)
            n += 1
    #print()
print("描画完了！")

# グラフのプロット
plt.scatter(x, y, color="saddlebrown", marker="s", s=2 )

# 表示する
plt.show()
