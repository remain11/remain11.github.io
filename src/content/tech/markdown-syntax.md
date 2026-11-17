---
title: "Markdown 语法知识"
description: "Markdown 常用语法、表格、任务列表与 LaTeX 数学公式速查。"
date: 2023-08-01
tags: [Markdown, 写作, 工具]
---
## 标题1

### 标题2

#### 标题3

##### 标题4

> 这是一段引用

把大象放进冰箱：
1. 打开冰箱
2. 放进去
3. 关上冰箱

无序列表：
- wwe
- wew
  
*  <center style="font-size:14px;color:#C0C0C0;text-decoration:underline"></center> 
* sdsa

明天要做的事情：
- [ ] 吃饭 
- [x] 睡觉

代码块
``` c
int main(){
    return 0;
}
```

数学公式
$$2\sqrt[2]ax$$

表格
|姓名|年龄|成绩|
|:-|-:|:--:|
|张三|19|20|


(下面的变成超链接了)

脚注：
一键三连 [^1]

[^1]: 点赞

横线

---

[百度](baidu.com"一个搜索")

ULR:
http://www.baidu.com

图片
![百度](https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png "百度搜索")

*斜体*    
**加粗** 
`printf()`
<u>下划线</u>

~~删除线~~

 :smile: 
 $\theta=x^2$ 
  H~2~O  X^2^
==高亮==

<iframe src="//player.bilibili.com/player.html?aid=327623069&bvid=BV1JA411h7Gw&cid=171385214&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>


## Markdown 数学公式语法

### 1、行内式与独立式

$x+y=1$

$$x+y=1$$

### 2、上下标

$$
x^2+y_1=x^{x_1+y}
$$

### 3、括号

$$
f(x,y)=x^2+y^2,x\epsilon[1,10],y\epsilon\{1,2,3\}
$$

$$
\left.(\sqrt{1\over2}\right)
$$

### 4、省略号

$$
{1\over2},{1\over2},{1\over2},\ldots,{1\over2}
$$

$$
{1\over2},{1\over3},{1\over4},\ldots,{1\over n}
$$

### 5、分数

$$
\frac{1-x}{y+1}
$$

$$
3\over{x+1}
$$

### 6、开方

$$
\sqrt[3]{9}
$$

### 7、向量

$$
\vec a   \\
\vec {ab}
$$

### 8、极限

$$
\lim_{n\rightarrow+\infty}\frac{1}{n}
$$

### 9、求导

$$
y\prime=nx^{n-1}
$$

### 10、方程组

$$
y:\begin{cases}x+y=1\\
x-y=0\end{cases}
$$

### 11、矩阵

$$
A=\left[{\begin{matrix}
1&2&3\\
4&5&6\\
7&8&9\\ 
\end{matrix}}\right]
\tag{7}
$$

### 12、对数符号

$$
\log_a^b\\
\lg \\
\ln \\
$$

### 13、数学符号

$$
\xlongequal{test}\\
\not=\\
\approx\\
\equiv \\
\leq \\
\geq \\
\ggg \\
\ll \\
\times \\
\cdot \\
\pm \\
\div \\
\infty \\
\sum_{i=1}^n \\
\prod \\
\coprod \\
\downarrow\uparrow\leftarrow\rightarrow\\
\nearrow\searrow\swarrow\nwarrow\\
\Downarrow\Uparrow\Leftarrow\Rightarrow\\
\Leftrightarrow\Updownarrow\\
\overline{a+b+c}
$$

### 14、定积分

$$
\int_a^bf(x)dx=F(a)-F(b)\\
\iint \\ 
\iiint \\
\oint \\
\partial \\
$$

### 15、三角函数

$$
\bot \\
\angle \\
30^\circ \\
\sin \cos \tan \cot \sec \csc
$$

### 16、集合

$$
\emptyset \\
\in \notin
\supset \supseteq
\bigcap \cup\\
\bigvee \bigwedge \lnot \\
\exists \forall
$$

### 17、希腊字母
$$
\alpha \beta \gamma \pi \phi\mu\rho \tau \omega \varepsilon
$$

### 18、空格

$$
a\!b  \\
ab  \\
a\,b \\
a\;b \\
a\ b \\
a\quad b\\
a\qquad b
$$

### 19、数学帽子


$$
\vec{a} \\
\overline{a} \\
\widehat{a} \\
\dot{a} \\
\ddot{a} \\
\hat{a} \\
\tilde{a} \\
\check{a} \\
\grave{a} \\
\acute{a} \\ 
\widehat{abcdefg} \\
\widetilde{abcdefg} \\
$$
