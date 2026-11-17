---
title: "数据结构模板"
description: "线段树、树状数组、PBDS 等数据结构的实现与常见技巧。"
date: 2026-10-14
tags: [数据结构, 模板, C++]
---
## pbds

万能头文件为
` #include<bits/extc++.h>`
命名空间为
`using namespace __gnu_pbds;`

### gp_hash_table

类似unordered_map，不过没有count函数，可以用find替代

```c++
#include<iostream>
#include<ext/pb_ds/assoc_container.hpp>
#include<ext/pb_ds/hash_policy.hpp>

using namespace std;
using namespace __gnu_pbds;

int main(){
    int n;
    scanf("%d",&n);
    gp_hash_table<int,int>mp;
    while(n--){
        char op[2];
        int x;
        scanf("%s%d",op,&x);
        if(*op=='I'){
            mp[x]=x;
        }else{
            if(mp.find(x)!=mp.end())puts("Yes");
            else puts("No");
        }
    }
}
```

### tree

类似于set/map，不支持重复元素，所以一般使用时用pii
支持查询第k大和某数的排名

```c++
#include<bits/stdc++.h>
#include<ext/pb_ds/assoc_container.hpp>
#include<ext/pb_ds/tree_policy.hpp>

using namespace __gnu_pbds;
using namespace std;

#define fi first
#define se second
#define lowbit(x) ((x)&(-x))
#define endl '\n'

const int N=1e5+10,mod=1e9+7,INF=0x3f3f3f3f;
typedef long long ll;
typedef __int128 lll;
typedef pair<int,int> pii;
ll t,n,m,k;

int main(){
    ios::sync_with_stdio(0);
    cin.tie(0);
    cout.tie(0); 
    tree<pii,null_type,less<pii>,rb_tree_tag,tree_order_statistics_node_update>st;//还可以当map用
    cin>>m>>n;
    while(m--){
        int x;
        cin>>x;
        st.insert({x,n+2*m});
    }
    int last=0,ans=0;
    while(n--){
        int op,x;
        cin>>op>>x;
        x^=last;
        if(op==1)st.insert({x,n}); //插入
        else if(op==2){            //删除操作
            auto it=st.lower_bound({x,0});
            if(it!=st.end())st.erase(it);
        }else if(op==3)last=st.order_of_key({x,0})+1; // 查询x的排名 多少比{x, 0} 小
        else if(op==4)last=st.find_by_order(x-1)->fi; // 查询第x小的数
        else if(op==5)last=(--st.lower_bound({x,0}))->fi; //查询x前驱
        else last=st.lower_bound({x+1,0})->fi;   //查询x后继
        if(op>2)ans^=last;
    }
    cout<<ans<<endl;
    return 0;
}
```

### heap

可并堆，相较于std中的priority_queue，有用的功能多了个$O(logn)$合并堆的功能

```c++
#include<iostream>
#include<bits/stdc++.h>
#include<ext/pb_ds/assoc_container.hpp>
#include<ext/pb_ds/priority_queue.hpp>

#define fi first
#define se second

using namespace __gnu_pbds;
using namespace std;

const int N=1e5+10;
int q[N];
typedef pair<int,int> pii;
__gnu_pbds::priority_queue<pii,greater<pii>>heap[N];
bool death[N];

int f(int x){
    if(q[x]!=x){
        q[x]=f(q[x]);
    }
    return q[x];
}

int main(){
    int n,m;
    scanf("%d%d",&n,&m);
    for(int i=1;i<=n;i++)q[i]=i;
    for(int i=1;i<=n;i++){
        int x;
        scanf("%d",&x);
        heap[i].push({x,i});
    }
    while(m--){
        int op,x;
        scanf("%d%d",&op,&x);
        if(op==1){
            int y;
            scanf("%d",&y);
            if(death[x]||death[y])continue;
            int fx=f(x),fy=f(y);
            if(fx==fy)continue;
            q[fx]=fy;
            //把fx加入fy中，并清空fx
            heap[fy].join(heap[fx]);
        }else{
            if(death[x]){
                cout<<-1<<endl;
                continue;
            }
            int fx=f(x);
            auto t=heap[fx].top();
            heap[fx].pop();
            cout<<t.fi<<endl;
            death[t.se]=true;
        }
    }
    return 0;
}
```

## 线段树

### 单点修改 区间查询

```cpp
struct Tr{
    int l, r;
    ll sum;
}tr[4*N];

void pushup(Tr&rt, Tr&l, Tr&r){
    rt.sum = l.sum + r.sum;
}

void pushup(int u){
    pushup(tr[u], tr[u << 1], tr[u << 1 | 1]);
}

void build(int u, int l, int r){
    if(l == r){
        tr[u]={l, r, a[l]};
        return;
    }
    tr[u] = {l, r};
    int mid = l + r >> 1;
    build(u << 1, l, mid);
    build(u << 1 | 1, mid + 1, r);
    pushup(u);
}

void update(int u, int x, int d){
    if (x <= tr[u].l && tr[u].r <= x) {
        tr[u].sum += d;
        return;
    }
    int mid = tr[u].l + tr[u].r >> 1;
    if (x <= mid) update(u << 1, x, d);
    if (x > mid) update(u << 1 | 1, x, d);
    pushup(u);
}

Tr query(int u, int l, int r){
    if (l <= tr[u].l && tr[u].r <= r) return tr[u];
    int mid = tr[u].l + tr[u].r >> 1;
    if(r <= mid) return query(u << 1, l, r);
    else if(l > mid) return query(u << 1 | 1, l, r);
    else {
        Tr res, left = query(u << 1, l, r), right = query(u << 1 | 1, l, r);
        pushup(res, left, right);
        return res;
    }
}
```



```cpp
//a的需要从下标为1开始
template<class Info> struct SegmentTree {
    vector<Info> info;
    Info ans;
    int n;
    template<class T>
    SegmentTree(int _n, vector<T> a): info(4 * _n + 10) {
        n = _n;
        function<void(int, int, int)> build = [&](int u, int l, int r){
            if(l == r){
                info[u] = a[l];
                return;
            }
            int mid = l + r >> 1;
            build(u << 1, l, mid);
            build(u << 1 | 1, mid + 1, r);
            pushup(u);
        };
        build(1, 1, n);
    }
    void pushup(int u){
        info[u] = info[u << 1] + info[u << 1 | 1];
    }
    void update(int x, const Info&v){
        update(x, v, 1, 1, n);
    }
    void update(int x, const Info&v, int u, int l, int r) {
        if (x <= l && r <= x) {
            info[u] += v;
            return;
        }
        int mid = l + r >> 1;
        if (x <= mid) update(x, v, u << 1, l, mid);
        if (x > mid) update(x, v, u << 1 | 1, mid + 1, r);
        pushup(u);
    }
    Info query(int ql, int qr) {
        return query(ql, qr, 1, 1, n);
    }
    Info query(int ql, int qr, int u, int l, int r){
        if (ql <= l && r <= qr) {
            return info[u];
        }
        int mid = l + r >> 1;
        if (qr <= mid) return query(ql, qr, u << 1, l, mid);
        else if (ql > mid) return query(ql, qr, u << 1 | 1, mid + 1, r);
        else return query(ql, qr, u << 1, l, mid) + query(ql, qr, u << 1 | 1, mid + 1, r);
    } 
    // 找到满足check条件的最右的位置 
    // F:  [](Info x){}
    template<class F>
    int get(int ql, int qr, F&&f, const Info&init) {
        ans = init;
        return get(ql, qr, f, 1, 1, n);
    }
    template<class F>
    int get(int ql, int qr, F&&f, int u, int l, int r){
        int mid = (l + r) / 2;
        if(ql <= l && r <= qr){
            Info t = ans + info[u]; 
            if (f(t)) {
                ans = t;
                return r;
            }
            if(l == r) return l - 1;
            int res = get(ql, qr, f, u << 1, l, mid);
            if(res == mid) res = get(ql, qr, f, u << 1 | 1, mid + 1, r);
            return res;
        }
        if(qr <= mid) return get(ql, qr, f, u << 1, l, mid);
        else if(ql > mid) return get(ql, qr, f, u << 1 | 1, mid + 1, r);
        else {
            int res = get(ql, qr, f, u << 1, l, mid);
            if (res == mid) res = get(ql, qr, f, u << 1 | 1, mid + 1, r);
            return res;
        }
    }
};


struct Info{
    //TODO
    
    Info operator+(const Info &b) const{
        auto c = *this;
        return c += b;
    }
    Info&operator+=(const Info &b){
        // TODO (l, r) {}会调用构造函数
        *this = {};
        return *this;
    }

};
```





### 区间修改 区间查询

```cpp
struct Tr{
    int l, r;
    ll sum;
    int d;
}tr[4*N];

void pushup(Tr&rt, Tr&l, Tr&r){
    rt.sum = l.sum + r.sum;
}
void pushup(int u){
    pushup(tr[u], tr[u << 1], tr[u << 1 | 1]);
}
void pushdown(int u){
    auto&rt = tr[u], &left = tr[u << 1], &right = tr[u << 1 | 1];
    if(rt.d){
        left.d += rt.d, left.sum += (ll)(left.r - left.l + 1) * rt.d;
        right.d += rt.d, right.sum += (ll)(right.r - right.l + 1) * rt.d;
        rt.d = 0;
    }
}
void build(int u, int l, int r){
    if(l == r){
        tr[u]={l, r, a[l], 0};
        return;
    }
    tr[u] = {l, r};
    int mid = l + r >> 1;
    build(u << 1, l, mid);
    build(u << 1 | 1, mid + 1, r);
    pushup(u);
}
void update(int u, int l, int r, int d){
    if (l <= tr[u].l && tr[u].r <= r) {
        tr[u].d += d;
        tr[u].sum += (ll)(tr[u].r - tr[u].l + 1) * d;
        return;
    }
    pushdown(u);
    int mid = tr[u].l + tr[u].r >> 1;
    if (l <= mid) update(u << 1, l, r, d);
    if (r > mid) update(u << 1 | 1, l, r, d);
    pushup(u);
}
Tr query(int u, int l, int r){
    if (l <= tr[u].l && tr[u].r <= r) return tr[u];
    pushdown(u);
    int mid = tr[u].l + tr[u].r >> 1;
    ll sum = 0;
    if(r <= mid) return query(u << 1, l, r);
    else if(l > mid) return query(u << 1 | 1, l, r);
    else {
        Tr res, left = query(u << 1, l, r), right = query(u << 1 | 1, l, r);
        pushup(res, left, right);
        return res;
    }
}
```

```cpp
//vector 下标从1开始
template<class Info, class Tag> struct LazySegmentTree {
    vector<Info> info;
    vector<Tag> tag;
    Info ans;
    int n;
    template<class T>
    LazySegmentTree(int _n, vector<T> a): info(4 * _n + 10), tag(4 * _n + 10) {
        n = _n;
        function<void(int, int, int)> build = [&](int u, int l, int r){
            if(l == r){
                info[u] = {a[l]};
                return;
            }
            int mid = l + r >> 1;
            build(u << 1, l, mid);
            build(u << 1 | 1, mid + 1, r);
            pushup(u);
        };
        build(1, 1, n);
    }
    void pushup(int u){
        info[u] = info[u << 1] + info[u << 1 | 1];
    }
    void pushtag(int u, const Tag &v) {
        info[u].apply(v);
        tag[u].apply(v);
    }
    void pushdown(int u){
        pushtag(u << 1, tag[u]);
        pushtag(u << 1 | 1, tag[u]);
        tag[u] = Tag();
    }
    void update(int ql, int qr, const Tag &v) {
        update(ql, qr, v, 1, 1, n);
    }
    void update(int ql, int qr, const Tag &v, int u, int l, int r){
        if (ql <= l && r <= qr) {
            pushtag(u, v);
            return;
        }
        pushdown(u);
        int mid = l + r >> 1;
        if (ql <= mid) update(ql, qr, v, u << 1, l, mid);
        if (qr > mid) update(ql, qr, v, u << 1 | 1, mid + 1, r);
        pushup(u);
    }
    Info query(int ql, int qr) {
        return query(ql, qr, 1, 1, n);
    }
    Info query(int ql, int qr, int u, int l, int r){
        if (ql <= l && r <= qr) {
            return info[u];
        }
        pushdown(u);
        int mid = l + r >> 1;
        if (qr <= mid) return query(ql, qr, u << 1, l, mid);
        else if (ql > mid) return query(ql, qr, u << 1 | 1, mid + 1, r);
        else return query(ql, qr, u << 1, l, mid) + query(ql, qr, u << 1 | 1, mid + 1, r);
    } 
    // 找到满足check条件的最右的位置
    // F:  [](Info x){}
    template<class F>
    int get(int ql, int qr, F&&f, const Info&init) {
        ans = init;
        return get(ql, qr, f, 1, 1, n);
    }
    template<class F>
    int get(int ql, int qr, F&&f, int u, int l, int r){
        int mid = (l + r) / 2;
        if(ql <= l && r <= qr){
            Info t = ans + info[u]; 
            if (f(t)) {
                ans = t;
                return r;
            }
            if(l == r) return l - 1;
            //有懒标记这里需要pushdown
            pushdown(u);
            int res = get(ql, qr, f, u << 1, l, mid);
            if(res == mid) res = get(ql, qr, f, u << 1 | 1, mid + 1, r);
            return res;
        }
        //有懒标记这里需要pushdown
        pushdown(u);
        if(qr <= mid) return get(ql, qr, f, u << 1, l, mid);
        else if(ql > mid) return get(ql, qr, f, u << 1 | 1, mid + 1, r);
        else {
            int res = get(ql, qr, f, u << 1, l, mid);
            if (res == mid) res = get(ql, qr, f, u << 1 | 1, mid + 1, r);
            return res;
        }
    }
};

struct Tag{
    // TODO
    
    void apply(const Tag &b) & {
        
    }
};

struct Info{
    // TODO
    
    Info operator+(const Info &b) const{
        auto c = *this;
        return c += b;
    }
    Info&operator+=(const Info &b){
        // TODO (l, r) {}会调用构造函数
        *this = {};
        return *this;
    }
    void apply(const Tag &b) & {
        // TODO
        
    }
};
```



### 易错点

- 询问区间越界` query(int u,int l,int r) query(u,l+1,r)` 这里要判断是否在区间内
- pushup使用了$l,r$但是没有赋值
- 权值线段树需考虑某个数有多个的情况

```cpp
struct Tr{
    int l, r;
    Matrix c;
}tr[4*N];
auto res = query(1, uid[1], uid[ed[1]]);//局部变量被销毁，指针变为空指针
cout << max(res.c.mat[0][0], res.c.mat[1][0]) << endl;
```

### 扫描线

#### 二维数点

```cpp
typedef long long ll;
typedef pair<int,int> pii;
const int N=5e5+10,M=2e5+10,mod=998244353,INF=0x3f3f3f3f;
int n, m, k;
int tr[N];

void insert(int x, int c) {
    for(;x <= m; x += lowbit(x)) {
        tr[x] += c;
    }
}

int sum(int x){
    int res = 0;
    for (; x; x -= lowbit(x)) {
        res += tr[x];
    }
    return res;
}


void solve() {
    int q;
    cin >> n >> q;
    // y 0/1/2:insert/+/- x qid
    vector<array<int, 4>> event;
    vector<int> vx;
    vector<int> res(q);
    for (int i = 0; i < n; i++){
        int x, y;
        cin >> x >> y;
        event.push_back({y, 0, x});
        vx.push_back(x);
    }
    for (int i = 0; i < q; i++) {
        int x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        event.push_back({y2, 1, x2, i});
        event.push_back({y2, 2, x1 - 1, i});
        event.push_back({y1 - 1, 2, x2, i});
        event.push_back({y1 - 1, 1, x1 - 1, i});
    }
    sort(event.begin(), event.end());
    sort(vx.begin(), vx.end());
    vx.erase(unique(vx.begin(), vx.end()), vx.end());
    m = vx.size();
    for (auto&e:event) {
        if (e[1] == 0) {
            int pos = lower_bound(vx.begin(), vx.end(), e[2]) - vx.begin() + 1;
            insert(pos, 1);
        } else {
            int pos = upper_bound(vx.begin(), vx.end(), e[2]) - vx.begin();
            res[e[3]] += (e[1] == 1 ? 1 : -1) * sum(pos);
        }
    }
    for (int i = 0; i < q; i++) {
        cout << res[i] << endl;
    }
}
```



#### 面积并

```cpp
int n;
vector<double>pos;

struct E{
    double x, y1, y2;
    int k;
    bool operator<(const E& w)const {
        return x < w.x;
    }
}e[2 * N];

struct Tr{
    int l ,r;
    int cnt;
    double len;
}tr[8 * N];

int f(double x){
    return lower_bound(pos.begin(), pos.end(), x) - pos.begin();
}

void pushup(int u) {
    if (tr[u].cnt) {
        //维护的是区间个数[l,r] 对应 [l,r - 1]
        tr[u].len = pos[tr[u].r + 1] - pos[tr[u].l];
    } else if (tr[u].l != tr[u].r) {
        tr[u].len = tr[u << 1].len + tr[u << 1 | 1].len;
    } else {
        //防止多测数据影响
        tr[u].len = 0;
    }
}

void build(int u, int l, int r) {
    tr[u] = {l, r, 0, 0};
    if (l == r) return;
    int mid = (l + r) / 2;
    build(u << 1, l, mid),build(u << 1 | 1, mid + 1, r);
}

void modify(int u, int l, int r, int d) {
    if (l <= tr[u].l && tr[u].r <= r) {
        tr[u].cnt += d;
        //更新节点答2案
        pushup(u);
        return;
    }
    int mid = (tr[u].l + tr[u].r) / 2;
    if (l <= mid) modify(u << 1, l, r, d);
    if (r > mid) modify(u << 1 | 1, l, r, d);
    pushup(u);
}

int main() {
    int t = 0;
    while (scanf("%d", &n), n) {
        pos.clear();
        double x1, y1, x2, y2;
        for(int i = 0, j = 0; i < n; i ++){
            scanf("%lf%lf%lf%lf", &x1, &y1, &x2, &y2);
            e[j ++] = {x1, y1, y2, 1};
            e[j ++] = {x2, y1, y2, -1};
            pos.push_back(y1), pos.push_back(y2);
        }
        sort(pos.begin(), pos.end());
        pos.erase(unique(pos.begin(), pos.end()), pos.end());
        sort(e, e + 2 * n);
        double res = 0;
        //n个点 n-1个区间 
        build(1, 0 , pos.size() - 2)；
        //只询问根节点 并且modify成对出现 无须pushdown
        for (int i = 0; i < 2 * n; i ++) {
            if (i) res += tr[1].len * (e[i].x - e[i - 1].x);
            modify(1, f(e[i].y1), f(e[i].y2) - 1, e[i].k);
        }
        printf("Test case #%d\n", ++ t);
        printf("Total explored area: %.2lf \n\n", res);
    } 
    return 0;
}
```



### 线段树二分

整体上和query的写法很类似，这里是二分找到左区间的右端点位置

直接查找位置

```c++
int get(int u, int l, int r, int d){
    if(l <= tr[u].l && tr[u].r <= r){
        //检查有没有答案
        if (check()) return -1;
        else {
            if (tr[u].l == tr[u].r){
                return tr[u].l;
            }
            //pushdown
            //如果左边有答案就返回左边
            if (tr[u << 1]) return get(u << 1, l, r, d);
            else return get(u << 1 | 1, l, r, d);  
        }
    }
    //pushdown
    int mid = (tr[u].l + tr[u].r) / 2;
    if (r <= mid) return get(u << 1, l, r, d);
    else if (l > mid) return get( u << 1 | 1, l, r, d);
    else {
        int res = get(u << 1, l, r, d);
        if(res == tr[u << 1].r) return get(u << 1 | 1, l, r, d);
        return res;
    }
}
```

需合并区间更新信息

```c++
int get(int u, int l, int r, int d){
    int mid = (tr[u].l + tr[u].r) / 2;
    //
    if(l <= tr[u].l && tr[u].r <= r){
        //用临时变量存一下更新值
        int tmax = max(ma, tr[u].x), tmin = min(mi, tr[u].y);
        //check一下，如果满足条件直接退出
        if (tmax - tmin <= d){
            ma = tmax;
            mi = tmin;
            //区间右边界
            return tr[u].r;
        }
        //否则先递归左树，等待答案后递归右树
        if(tr[u].l == tr[u].r) return tr[u].l - 1;
        //有懒标记这里需要pushdown
        int res = get(u << 1, l, r, d);
        //如果发现区间还可以延伸
        if(res == mid) res = get(u << 1 | 1, l, r, d);
        return res;
    }
    //有懒标记这里需要pushdown
    if(r <= mid) return get(u << 1, l, r, d);
    else if(l > mid) return get(u << 1 | 1, l, r, d);
    else {
        int res = get(u << 1, l, r, d);
        if (res == mid) res = get(u << 1 | 1, l, r, d);
        return res;
    }
}
```

### 权值线段树

将所有数离散化，每个位置对应上的节点里面维护个数和总和，要注意某些数有多个的情况。

### 线段树分治

用于处理在不同时间时不同状态的询问，将询问放在线段树叶子节点上。

```cpp
int n, m, k;
struct Tr{
    int l, r;
    vector<pii> a;
}tr[4 * N];

void build(int u, int l, int r) {
    tr[u] = {l, r};
    if (l == r) return;
    int mid = l + r >> 1;
    build(u << 1, l, mid), build(u << 1 | 1, mid + 1, r);
}

void update(int u, int l, int r, pii x) {
    if (l <= tr[u].l && tr[u].r <= r) {
        tr[u].a.push_back(x);
        return;
    }
    int mid = tr[u].l + tr[u].r >> 1;
    if (l <= mid) update(u << 1, l, r, x);
    if (r > mid) update(u << 1 | 1, l, r, x);
}

void dfs(int u, int l, int r){
    int tt = dsu.tt;
    bool flag = true;
    // 更新
    for (auto [x, y] : tr[u].a) {
        int fx = dsu.find(x), fy = dsu.find(y);
        if (fx == fy) {
            flag = false;
            for (int i = l; i <= r; i++) {
                cout << "No\n";
            }
            break;
        }
        dsu.merge(x, y + n), dsu.merge(x + n, y);
    }  
    // 递归处理询问
    if (flag) {
        if (l == r) cout << "Yes\n";
        else {
            int mid = l + r >> 1;
            dfs(u << 1, l, mid), dfs(u << 1 | 1, mid + 1, r);
        }
    }
    // 撤销更新
    dsu.roll(tt);
}

void solve() {
    cin >> n >> m >> k;
    for (int i = 1; i <= 2 * n; i++) dsu.insert();
    build(1, 1, k);
    for(int i = 1; i <= m; i++) {
        int x, y, l, r;
        cin >> x >> y >> l >> r;
        update(1, l + 1, r, {x, y});
    }
    dfs(1, 1, k);
}
```

### 可持久化线段树

```cpp
struct Tr{
    int l, r;           
    int cnt;
}tr[N * 21];
int idx;

int clone(int u) {
    tr[++idx] = tr[u];
    return idx;
}

int build(int l, int r) {
    int u = ++idx;
    if (l < r) {
        int  mid = (l + r) / 2;
        tr[u].l = build(l, mid);
        tr[u].r = build(mid + 1, r);
    }
    return u;
}

int update(int u, int l, int r, int id) {
    u = clone(u);
    tr[u].cnt++;
    if (l < r) {
        int mid = (l + r) / 2;
        if (id <= mid) tr[u].l = update(tr[u].l, l, mid, id);
        else tr[u].r = update(tr[u].r, mid + 1, r, id);
    }
    return u;
}

int query(int u, int v, int l, int r, int k) {
    if (l < r) {
        int sum = tr[tr[v].l].cnt - tr[tr[u].l].cnt;
        int mid = (l + r) / 2;
        if (k <= sum) return query(tr[u].l, tr[v].l, l, mid, k);
        else return query(tr[u].r, tr[v].r, mid + 1, r, k - sum);
    } else {
        return l;
    }
}

void solve() {
    cin >> n >> m;
    vector<int> a(n + 1), b;
    vector<int> rt(n + 1);
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        a[i] = x;
        b.push_back(x);
    }
    sort(b.begin(), b.end());
    b.erase(unique(b.begin(), b.end()), b.end());
    int len = b.size();
    rt[0] = build(1, len);
    for (int i = 1; i <= n; i++) {
        int pos = lower_bound(b.begin(), b.end(), a[i]) - b.begin() + 1;
        rt[i] = update(rt[i - 1], 1, len, pos);
    }
    while (m--) {
        int l, r;
        cin >> l >> r >> k;
        cout << b[query(rt[l - 1], rt[r], 1, len, k) - 1] << endl;
    }
}
```



### 吉司机线段树

```cpp
// 定义 Tag 结构体
struct Tag{
    // add1: 当前最大值的加法标记
    // add2: 当前非最大值的加法标记
    // add3: 历史上最大值的加法标记的最大值 (History Max Add Tag for Max)
    // add4: 历史上非最大值的加法标记的最大值 (History Max Add Tag for Non-Max)
    ll add1, add2, add3, add4;

    // 初始化为 0
    Tag() : add1(0), add2(0), add3(0), add4(0) {}
    Tag(ll a, ll b, ll c, ll d) : add1(a), add2(b), add3(c), add4(d) {}

    // 判断是否有标记需要下传
    bool has_tag() const {
        return add1 != 0 || add2 != 0 || add3 != 0 || add4 != 0;
    }

    // Tag 合并逻辑 (Apply Tag b onto this)
    // 这里的逻辑是：将 b 操作叠加在当前 pending 的操作之上
    void apply(const Tag &b) {
        // 更新历史最大加法标记
        // 新的历史最大 = max(旧的历史最大, 旧的当前值 + 新的历史最大)
        add3 = max(add3, add1 + b.add3);
        add4 = max(add4, add2 + b.add4);
        
        // 更新当前加法标记
        add1 += b.add1;
        add2 += b.add2;
    }
};

// 定义 Info 结构体
struct Info{
    ll sum;
    int len;
    int maxa; // 区间最大值 A
    int cnt;  // 最大值的个数
    int se;   // 严格次大值
    int maxb; // 区间历史最大值 B

    static Info create(ll x) {
        // 初始化：次大值为 -INF，历史最大值等于当前值
        return {x, 1, (int)x, 1, -INF, (int)x};
    }

    Info operator+(const Info &b) const{
        Info res;
        res.sum = sum + b.sum;
        res.len = len + b.len;
        res.maxb = max(maxb, b.maxb); // 历史最大值取两边最大
        
        // 维护 maxa, se, cnt
        if (maxa == b.maxa) {
            res.maxa = maxa;
            res.cnt = cnt + b.cnt;
            res.se = max(se, b.se);
        } else if (maxa > b.maxa) {
            res.maxa = maxa;
            res.cnt = cnt;
            res.se = max(se, b.maxa); // 另一边的最大值可能是次大值
        } else {
            res.maxa = b.maxa;
            res.cnt = b.cnt;
            res.se = max(maxa, b.se);
        }
        return res;
    }

    // 节点应用 Tag
    void apply(const Tag &b) {
        // 更新 Sum: 最大值加 add1，其余加 add2
        sum += (ll)cnt * b.add1 + (ll)(len - cnt) * b.add2;
        
        // 更新历史最大值 B
        // 当前节点 B = max(当前 B, 当前 A + 历史加法标记)
        maxb = max(maxb, maxa + (int)b.add3);
        
        // 更新当前最大值 A
        maxa += b.add1;
        
        // 更新次大值 (注意次大值可能不存在，即 -INF)
        if (se != -INF) se += b.add2;
    }
};

template<class Info, class Tag> struct LazySegmentTree {
    vector<Info> info;
    vector<Tag> tag;
    int n;
    
    template<class T>
    LazySegmentTree(int _n, vector<T> a): info(4 * _n + 10), tag(4 * _n + 10) {
        n = _n;
        function<void(int, int, int)> build = [&](int u, int l, int r){
            if(l == r){
                info[u] = Info::create(a[l]);
                return;
            }
            int mid = l + r >> 1;
            build(u << 1, l, mid);
            build(u << 1 | 1, mid + 1, r);
            pushup(u);
        };
        build(1, 1, n);
    }

    void pushup(int u){
        info[u] = info[u << 1] + info[u << 1 | 1];
    }

    void pushtag(int u, const Tag &v) {
        info[u].apply(v);
        tag[u].apply(v);
    }

    // 重写 pushdown：核心逻辑
    // 需要根据子节点的最大值是否等于父节点的最大值，分发不同的 Tag
    void pushdown(int u){
        // 获取左右儿子的最大值中的最大者，这等同于 info[u] 更新前的最大值
        // 因为我们在 pushup 时保证了 info[u].maxa 是最新的，
        // 但这里我们需要判断左右儿子谁是“最大值持有者”相对于父节点来说。
        // 实际上，直接比较子节点 maxa 和父节点 maxa (推导值) 即可。
        // 更稳妥的方式是看左右儿子谁大。
        int maxn = max(info[u << 1].maxa, info[u << 1 | 1].maxa);
        
        Tag &t = tag[u];
        if (!t.has_tag()) return; // 剪枝

        // 左儿子
        if (info[u << 1].maxa == maxn) {
            pushtag(u << 1, t); // 左儿子包含最大值，接收 add1/add3
        } else {
            // 左儿子全是“非最大值”，全部接收 add2/add4
            pushtag(u << 1, Tag(t.add2, t.add2, t.add4, t.add4));
        }

        // 右儿子
        if (info[u << 1 | 1].maxa == maxn) {
            pushtag(u << 1 | 1, t);
        } else {
            pushtag(u << 1 | 1, Tag(t.add2, t.add2, t.add4, t.add4));
        }

        tag[u] = Tag(); // 清空 Tag
    }

    // 区间加法：op 1
    void update(int ql, int qr, int k) {
        // 普通区间加：最大值和非最大值都加 k
        // 历史加标记也都是 k
        update(ql, qr, Tag(k, k, k, k), 1, 1, n);
    }

    void update(int ql, int qr, const Tag &v, int u, int l, int r){
        if (ql <= l && r <= qr) {
            pushtag(u, v);
            return;
        }
        pushdown(u);
        int mid = l + r >> 1;
        if (ql <= mid) update(ql, qr, v, u << 1, l, mid);
        if (qr > mid) update(ql, qr, v, u << 1 | 1, mid + 1, r);
        pushup(u);
    }

    // 区间取 Min：op 2
    void updatemin(int ql, int qr, int v) {
        updatemin(ql, qr, v, 1, 1, n);
    }

    void updatemin(int ql, int qr, const int &v, int u, int l, int r){
        // 剪枝 1: 如果当前区间最大值已经 <= v，无需操作
        if (v >= info[u].maxa) return;
        
        // 剪枝 2: 如果当前区间被完全覆盖，且 v 严格大于次大值
        // 说明只有最大值会被更新，转化为区间加法操作
        if (ql <= l && r <= qr && v > info[u].se) {
            // 只有最大值变成了 v，增量为 v - maxa
            // 非最大值不变，增量为 0
            int diff = v - info[u].maxa;
            // Tag(max_add, non_max_add, history_max_add, history_non_max_add)
            pushtag(u, Tag(diff, 0, diff, 0)); 
            return;
        }

        // 否则继续递归
        pushdown(u);
        int mid = l + r >> 1;
        if (ql <= mid) updatemin(ql, qr, v, u << 1, l, mid);
        if (qr > mid) updatemin(ql, qr, v, u << 1 | 1, mid + 1, r);
        pushup(u);
    }

    Info query(int ql, int qr) {
        return query(ql, qr, 1, 1, n);
    }

    Info query(int ql, int qr, int u, int l, int r){
        if (ql <= l && r <= qr) {
            return info[u];
        }
        pushdown(u);
        int mid = l + r >> 1;
        if (qr <= mid) return query(ql, qr, u << 1, l, mid);
        else if (ql > mid) return query(ql, qr, u << 1 | 1, mid + 1, r);
        else return query(ql, qr, u << 1, l, mid) + query(ql, qr, u << 1 | 1, mid + 1, r);
    } 
};
```



### 动态开点



### 线段树合并

```cpp
struct Info{
    // TODO

    Info operator+(const Info &b) const{
        auto c = *this;
        return c += b;
    }
    Info&operator+=(const Info &b){
        // TODO
        *this = {};
        return *this;
    }

};

namespace SegT {
    int ls[M], rs[M];
    Info info[M];
    int idx;
    int rt[N]; 
    int vl, vr;
    Info ans;

    void init(int l, int r) {
        vl = l, vr = r;
        idx = 0;
    }

    void pushup(int u) {
        info[u] = info[ls[u]] + info[rs[u]];
    }

    // 插入/修改：只有更新操作需要动态开点
    void update(int x, const Info &v, int &u, int l, int r) {
        if (!u) u = ++idx;
        if (l == r) {
            info[u] += v;
            return;
        }
        int mid = (l + r) >> 1;
        if (x <= mid) update(x, v, ls[u], l, mid);
        else update(x, v, rs[u], mid + 1, r);
        pushup(u);
    }
    void update(int r_id, int x, const Info &v) {
        update(x, v, rt[r_id], vl, vr);
    }

    Info query(int ql, int qr, int u, int l, int r) {
        if (!u || (ql <= l && r <= qr)) {
            return info[u]; 
        }
        int mid = (l + r) >> 1;
        if (qr <= mid) return query(ql, qr, ls[u], l, mid);
        if (ql > mid)  return query(ql, qr, rs[u], mid + 1, r);
        return query(ql, qr, ls[u], l, mid) + query(ql, qr, rs[u], mid + 1, r);
    }
    Info query(int r_id, int ql, int qr) {
        return query(ql, qr, rt[r_id], vl, vr);
    }

    // 线段树内二分：寻找满足 check(ans + info[u]) 为 true 的最右位置
    template<class F>
    int get(int ql, int qr, F &&f, int u, int l, int r) {
        // 如果当前节点为空，直接用默认的 Info 维护贡献
        if (!u) {
            if (f(ans)) {
                return min(qr, r); 
            }
            return max(ql, l) - 1;
        }

        if (ql <= l && r <= qr) {
            Info t = ans + info[u];
            if (f(t)) {
                ans = t;
                return r;
            }
            if (l == r) return l - 1;
            int mid = (l + r) >> 1;
            int res = get(ql, qr, f, ls[u], l, mid);
            if (res == mid) res = get(ql, qr, f, rs[u], mid + 1, r);
            return res;
        }

        int mid = (l + r) >> 1;
        if (qr <= mid) return get(ql, qr, f, ls[u], l, mid);
        if (ql > mid)  return get(ql, qr, f, rs[u], mid + 1, r);
        
        int res = get(ql, qr, f, ls[u], l, mid);
        if (res == mid) res = get(ql, qr, f, rs[u], mid + 1, r);
        return res;
    }

    template<class F>
    int get(int ql, int qr, F &&f, int id, const Info &init) {
        ans = init;
        return get(ql, qr, f, rt[id], vl, vr);
    }

    // 线段树合并
    int merge(int p, int q, int l, int r) {
        if (!p || !q) return p | q;
        if (l == r) {
            info[p] += info[q];
            return p;
        }
        int mid = l + r >> 1;
        ls[p] = merge(ls[p], ls[q], l, mid);
        rs[p] = merge(rs[p], rs[q], mid + 1, r);
        pushup(p); 
        return p;
    }
    void merge(int id1, int id2) {
        rt[id1] = merge(rt[id1], rt[id2], vl, vr);
    }
};
```







## bitset

### 库函数及操作

```c++
bitset<1010>a;
any()   //是否有1
none()  //是否全为0
count() //1的个数
set(x) set() //将某一位变为1
reset(x)   // 同上变为0
flip(x) //翻转
for(int i=a._Find_first();i!=a.size();i=_Find_next()){
    cout<<i<<endl;
}
auto pa=(Ull*)&a; //直接访问内存修改或者读取


const int N = 2e5+10;
vector<int> cnt;
int sum, m;
// 动态写法
template<int now = 1>
void check(int len) {
    if (len > now) {
        return check<min(2 * now, N)>(len);
    }
    bitset<now> st;
    st.set(0);
    for (int i = 0; i < m; i++) {
        st = st | (st << cnt[i]);
    }
}
```

可以用于优化可达性问题，大概是dp的时候只有0和1两种状态

### 找三元环

```c++
bitset<1010>f[1010];
for(int i=1;i<=n;i++){
    for(int j=i+1;j<=n;j++){
        if(f[i][j])res+=(f[i]&f[j]).count();
    }
}
res/=3;
```

### 传递闭包

```c++
bitset<1010>f[1010];
for(int k=1;k<=n;k++){
    for(int i=1;i<=n;i++){
        if(f[i][k])f[i]|=f[j];
        //for(int j=1;j<=n;j++){
        //    f[i][j]|=f[i][k]&f[k][j];
        //}
    }
}
res/=3;
```



## 树链剖分

这里以重链剖分为例，并且权值全为点权

```cpp
int s[N],dep[N],fa[N],son[N];
int id[N],pos[N],top[N],cnt;

void dfs1(int u,int father,int d){
    //处理子树节点 深度 父亲节点 重儿子节点
    s[u] = 1, dep[u] = d, fa[u] = father;
    for (int i = h[u]; ~i; i = ne[i]) {
        int j = e[i];
        if (j == father) continue;
        dfs1(j, u, d + 1);
        s[u] += s[j];
        if (s[son[u]] < s[j]) son[u] = j;
    }
}

void dfs2(int u, int t){
    //处理点到dfs序的双向映射 链的顶点
    id[u] = ++ cnt, pos[cnt] = u, top[u] = t;
    //处理到叶节点结束
    if (!son[u]) return;
    //优先处理重儿子
    dfs2(son[u], t);
    for (int i = h[u]; ~i; i = ne[i]) {
        int j = e[i];
        if (j == fa[u] || j == son[u])continue;
        //轻儿子顶点是本身
        dfs2(j, j);
    }
}

void update_path(int u, int v){
    while (top[u] != top[v]){
        if (dep[top[u]] < dep[top[v]]) swap(u, v);
        //操作 id[top[u]]~id[u] 的节点
        update(1, id[top[u]], id[u]);
        u = fa[top[u]];
    }
    //此时已经跳到同一条重链上
    if (dep[u] < dep[v]) swap(u, v);
    //操作 id[v]~id[u]
    update(1, id[v], id[u]);
}

void update_tree(int u, int k){
    //由于dfs序的原因，可以利用子树节点个数直接找到区间
    update(1, id[u], id[u] + s[u] - 1); 
}
```

当权值在边上时，我们可以将边权放在儿子节点上，此时路径询问和子树询问变为

```cpp
void update_path(int u, int v){
    while (top[u] != top[v]){
        if (dep[top[u]] < dep[top[v]]) swap(u, v);
        update(1, id[top[u]], id[u]);
        u = fa[top[u]];
    }
    if (dep[u] < dep[v]) swap(u, v);
    //这里要+1
    if(v != u)update(1, id[v] + 1, id[u]);
}

void update_tree(int u, int k){
    //这里要+1
    if(s[u] != 1)update(1, id[u] + 1, id[u] + s[u] - 1); 
}
```

## dsu on tree

```cpp
int color[N];
vector<int> e[N];
int fa[N],s[N],son[N];
ll ans,num;
ll cnt[N],res[N];
//递归预处理重儿子
void dfs1(int u, int father) {
    s[u] = 1, fa[u] = father;
    for (auto i : e[u]) {
        if (i == father) continue; 
        dfs1(i, u);
        s[u] += s[i];
        if (s[son[u]] < s[i]) son[u] = i;
    }
}

void update(int u, int add, int pson) {
    int c = color[u];
    cnt[c] += add;
    if (cnt[c] > num) {
        num = cnt[c];
        ans = c;
    } else if (cnt[c] == num) {
        ans += c;
    }
    for (auto i : e[u]) {
        if (i == fa[u] || i == pson) continue;
        update(i, add, pson);
    }
}

void dfs2(int u, int op) {
    //先递归解决轻儿子
    for (auto i : e[u]) {
        if (i == fa[u] || i == son[u]) continue;
        dfs2(i, 0);
    }
    if (son[u]) dfs2(son[u], 1);
    update(u, 1, son[u]);
    res[u] = ans;
    // 消除清儿子影响
    if (!op){
        update(u, -1, 0);
        num = ans = 0;
    }
}
```



## Hash表

```cpp
const int N =2e5+3,INF=0x3f3f3f3f;
int a[N];

int f(int x){
    int k = (x % N + N) % N;
    while(a[k] != INF && a[k] != x) {
        if (++ k == N) k = 0;
    }
    return k;
}
```



## 并查集

### 带权并查集

```cpp
int q[N];

int f(int x){
    if(q[x]!=x){
        int t=f(q[x]);
        d[x]+=d[q[x]];//x与原来父亲节点的数据更新
        q[x]=t;
    }
    return q[x];
}
```

### 回滚并查集

```cpp
// Union ans Find Set
struct DSU{
    int q[M], s[M], cnt;
    int stk[M], tt;
    
    void insert(){
        ++cnt;
        q[cnt] = cnt;
        s[cnt] = 1;
    }
 
    int find(int x){
        if(x != q[x]){
            return find(q[x]);
        }
        return q[x];
    }
 
    void merge(int x, int y){
        int fa = find(x);
        int fb = find(y);
        if(fa == fb){
            return;
        }
        if(s[fa] < s[fb]){
            swap(fa, fb);
        }
        q[fb] = fa;
        s[fa] += s[fb];
        stk[++tt] = fb;
    }
 
    void roll(int x){
        while(tt > x){
            int k = stk[tt];
            s[q[k]] -= s[k];
            q[k] = k;
            tt--;
        }
    }
}dsu;
```



## 树状数组

```cpp
#define lowbit(x) ((x)&(-x))

template<typename T> struct BIT{
    vector<T> tr;
    int n;
    BIT() {}
    BIT(int n) {
        assert(n > 0);
        init(n);
    }
    void init(int _n) {
        n = _n;
        tr.assign(n + 1, T{});
    }
    T sum(int x) {
        assert(x <= n);
        T res{};
        for (; x; x -= lowbit(x)) {
            res += tr[x];
        }
        return res;
    }
    void update(int x, T c) {
        assert(x > 0);
        for (; x <= n; x += lowbit(x)) {
            tr[x] += c;
        }
    }
    // 二分 <= s 一定有解
    // 如果 >= s 转换为  <= s - 1  答案+1 但是不一定有解
    int query(T x, int pos = 0) {
        T now = 0;
        //       i = log(n)
        for (int i = __lg(n); i >= 0; i --) {
            // 防止越界 pos +  1 ~ pos + 1 << i
            if (pos + (1 << i) <= n && now + tr[pos + (1 << i)] <= x) {
                pos += 1 << i;
                now += tr[pos];
            }
        }
        return pos;
    }
};
```

## 笛卡尔树

**性质：**

1. 它的中序遍历是原数列
2. 任意一个节点的值都$<=$它的两个儿子节点的值
3. 两个点的$lca$就是它们的$RMQ$
4. 仿照二叉搜索树，我们可以在左链上的某个点$u$的右父亲$v$为$u$原序列中右边第一个点$v$，满足$a[v]\le a[u]$的数，当前左链顶点的右父亲$x$，为$u$左边第一个满足$a[x]\le a[u]$的点

```cpp
int a[N];
int l[N],r[N];

void build() {
    stack<int> q;
    int root = 0;
    for (int i = 1; i <= n; i ++) {
        int last = 0;
        // 最小值
        while (q.size() && a[q.top()] > a[i]) {
            last = q.top();
            q.pop();
        }
        l[i] = last;
        if (q.size()) r[q.top()] = i;
        else {
            root = i;
        }
        q.push(i);
    }
}
```

## Trie

```cpp
const int N=1e5+10,M=3.2e6+10;
int son[M][2],idx,a[N],cnt[M],s[N];
int n, m;
void insert(int x, int v){
    int t = 0;
    for(int i = 30; i >= 0; i--){
        int u = x >> i & 1;
        if(!son[t][u]){
            son[t][u] = ++idx;
        }
        cnt[son[t][u]] += v; //带删除的trie
        t = son[t][u];
    }
}
int query(int x){
    int t = 0, res = 0;
    for(int i=30; i >= 0; i--){
        int u = x >> i & 1;
        if (cnt[son[t][!u]]){
            res += 1 << i;
            t = son[t][!u];
        } else {
            t = son[t][u];
        }
    }
    return res;
}
```

## st表

```cpp
void init(int n){
    int m = __lg(n);
    for(int j = 0; j <= m; j++){
        for(int i = 1; i + (1 << j) - 1 <= n; i++){
            if(!j) f[i][j] = w[i];
            else f[i][j] = min(f[i][j - 1], f[i + (1 << (j - 1))][j - 1]);
        }
    }
}
int query(int l, int r){
    int len = r - l + 1;
    int k = __lg(len);
    return min(f[l][k], f[r - (1 << k) + 1][k]);
}
//
m = __lg(n);
vector<vector<int>> f(m + 1, vector<int>(n + 1));
for (int j = 0; j <= m; j++) {
    for (int i = 1; i + (1 << j) - 1 <= n; i++) {
        if (!j) f[j][i] = p[i];
        else f[j][i] = min(f[j - 1][i], f[j - 1][i + (1 << (j - 1))]);
    }
};
auto query = [&](int l, int r){
    assert(l <= r);
    int len = r - l + 1;
    int k = __lg(len);
    return min(f[k][l], f[k][r - (1 << k) + 1]);
};
```

## 分块

```cpp
int n, m, k;
int st[N],ed[N],pos[N],a[N];
int len;


void init() {
    len = sqrt(n);
    for (int i = 1; i <= len; i ++) {
        st[i] = (i - 1) * len + 1;
        ed[i] = i * len;
    }
    ed[len] = n;
    for (int i = 1; i <= len; i ++) {
        for (int j = st[i]; j <= ed[i]; j ++) {
            pos[j] = i;
            
        }
    }
}

int get(int l, int r) {
    if (pos[l] == pos[r]) {
        int res = 0;
        for (int i = l; i <= r; i ++ ) {
            
        }
        return res;
    } else {
        int res = 0;
        res += get(l, ed[pos[l]]);
        res += get(st[pos[r]], r);
        for (int i = pos[l] + 1; i <= pos[r] - 1; i ++) {
            
        }
        return res;
    }
}
```



## 莫队

如果能$O(1)$转移答案即可考虑

```cpp
void solve() {
    cin >> n;
    vector<int> a(n + 1), cnt(N + 1), ans(n + 1);
    for (int i = 1; i <= n; i++) {

    }
    cin >> m;
    vector<array<int, 4>> qr;
    vector<int> res(m);
    for (int i = 0; i < m; i++) {
        int l, r, k;
        cin >> l >> r >> k;
        qr.push_back({l, r, k, i});
    }
    int B = sqrt(n);
    sort(qr.begin(), qr.end(),[&](array<int, 4> a, array<int, 4> b){
        int c = a[0] / B;
        if (a[0] / B == b[0] / B) return c % 2 ? a[1] > b[1] : a[1] < b[1];
        else return a[0] / B < b[0] / B; 
    });
    auto add = [&](int x) {
        ans[cnt[a[x]]]--;
        cnt[a[x]]++;
        ans[cnt[a[x]]]++;
    };
    auto del = [&](int x) {
        ans[cnt[a[x]]]--;
        cnt[a[x]]--;
        ans[cnt[a[x]]]++;
    };
    int l = 1, r = 0;
    cnt[0] = n;
    for (auto&[_l, _r, k, id] : qr) {
        while (r < _r) r++, add(r);
        while (l > _l) l--, add(l);
        while (r > _r) del(r), r--;
        while (l < _l) del(l), l++;
        res[id] = ans[k];
    }
    for (int i = 0; i < m; i++) {
        cout << res[i] << endl;
    }
}
```
