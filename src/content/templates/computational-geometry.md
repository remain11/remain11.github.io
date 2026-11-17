---
title: "计算几何模板"
description: "计算几何的基础工具、精度处理与常用算法模板。"
date: 2026-05-06
tags: [计算几何, 模板, C++]
---
## 计算几何

### 经验

- 鸡脚排序后可以用类似前缀和的思想处理一些信息，下半部分可以转换到上半部分，横跨负x轴的角可以拆成两个
- 记得线段退化，平行的情况
- 可以给线段定向以避免分类讨论

```cpp
#include<bits/stdc++.h>
using namespace std;

#define cross(p1,p2,p3)((p2.x-p1.x)*(p3.y-p1.y)-(p3.x-p1.x)*(p2.y-p1.y))//(p1,p2)x(p1,p3)
#define crossop(p1,p2,p3)sgn(cross(p1,p2,p3))//求符号 

typedef double LD;
#define cp const point&

const LD eps=1e-8;

LD squ(LD x) {
	return x * x;
}

//符号函数 正1 负-1 零0 
int sgn(LD x){
	if(x > eps) return 1;
	else if(x < -eps) return -1;
	else return 0; 
}

struct point{
	LD x, y;
	point(){
	} 
	point(LD x, LD y){
		this -> x = x;
		this -> y = y;
	}
	void read(){
		cin >> x >> y;
	}
	void write()const{
		cout << x << " " << y << endl;
	}
	point operator+(cp w)const{
		return {x + w.x, y + w.y};
	}
	point operator-(cp w)const{
		return {x - w.x, y - w.y};
	}
	point operator*(LD w)const{
		return {x * w, y * w};
	}
	point operator/(LD w)const{
		return {x / w, y / w};
	}
	bool operator==(cp w)const{
		return sgn(x - w.x) == 0 && sgn(y - w.y) == 0;
	}
	bool operator<(cp w)const{
		if(sgn(x - w.x))return sgn(x - w.x) < 0;
		else return sgn(y - w.y) < 0; 
	} 
//	friend bool operator==(cp a,cp b){
//		return sgn(a.x-b.x)==0&&sgn(a.y-b.y)==0;
//	}
	//绕O点逆时针旋转t弧度的点坐标 
	LD len2()const{
		return squ(x) + squ(y);
	}
	LD len()const{
		return sqrt(this -> len2());
	} 
	point rotate(LD t)const{
		return {x * cos(t) - y * sin(t), x * sin(t) + y * cos(t)};
	}
	point rot90()const{
		return {-y, x};
	}
	//同方向单位向量 
	point unit()const{
		return *this / (this -> len()); 
	} 
	//鸡脚(-π,π] // (0,0) 未定义 // atan2(-0.0, -1) = -pi
	LD alpha(){
		return atan2(y, x);
	}
    //鸡脚为(0,π]
    bool quad(){
        // return sgn(y) == 1 || (sgn(y) == 0 && sgn(x) >= 0); 鸡脚为[0,π)
        return sgn(y) == 1 || (sgn(y) == 0 && sgn(x) < 0); 
    }
}; 


//点积 
LD dot(cp a, cp b){
	return a.x * b.x + a.y * b.y;
}
//叉积
LD det(cp a, cp b){
	return a.x * b.y - b.x * a.y;
} 
//距离
LD dis(cp a, cp b){
	return sqrt(squ(a.x - b.x) + squ(a.y - b.y));
} 
//向量AB AC夹角是否在(0,π)间 
bool turn_left(cp a, cp b, cp c){
	return sgn(det(b - a, c - a)) > 0;
}

//线段 
struct line{
	point s, t;
	line(){
	}
	line(point s, point t){
		this -> s = s;
		this -> t = t;
	}
};
//判断线段是否同向 
bool same_dir(const line&a, const line&b){
	return sgn(det(a.t - a.s, b.t - b.s)) == 0 
    &&  sgn(dot(a.t - a.s, b.t - b.s)) > 0;
} 
//判断点是否在线段上,包含左右端点
bool point_on_segment(cp a, const line&l){
	//条件1是判断是否在直线上，条件2判断是否在线段内
	//if(l.s == l.t)return a == l.s; //线段退化的情况,下面也包含 
	return sgn(det(a - l.s, a - l.t)) == 0
    &&  sgn(dot(a - l.s, a - l.t)) <= 0;
} 
//判断点是否在直线上 
bool point_on_line(cp a, const line&l){
	//判断是否在直线上
	return sgn(det(a - l.s, a - l.t)) == 0;
} 
//判断线段AB是否在线段c中间 
bool two_side(cp a, cp b, const line&c){
	return sgn(det(a - c.s, c.t - c.s))
    * sgn(det(b - c.s, c.t - c.s)) < 0;
}
// 判断线段A和B是否相交 
bool inter_judge(const line&a, const line&b){
	//不严格相交，包含平行和边界情况
	//4个边界情况 
	if(point_on_segment(a.s,b)
	|| point_on_segment(a.t,b)
	|| point_on_segment(b.s,a)
	|| point_on_segment(b.t,a)
	)return true;
	//a在b中间且b在a中间 
	return two_side(a.s, a.t, b) && two_side(b.s, b.t, a);
} 
//直线相交点 
point line_intersect(const line&a, const line&b){
	assert(det(a.t - a.s, b.t -b.s));
	LD u = det(a.t - a.s, b.s - a.s);
	LD v = -det(a.t - a.s, b.t - a.s);
	return (b.s * v + b.t * u) / (u + v);
} 
//点在射线上 
bool point_on_ray(cp a, const line&b){
	//共线并且在端点后方 
	return sgn(det(a - b.s, b.t - b.s)) == 0
	&&  sgn(dot(a - b.s, b.t - b.s)) >= 0;
} 
//射线判交 
bool ray_inter_judge(line a, line b){
	LD s1, s2;
	s1 = det(a.t - a.s, b.s - a.s);
	s2 = det(a.t - a.s, b.t - a.s);
	//情况1共线,面积为0
	if(sgn(s1) == 0 && sgn(s2) == 0){
		//同向或端点交叉 
		return sgn(dot(a.t - a.s, b.s - a.s)) >= 0
		||  sgn(dot(b.t - b.s, a.s - b.s)) >= 0;
	}
	//平行 面积相等
	if(!sgn(s1 - s2) || sgn(s1) == sgn(s2 - s1))return false;
	swap(a, b);
	s1 = det(a.t - a.s, b.s - a.s);
	s2 = det(a.t - a.s, b.t - a.s);
	return sgn(s1) != sgn(s2 - s1);
}
//点到直线的距离 
LD point_to_line(cp p, const line&l){
	if(l.s == l.t) return dis(p, l.s); 
	return fabs(det(p - l.s, p - l.t)) / dis(l.s, l.t);
}
//点到线段的距离 
LD point_to_segment(cp p, const line&l){
	if (sgn(dot(l.s - p, l.t - l.s)) 
    *   sgn(dot(l.t - p, l.t - l.s)) <= 0){
        return point_to_line(p, l);
    }
	return min(dis(p, l.s), dis(p, l.t));
}

//线段到线段的距离
LD segment_to_segment(const line&a, const line&b){
    if (inter_judge(a, b)) return 0;
    return min({point_to_segment(a.s, b), point_to_segment(a.t, b),
    point_to_segment(b.s, a), point_to_segment(b.t, a)});
}

//点在直线的投影点 
point project_to_line(cp a, const line&b){
    //线段退化
    if (b.s == b.t) return b.s;
	point p = b.t - b.s;
	return b.s + p * (dot(a - b.s, p) / p.len2());
}
//A点关于直线B的对称点 
point symmetry_to_line(cp a, const line&b){
	point p = project_to_line(a, b);
	return p * 2 - a;
}


//鸡脚排序求凸包 
vector<point> graham(vector<point> a){
	if(a.size() <= 2) return a;//或return {}
    // 鸡脚排序写法(ρ,r)
    sort(a.begin(), a.end(), [&](point u, point v){
        bool uq = u.quad(), vq = v.quad();
        if (uq != vq) return uq < vq;
        int flag = sgn(det(u, v));
		if (flag != 0) return flag > 0;
        else return sgn(u.len2() - v.len2()) < 0;
	}); 
    // 左下角基准点写法
	// point base = *min_element(a.begin(), a.end());
	// sort(a.begin(), a.end(), [&](point u, point v){
	// 	int s = sgn(det(u - base, v - base));
	// 	if (s) return s > 0;
	// 	else return sgn(dis(u, base) - dis(v, base)) < 0;
	// }); 
	vector<point>res;
	for(auto i : a){
        int n = res.size();
		// 严格凸包 (0, π)
		while(n > 1 && !turn_left(res[n - 2], res[n - 1], i)){
            res.pop_back();
            n--;
        }
		res.push_back(i);
	}
	return res;//或在res.size()<=2时return {}
} 
//字典序排序求下上壳
vector<point> andrew(vector<point> a){
	if(a.size() <= 2) return a;//或return {}
	sort(a.begin(), a.end());
	vector<point> res;
	for(int i = 0; i < a.size(); i++){
        int n = res.size();
		// 严格凸包 (0, π)
		// 求非严格凸包 (0, π] 需要去重
		while(n > 1 && !turn_left(res[n - 2], res[n - 1], a[i])){
            res.pop_back();
            n--;
        }
		res.push_back(a[i]);
	}
	int s1 = res.size();
	//最后一个点在数组内 
	for(int i=(int)a.size() - 2; i >= 0; i--){
        int n = res.size();
		while(n > s1 && !turn_left(res[n - 2], res[n - 1], a[i])){
            res.pop_back();
            n--;
        }
		res.push_back(a[i]);
	}
	//初始点被加了两遍，所以弹出 
	res.pop_back(); 
	return res; //或在res.size()<=2时return {}
} 
// 简单多边形求面积
LD area(vector<point>&p) {
	LD res = 0;
	int n = p.size();
	for (int i = 0; i < n; i ++) {
		res += det(p[i], p[(i + 1) % n]);
	}
	return res / 2;
}
//判断点是否在简单多边形内 
bool in_polyon(cp p, vector<point>&ps){
	int n = ps.size(),res = 0;
	for(int i = 0; i < n; i ++){
		point u = ps[i], v = ps[(i + 1) % n];
		//在凸包边上   
		if(point_on_segment(p, line(u, v))) return true;
		if(sgn(u.y - v.y) >= 0) swap(u, v);
		//p (u.y, v.y]
		if(sgn(p.y - u.y) <= 0 || sgn(p.y - v.y) > 0) continue;
		//找到p位于u,v之间的情况
		res ^= sgn(det(u - p, v - p)) > 0;
	}
	return res;
}
//用一条直线割凸包逆时针方向半部分, 代替半平面交
vector<point> convex_cut(vector<point>&p, point q1, point q2) {
	vector<point> res;
	int n = p.size();
	for (int i = 0; i < n; i ++) {
		point p1 = p[i], p2 = p[(i + 1) % n];
		int d1 = crossop(q1, q2, p1), d2 = crossop(q1, q2, p2);
		//在逆时针方向
		if (d1 >= 0) res.push_back(p1);
		//相交的点
		if (d1 * d2 < 0) res.push_back(line_intersect({p1, p2}, {q1, q2}));
	}
	return res;
}
//凸包直径/旋转卡壳
// 最长直径一定是用平行线夹住的点之间的距离
LD convex_diameter(vector<point>&ps){
	int n = ps.size();
	if(n <= 1) return 0;
	int minp = min_element(ps.begin(), ps.end()) - ps.begin();
	int maxp = max_element(ps.begin(), ps.end()) - ps.begin();
	LD res = dis(ps[minp], ps[maxp]);
	int i = minp, j = maxp;
	do {//角度更小的指针先动
		if(det(ps[(i + 1) % n] - ps[i], ps[( j + 1) % n] - ps[j]) >= 0){
			(++ j) %= n;
		}else (++ i) %= n;
		res = max(res, dis(ps[i], ps[j]));
	} while (i != minp || j != maxp);
	return res; 
} 
 
struct circle{
	point o;
	LD r;
	circle(){
	}
	circle(point o, LD r){
		this -> o = o;
		this -> r = r;
	} 
};
//判断两个圆的位置关系
int circles_type(const circle&a, const circle&b) {
	LD d = (a.o - b.o).len();
	if (sgn(d - (a.r + b.r)) == 1) return 4; //相离
	if (sgn(d - (a.r + b.r)) == 0) return 3; //外切
	if (sgn(d - abs(a.r - b.r)) == 1) return 2; //相交
	if (sgn(d - abs(a.r - b.r)) == 0) return 1; //内切
	return 0; //包含
}

//判断是否在园内 
bool in_circle(cp a, const circle&b){
	return sgn(b.r - dis(a, b.o)) >= 0;
}
//过两点的最小圆 
circle make_circle(cp a, cp b){
	point p = (a + b) / 2;
	return {p, dis(a, b) / 2};
}
//三点确定一个圆，采用两中垂线确定圆心 
circle make_circle(cp a, cp b, cp c){
	point p=(a + b) / 2, q = (a + c) / 2;
	point o = line_intersect({p, p + (b - a).rot90()}, {q, q + (c - a).rot90()});
	return circle(o,dis(a,o));
}
//直线和圆交点 
vector<point>line_circle_intersect(const line&a, const circle&b){
	if(sgn(point_to_line(b.o, a) - b.r) > 0)return {};
	point m=project_to_line(b.o, a);
	LD x=sqrt(squ(b.r) - (m-b.o).len2());
	point dr=(a.t - a.s).unit() * x;
	if(dr < point(0,0)) dr = dr * (-1);
	return {m - dr, m + dr};//p1 -> p2
} 
// 圆相交点
vector<point>circles_intersect(const circle&a, const circle&b){
	//不能为同一个圆
	assert(!(a.o == b.o && a.r == b.r));
	int type = circles_type(a, b);
	if (type == 4 || type == 0) return {};
	LD d = min((a.o - b.o).len(), a.r + b.r);
	LD y = (a.r * a.r + d * d - b.r * b.r) / (2 * d), x = sqrt(a.r * a.r - y * y);
	point dr = (b.o - a.o).unit();
	point q1 = a.o + dr * y, q2 = dr.rot90() * x;
	return {q1 - q2, q1 + q2}; //基于圆a
} 

//圆切线
//默认外切线 内切线b.r = -b.r 点切线 b.r = 0 
vector<pair<point, point>> circles_tangent(const circle&a, const circle&b) {
	point d = b.o - a.o;
	LD dr = a.r - b.r, d2 = d.len2(), h2 = d2 - dr * dr;
	if (sgn(d2) == 0 || sgn(h2) < 0) return {};
	h2 = max(0.0, h2);
	vector<pair<point, point>> ret;
	for (LD sign : {-1, 1}) {
		point v = (d * dr + d.rot90() * sqrt(h2) * sign) / d2;
		ret.push_back({a.o + v * a.r, b.o + v * b.r});
	}
	if (sgn(h2) == 0) ret.pop_back();
	return ret;
}
//内心
point incenter(cp a, cp b, cp c) {
	LD A = (b - c).len(), B = (c - a).len(), C = (a - b).len();
	return (a * A + b * B +  c * C) / (A + B + C);
}
//外心
point circumcenter(cp a,cp b, cp c) {
	point bb = b - a, cc = c - a;
	LD db = bb.len2(), dc = cc.len2(), d = 2 * det(bb, cc);
	return a - point(bb.y * dc - cc.y * db, cc.x * db - bb.x * dc) / d;
}
//垂心
point othrocenter(cp a, cp b, cp c) {
	point ba = b - a, ca = c - a, bc = b - c;
	LD Y = ba.y * ca.y + bc.y, A = ca.x + ba.y - ba.x * ca.y;
	LD x0 = (Y + ca.x * ba.y * b.x - ba.x * ca.y * c.x) / A;
	LD y0 = -ba.x * (x0 - c.x) / ba.y + ca.y;
	return {x0, y0};
}
// 最小圆覆盖
circle min_circle(vector<point> ps) {
	random_shuffle(ps.begin(), ps.end());
	int n = ps.size();
	point o = ps[0];
	LD r = 0;
	for (int i = 1; i < n; i ++) if((o - ps[i]).len() > r + eps) {
		o = ps[i], r = 0;
		for (int j = 0; j < i; j ++) if ((o - ps[j]).len() > r + eps) {
			o = (ps[i] + ps[j]) / 2;
			r = (o - ps[i]).len();
			for (int k = 0; k < j; k ++) if ((o - ps[k]).len() > r + eps) {
				o = circumcenter(ps[i], ps[j], ps[k]);
				r = (o - ps[i]).len();
			}
		}
	}
	return {o, r};
}
//求op1 逆时针 到op2的夹角
LD rad(cp p1, cp p2) {
	return atan2(det(p1, p2), dot(p1, p2));
}

//以(0, 0)为圆心和三角形的一个顶点，求圆和三角形的有向交面积
LD area_circle_triangle(LD r, cp p1, cp p2) {
	vector<point> is = line_circle_intersect({p1, p2},{{0,0},r});
	if (!is.size()) return r * r * rad(p1, p2) / 2;
	bool b1 = sgn(p1.len2() - r * r) == 1, b2 = sgn(p2.len2() - r * r) == 1;
	if (b1 && b2) {
		// 如果点都在原外
		if (sgn(dot(p1 - is[0], p2 - is[0])) <= 0 &&
		sgn(dot(p1 - is[1], p2 - is[1])) <= 0) {
			return r * r * (rad(p1, is[0]) + rad(is[1], p2)) / 2 + det(is[0], is[1]) / 2;
		} else return r * r * rad(p1, p2) / 2;
	}
	//有一个点在外面
	if (b1) return (r * r * rad(p1, is[0]) + det(is[0], p2)) / 2;
	if (b2) return (det(p1, is[1]) + r * r * rad(is[1], p2)) / 2;
	return det(p1, p2) / 2;
}
```
