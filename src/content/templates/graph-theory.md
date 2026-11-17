---
title: "图论模板"
description: "基环树、LCA、最短路、最小生成树等图论模型与代码模板。"
date: 2026-09-26
tags: [图论, 模板, C++]
---
## 基环树

基环树是一种特殊的图，具有n个点，n条边，也等价于每个点出度都为1，有可能有多个连通块，也就是基环树森林。

### 情况一：是基环树

- 需要正向反向建图，正向建图找环，反向图用于处理树形问题
- 遍历所有联通块，在该基环树的正向图上一直往上跳找到环上的点
- 再在环上所有点的反向图$dfs$遍历所有树的点

```c++
int oncyc[N],p[N]; //oncyc表示是否在环上 p[u]为u的正向边连接的点
bool vis[N];      //vis表示是否访问过
vector<int>e[N]; //e[u]为u的反向边的点集

void dfs(int u){
    vis[u]=true;
    for(auto i:e[u]){
        if(oncyc[i])continue;
        dfs(i);
        //处理后续，与题目有关
    }
}

for(int k=1;k<=n;k++){
    //有可能是基环树森林，含有多个连通块
	if(!vis[k]){
        //正向图找环
        int u=k;
        while(!vis[u]){
            vis[u]=true;
            u=p[u];
        }
        //环上的点
        vector<int>cyc;
        int v=u;
        do{
            cyc.push_back(v);
            oncyc[v]=true;
            v=p[v];
        }while(v!=u);
        //反向图处理树形
        for(auto i:cyc){
            dfs(i);
        }
    }
}
```

例题[Lights](https://codeforces.com/contest/1907/problem/G) 

从贪心角度，每一个开关只会被改变一次。

因此我们在树上直接从叶子节点向上改变，处理到环上的点的时候停止，此时环上节点灯的状态固定。   

然后是环形dp，环上就3种情况，无解，res，cyc.size()-res，有解时取最小值即可。                

```cpp
#include<bits/stdc++.h>
 
using namespace std;
 
#define fi first
#define se second
#define lowbit(x) ((x)&(-x))
#define endl '\n'
 
const int N=2e5+10,M=3e5+10,mod=998244353,INF=0x3f3f3f3f;
typedef long long ll;
typedef pair<int,int> pii;
int n,m,k,q;
int p[N];
vector<int>e[N];
bool oncyc[N],vis[N];
char s[N];

void solve(){
    cin>>n>>s+1;
    int cnt=0;
    vector<vector<int>>res;
    for(int i=1;i<=n;i++){
        oncyc[i]=vis[i]=false;
        e[i].clear();
    }
    for(int i=1;i<=n;i++){
        int x;
        cin>>x;
        p[i]=x;
        e[x].push_back(i);
    }
    for(int i=1;i<=n;i++)if(!vis[i]){
        int u=i;
        while(!vis[u]){
            vis[u]=true;
            u=p[u];
        }
        vector<int>cyc;
        int v=u;
        do{
            cyc.push_back(v);
            oncyc[v]=true;
            v=p[v];
        }while(v!=u);
        //树上答案
        vector<int>ans;
        auto dfs=[&](auto&&self,int u,int fa)->void{
            vis[u]=true;
            for(auto j:e[u]){
                if(oncyc[j])continue;
                self(self,j,u);
                if(s[j]=='1'){
                    //改变该节点状态
                    s[j]='0';
                    s[u]='0'+'1'-s[u];
                    ans.push_back(j);
                    cnt++;
                }
            }
        };
        for(auto j:cyc){
            dfs(dfs,j,-1);
        }
        res.push_back(ans);
        //环上的两种情况
        vector<int>cycans1,cycans2;
        for(auto j:cyc){
            //如果灯是开着的就使用该开关
            if(s[j]=='1'){
                cycans1.push_back(j);
                s[j]='0';
                s[p[j]]='0'+'1'-s[p[j]];
            }else{
                cycans2.push_back(j);
            }
        }
        //如果此时最开始的点仍然被打开，那么一定无解
        if(s[cyc[0]]=='1'){
            cout<<"-1\n";
            return;
        }
        cnt+=min(cycans1.size(),cycans2.size());
        if(cycans1.size()<=cycans2.size())res.push_back(cycans1);
        else res.push_back(cycans2);
    }
    cout<<cnt<<endl;
    for(int i=0;i<res.size();i++){
        for(auto j:res[i])cout<<j<<" ";
    }
    cout<<endl;
}

int main(){
    ios::sync_with_stdio(0);
    cin.tie(0);
    cout.tie(0);
    int t;
    t=1;
    cin>>t;
    while(t--){
        solve();
    }
    return 0;
}
```

例题[ZJOI2008\] 骑士](https://www.luogu.com.cn/problem/P2607)

这里树上为树形dp，与没有上司的舞会类似。

环形dp可以枚举两种情况，环上第一个节点加入和不加入两种情况。

```cpp
int p[N],w[N];
bool vis[N],oncyc[N];
vector<int>e[N];
ll dp[N][2];
ll c[N][2];
//树形dp
void dfs(int u){
    dp[u][1]=w[u];
    vis[u]=true;
    for(auto i:e[u]){
        if(oncyc[i])continue;
        dfs(i);
        dp[u][0]+=max(dp[i][0],dp[i][1]);
        dp[u][1]+=dp[i][0];
    }
}

void solve(){
    cin>>n;
    for(int i=1;i<=n;i++){
        cin>>w[i]>>p[i];
        e[p[i]].push_back(i);
    }
    ll res=0;
    for(int k=1;k<=n;k++){
        if(!vis[k]){
            int u=k;
            while(!vis[u]){
                vis[u]=true;
                u=p[u];
            }
            vector<int>cyc;
            int v=u;
            do{
                cyc.push_back(v);
                oncyc[v]=true;
                v=p[v];
            }while(v!=u);
            for(auto i:cyc){
                dfs(i);
            }
            ll ans=-1e18;
            int m=cyc.size();
            //环形dp
            for(int t=0;t<2;t++){
                //枚举两周情况
                for(int i=0;i<2;i++){
                    if(t==i)c[0][i]=dp[cyc[0]][i];
                    else c[0][i]=-1e18;
                }
                for(int i=1;i<m;i++){
                    int u=cyc[i];
                    c[i][0]=max(c[i-1][0],c[i-1][1])+dp[u][0];
                    c[i][1]=c[i-1][0]+dp[u][1];
                }
                if(t==0)ans=max(ans,max(c[m-1][0],c[m-1][1]));
                else ans=max(ans,c[m-1][0]);
            }
            res+=ans;
        }
    }
    cout<<res<<endl;
}
```

### 情况二：需判断基环树

此处以例题来解释[Card Game](http://acm.hdu.edu.cn/showproblem.php?pid=6403 "HDU6403")

题意可以转化为图论问题，也就是将每个连通块中的点改变成入度至多为1的点。
于是一共有树和基环树两种情况，对树进行直接进行换根dp，而对基环树需要分为两种情况讨论

具体可以看注释。

```c++
int n,m,k;
int dfn[N],rev[N],timestamp;//dfn表述访问时间 rev以表示以当前点为跟节点需要改变边方向的数量
vector<pii>e[N];            //记录边以及边的编号
vector<int>vec;             //记录当前连通块的点是什么
vector<array<int,3>>cyc;    //用于记录返祖边
ll totrev;             //需要翻转的边

void dfs(int u,int id){
    dfn[u]=++timestamp;
    vec.push_back(u);
    for(auto&[j,id2]:e[u]){
        if(!dfn[j]){
            totrev+=id2%2;
            rev[j]=rev[u]+(id2%2?-1:1);
            dfs(j,id2);
        //过滤掉父亲边
        //等号是为了考虑自环
        }else if(id2!=(id^1)&&dfn[j]<=dfn[u]){
            cyc.push_back({u,j,id2});
        }
    }
}

//将每个连通块中的点改变成入度至多为1的点
//于是一共有树和基环树两种情况
//对树进行换根dp
//对基环树分为两种情况讨论

void solve(){
    cin>>n;
    for(int i=1;i<=2*n;i++){
        e[i].clear();
        dfn[i]=0;
    }
    for(int i=0;i<n;i++){
        int x,y;
        cin>>x>>y;
        e[y].push_back({x,2*i});
        //防止自环被判成两个环
        if(x!=y)e[x].push_back({y,2*i+1});
    }
    ll ans1=0,ans2=1;
    for(int i=1;i<=2*n;i++){
        if(!dfn[i]){
            vec.clear();
            cyc.clear();
            rev[i]=timestamp=totrev=0;
            dfs(i,-1);
            //如果两个环以上则必定无解
            if(cyc.size()>=2){
                cout<<"-1 -1\n";
                return;
            }else if(cyc.size()==0){
                //换根dp
                int minrev=INF,cnt=0;
                for(auto j:vec){
                    if(rev[j]<minrev)minrev=rev[j],cnt=0;
                    if(rev[j]==minrev)cnt++;
                }
                ans1+=totrev+minrev;
                ans2=ans2*cnt;
            }else{
                //枚举环上两种情况
                int rev1=totrev+rev[cyc[0][0]]+1-cyc[0][2]%2;
                int rev2=totrev+rev[cyc[0][1]]+cyc[0][2]%2;
                int cnt=1;
                if(rev1==rev2)cnt++;
                ans1+=min(rev1,rev2);
                ans2=cnt*ans2;
            }
        }
    }
    cout<<ans1<<" "<<ans2<<endl;
}
```

### 情况三：无dfs省内存写法

当我们不需要保存环的时候就可以直接用这种写法。

例题[强联通计数](https://acm.hdu.edu.cn/showproblem.php?pid=7412)

树上的节点对答案的贡献为（1-p），环上节点如果都完整那么贡献为1，否则就为剩下来的节点个数，直接计算即可。

这样写才不会爆内存。

```cpp
int p[N],vis[N];
for(int i=1;i<=n;++i)if(!vis[i]){
    int u=i;
    while(!vis[u]){
        vis[u]=i;
        u=p[u];
    }
    if(vis[u]!=i)continue;
    int v=u;
    int cnt=0;
    do{
        cnt++;
        v=p[v];
    }while(v!=u);
}
```



### 情况四：无向图

涉及到无向图的拓扑排序和找环。

```cpp
void bfs(){
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (d[i] == 1) {
            q.push(i);
        }
    }
    while (q.size()) {
        int u = q.front();
        q.pop();
        for (auto v : e[u]) {
            if (d[v] > 0) {
                d[u]--, d[v]--;
                if (d[v] == 1) q.push(v);
            }
        }
    }
}

void get_cyc(int u, int fa) {
    cyc.push_back(u);
    d[u]--;
    for (auto i : e[u]) {
        if (i == fa || d[i] != 2) continue;
        get_cyc(i, u);
    }
}

void dfs(int u, int fa) {
    for (auto i : e[u]) {
        if (i == fa || d[i] == 1) continue;
        dfs(i, u);
        
    }
}


for (int i = 1; i <= n; i++) {
    int a, b;
    cin >> a >> b;
    e[a].push_back(b);
    e[b].push_back(a);
    d[a]++;
    d[b]++;
}
bfs();
for (int i = 1; i <= n; i++) {
    if (d[i] == 2) {
        get_cyc(i, -1);
        break;       
    }
}
for (auto i : cyc) {
    dfs(i, -1);
}
```





## 最近公共祖先

### 倍增

```cpp
int dep[N];
int fa[N][16];

void bfs(int root){
    memset(dep, 0x3f, sizeof dep);
    dep[0] = 0;
    dep[root] = 1;
    queue<int> q;
    q.push(root);
    while (q.size()) {
        auto u = q.front();
        q.pop();
        for (auto i : e[u]) {
            if (dep[i] > dep[u]+1) {
                dep[i] = dep[u] + 1;
                q.push(i);
                fa[i][0] = u;
                for (int j = 1; j <= 15; j ++) {
                    fa[i][j] = fa[fa[i][j - 1]][j - 1];
                }
            }
        }
    }
}

int get_lca(int a, int b){
    if (dep[b] > dep[a]) return get_lca(b, a);
    for (int k = 15; k >= 0; k --) { 
        if (dep[fa[a][k]] >= dep[b]) {
            a = fa[a][k];
        }
    }
    if (a == b) return a;
    for (int k = 15; k >= 0; k --) {
        if(fa[a][k] != fa[b][k]){
            a = fa[a][k], b = fa[b][k];
        }
    }
    return fa[a][0];
}
```



```cpp
vector<vector<int>> e(n + 1);
int h = __lg(n);
vector<vector<int>> fa(h + 1, vector<int>(n + 1)); 
vector<int> dep(n + 1, INF);
auto bfs = [&](int root) {
    queue<int> q;
    q.push(root);
    dep[0] = 0;
    dep[1] = 1;
    while (q.size()) {
        auto u = q.front();
        q.pop();
        for (auto v : e[u]) {
            if (dep[u] + 1 < dep[v]) {
                dep[v] = dep[u] + 1;
                fa[0][v] = u;
                q.push(v);
                for (int i = 1; i <= h; i++) {
                    fa[i][v] = fa[i - 1][fa[i - 1][v]];
                }
            }
        }
    }
};
bfs(1);
auto get_lca = [&](int a, int b) {
    if (dep[a] < dep[b]) swap(a, b);
    for (int i = h; i >= 0; i--) {
        if (dep[fa[i][a]] >= dep[b]) {
            a = fa[i][a];
        }
    }
    if (a == b) return a;
    for (int i = h; i >= 0; i--) {
        if (fa[i][a] != fa[i][b]) {
            a = fa[i][a];
            b = fa[i][b];
        }
    }
    return fa[0][a];
};
```



### O(1)lca

欧拉序，每次经过时加入编号和深度

```cpp
int rt;
cin >> n >> m >> rt;
rt--;
vector<vector<int>> e(n);
vector<vector<pii>> f(20, vector<pii>(2*n));
vector<int> pos(n), dep(n);
int idx = 0;
for (int i = 1; i < n; i++) {
    int a, b;
    cin >> a >> b;
    a--, b--;
    e[a].push_back(b);
    e[b].push_back(a);
}  
auto dfs = [&](auto&&self, int u, int d) -> void {
    dep[u] = d;
    pos[u] = idx;
    f[0][idx++] = {d, u};
    for (auto i : e[u]) {
        if (dep[i]) continue; 
        self(self, i, d + 1);
        f[0][idx++] = {d, u}; 
    }
};
dfs(dfs, rt, 1);
for (int j = 1; j <= 19; j++) {
    for (int i = 0; i + (1 << j) - 1 < idx; i++) {
        f[j][i] = min(f[j - 1][i], f[j - 1][i + (1 << (j - 1))]);
    }   
}
auto get_lca = [&](int a, int b) -> int {
    a--, b--;
    a = pos[a], b = pos[b];
    if (a > b) swap(a, b);
    int len = 31 - __builtin_clz(b - a + 1);
    return min(f[len][a], f[len][b - (1 << len) + 1]).se + 1;
};
while (m--) {
    int a, b;
    cin >> a >> b;
    cout << get_lca(a, b) << endl;
}
```

### 树剖

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

int get_lca(int u, int v){
    while (top[u] != top[v]){
        if (dep[top[u]] < dep[top[v]]) swap(u, v);
        u = fa[top[u]];
    }
    //此时已经跳到同一条重链上
    if (dep[u] < dep[v]) swap(u, v);
    return v;
}
```



## 虚树

采用单调栈写法

```cpp
bool st[N];
ll res[N]; 
int val[N][19];
int dep[N], fa[N][19], dfn[N], cnt;
vector<pii> e[N], g[N];
int stk[N], tt;
// 处理dfs序跟lca
void dfs1(int u, int father, int d){
    dep[u] = d;
    dfn[u] = ++cnt;
    for (auto&[v, w] : e[u]) {
        if (v == father) continue;
        fa[v][0] = u;
        val[v][0] = w;
        for (int j = 1; j <= 18; j ++) {
            fa[v][j] = fa[fa[v][j - 1]][j - 1];
            val[v][j] = min(val[v][j - 1], val[fa[v][j - 1]][j - 1]);
        }
        dfs1(v, u, d + 1);
    }
}

int get_lca(int a, int b){
    if (dep[b] > dep[a]) return get_lca(b, a);
    for (int k = 18; k >= 0; k --) { 
        if (dep[fa[a][k]] >= dep[b]) {
            a = fa[a][k];
        }
    }
    if (a == b) return a;
    for (int k = 18; k >= 0; k --) {
        if(fa[a][k] != fa[b][k]){
            a = fa[a][k], b = fa[b][k];
        }
    }
    return fa[a][0];
}

int get_val(int a, int b){
    if (dep[b] > dep[a]) return get_val(b, a);
    int res = INF;
    for (int k = 18; k >= 0; k --) { 
        if (dep[fa[a][k]] >= dep[b]) {
            res = min(val[a][k], res);
            a = fa[a][k];
        }
    }
    if (a == b) return res;
    for (int k = 18; k >= 0; k --) {
        if(fa[a][k] != fa[b][k]){
            res = min({res, val[a][k], val[b][k]});
            a = fa[a][k], b = fa[b][k];
        }
    }
    return min({res, val[a][0], val[b][0]});
}


void dfs2(int u){
    res[u] = 0;
    for (auto&[v, w] : g[u]) {
        dfs2(v);
        if (st[v]) {
            res[u] += w;
        } else {
            res[u] += min(1ll * w, res[v]);
        }
    }
    g[u].clear();
};

void build(vector<int> c) {
    tt = -1;
    c.push_back(1); // 特殊点
    sort(c.begin(), c.end(), [&](int a, int b){
        return dfn[a] < dfn[b];
    });
    for (auto i : c) {
        if (tt == -1) {
            stk[++tt] = i;
        } else {
            int lca = get_lca(stk[tt], i);
            if (lca != stk[tt]) {
                while (tt > 0 && dep[stk[tt - 1]] >= dep[lca]) {
                    int a = stk[tt - 1], b = stk[tt], c = get_val(a, b);
                    g[a].push_back({b, c});
                    tt--;
                }
                // 如果lca刚好在栈中
                if (stk[tt] != lca) {
                    g[lca].push_back({stk[tt], get_val(lca, stk[tt])});
                    stk[tt] = lca;
                }
            }
            stk[++tt] = i;
        }
    }
    for (int i = 1; i <= tt; i++) {
        int a = stk[i - 1], b = stk[i], c = get_val(a, b);
        g[a].push_back({b, c});
    }
}
```



## 最短路

### dijkstra

朴素板

```cpp
vector<pii> e[N]; 
int dist[N];
bool st[N];
int n,m;

void dijkstra() {
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;
    for (int i = 1; i <= n; i ++) {
        int t = -1;
        for(int j = 1; j <= n; j ++) {
            if(!st[j] && (t == -1 || dist[t] > dist[j])) t = j;
        }
        st[t] = true;
        for (auto&[j, k] : e[t]) {
            dist[j] = min(dist[j], dist[t] + k);
        }
    }
}
```

 堆优化版

```cpp
vector<pii> e[N]; 
int dist[N];
bool st[N];
int n,m;

void dijkstra() {
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;
    priority_queue<pii, vector<pii>, greater<pii>> heap;
    heap.push({0,1});
    while (heap.size()) {
        auto t = heap.top().se;
        heap.pop();
        if(st[t])continue;
        st[t] = true;
        for (auto&[j, k] : e[t]) {
            if(dist[t] + k < dist[j]){
                dist[j] = dist[t] + k;
                heap.push({dist[j],j});
            }
        }
    }
}
```

### spfa

```cpp
vector<pii> e[N]; 
int dist[N];
bool st[N];
int n,m;

void spfa() {
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;
    queue<int> q;
    q.push(1);
    while (q.size()) {
        auto t = q.front();
        q.pop();
        st[t] = false;
        for (auto&[j, k] : e[t]) {
            if(dist[t] + k < dist[j]){
                dist[j] = dist[t] + k;
                if(!st[j]) {
                    st[j] = true;
                    q.push(j);
                }
            }
        }
    }
}
```



### floyd

```cpp
for(int k=1;k<=n;k++){
    for(int i=1;i<=n;i++){
        for(int j=1;j<=n;j++){
            d[i][j]=min(d[i][j],d[i][k]+d[k][j]);
        }
    }
}
```

## 最小生成树

### kruskal

```cpp
struct Edge{
    int a,b,w;
    bool operator<(const struct Edge&x){
        return w<x.w;
    }
}edge[M];

int f(int x){
    if(q[x] != x){
        q[x]=f(q[x]);
    }
    return q[x];
}

void kruskal(){
    sort(edge + 1, edge + 1 + m);
    for(int i=1;i<=n;i++) q[i]=i;
    for(int i=1;i<=m;i++){
        int a=edge[i].a,b=edge[i].b,w=edge[i].w;
        a=f(a),b=f(b);
        if(a!=b){
            res+=w;
            q[a]=b;
            cnt++;
        }
    }
}
```

$cnt < n-1$时无解

### prim

朴素板，也可以换堆优化版

```cpp
const int N=510,INF=0x3f3f3f3f;
int g[N][N];
int dist[N];
int n,m;
bool st[N];
int res;

bool prim(){
    memset(dist,0x3f,sizeof dist);
    dist[1]=0;
    for(int i=1;i<=n;i++){
        int t=-1;
        for(int j=1;j<=n;j++){
            if(!st[j]&&(t==-1||dist[j]<dist[t]))t=j;
        }
        st[t]=true;
        if(i!=1)res+=dist[t];
        if(i!=1&&dist[t]==INF)return false;
        for(int j=1;j<=n;j++){
            dist[j]=min(dist[j],g[t][j]);
        }
    }
    return true;
} 
```

### boruvka

```cpp
int son[M][2], idx, cnt[M], tail[M], rt[N];
int q[N];
pii mn[N];

void insert(int x, int num, int rt_id, int a_id){
    if (!rt[rt_id]) {
        rt[rt_id] = ++idx;
    }
    int t = rt[rt_id];
    for(int i = 29; i >= 0; i--){
        int u = x >> i & 1;
        if(!son[t][u]){
            son[t][u] = ++idx;
        }
        cnt[son[t][u]] += num;
        t = son[t][u];
    }
    tail[t] = a_id;
}

int query(int x, int id1, int id2){
    int t1 = rt[id1], t2 = rt[id2];
    for(int i = 29; i >= 0; i--){
        int u = x >> i & 1;
        if (cnt[son[t2][u]] - cnt[son[t1][u]] > 0){
            t1 = son[t1][u], t2 = son[t2][u];
        } else {
            t1 = son[t1][!u], t2 = son[t2][!u];
        }
    }
    return tail[t2];
}

int f(int x) {
    if (q[x] != x) {
        q[x] = f(q[x]);
    }
    return q[x];
}

int mg(int x, int y) {
    if (!x || !y) return x | y;
    cnt[x] += cnt[y];
    son[x][0] = mg(son[x][0], son[y][0]);
    son[x][1] = mg(son[x][1], son[y][1]);
    return x;
}

void merge(int x, int y) {
    int fx = f(x), fy = f(y);
    rt[fx] = mg(rt[fx], rt[fy]);
    q[fy] = fx;
}

void solve() {
    cin >> n;
    vector<int> a(n);
    for (auto&i : a) {
        cin >> i;
    }
    sort(a.begin(), a.end());
    a.erase(unique(a.begin(), a.end()), a.end());
    n = a.size();
    for (int i = 0; i < n; i++) {
        insert(a[i], 1, i, i);
        insert(a[i], 1, n, i);
        q[i] = i;
    }
    ll res = 0;
    int sum = n;
    while (sum > 1) {
        // 初始化每个联通块向外的最小（大）边
        for (int i = 0; i < n; i++) {
            mn[i] = {2e9, -1};
        }
        // 更新mn 数组
        for (int i = 0; i < n; i++) {
            int x = i, y = query(a[x], f(i), n), w = a[y] ^ a[x];
            if (w < mn[f(i)].fi) {
                mn[f(i)] = {w, y};
            }
        }
        // 合并连通块
        for (int i = 1; i <= n; i++) {
            if (f(i) == i && f(i) != f(mn[i].se)) {
                merge(i, mn[i].se);
                sum--;
                res += mn[i].fi;
            }
        }
    }
    cout << res << endl;
}

```





## 二分图判定

```cpp
int color[N];
vector<int> e[N];

bool dfs(int u,int c){
    color[u]=c;
    for(auto v : e[u]){
        if(!color[v]){
            if(!dfs(v,3-c))return false;
        }else if(color[u]==color[v])return false;
    }
    return true;
}

bool flag=true;
for(int i=1;i<=n;i++){
    if(!color[i]){
        if(!dfs(i,1)){
            flag=false;
            break;
        }
    }
}
```

$flag$为真时为二分图，反之则不是

## 匈牙利算法

时间复杂度$O(nm)$

这里以最小路径覆盖问题为例，包含着拆点的技巧

二分图最大匹配数$=$最小点覆盖$=n-$最大独立集

最大路径覆盖$=n-$最大匹配

```cpp
bool st[N]; //二分图右边的点是否已访问过
int match[N], p[N]; //二分统计右边的点匹配的左边的点 //左边点对应右边的带点
vector<int> e[N];

bool find(int u){
    for (auto i : e[u]) {
        if(!st[i]){
            st[i] = true;
            //如果没访问过，或者说能给match[i]找到另一个点
            if (match[i] == -1 || find(match[i])) {
                p[u] = i;
                match[i] = u;
                return true;
            }
        }
    }
    return false;
}

void solve() {
    cin >> n >> m;
    memset(match, -1, sizeof  match);
    memset(p, -1, sizeof p);
    for (int i = 1; i <= m; i ++) {
        int a, b;
        cin >> a >> b;
        a --, b --;
        e[2 * a].push_back(2 * b + 1);
    }
    int cnt = 0;
    for (int i = 0; i < n ; i ++) {
        //每次要初始化
        memset(st, 0, sizeof st);
        if (find(2 * i)) cnt ++;
    }
    for (int i = 0; i < n; i ++) {
        if (match[2 * i + 1] == -1) {
            int u = 2 * i + 1;
            while (u != -1) {
                u --;
                cout << u / 2 + 1 << " ";
                u = p[u];
            }
            cout << endl;
        }
    }
    cout << n - cnt << endl;
}

int main() {  
    cin.tie(0);
    cout.tie(0);
    ios::sync_with_stdio(0);
    int _;
    _ = 1;
    //cin >> _;
    while(_ --) {
        solve();
    }
    return 0;
}
```

## tarjan

### 有向图强联通分量

```cpp
int scc_cnt = 0, top = 0, timestamp = 0;
vector<int> dfn(n + 1), low(n + 1), s(n + 1), id(n + 1), stk(n + 1);
vector<int> in_stk(n + 1);
vector<vector<int>> e(n + 1);
vector<int> dout(n + 1);
auto tarjan = [&](auto&&self, int u) -> void{
    dfn[u] = low[u] = ++timestamp;
    stk[++top] = u, in_stk[u] = true;
    for (auto i : e[u]) {
        if (!dfn[i]) {
            self(self, i);
            low[u] = min(low[u], low[i]);
        } else if (in_stk[i]) {
            low[u] = min(low[u], dfn[i]);
        }
    }
    if (dfn[u] == low[u]) {
        scc_cnt++;
        int y;
        do {
            y = stk[top--];
            in_stk[y] = false;
            id[y] = scc_cnt;
            dout[scc_cnt]++;
            s[scc_cnt]++;
        } while (y != u);
    }
};
```

### 无向图的双联通分量

一个点既是e-dcc也是v-dcc
两个点是v-dcc但不是e-dcc

#### 割点

```cpp
int h[N],e[M],ne[M],idx;
int low[N],dfn[N];
int son[N];
int timestamp,cnt;
bool root[N],res[N];

void dfs(int u){
    low[u]=dfn[u]=++timestamp;
    for(int i=h[u];~i;i=ne[i]){
        int j=e[i];
        if(!dfn[j]){
            dfs(j);
            son[u]++;
            low[u]=min(low[u],low[j]);
            if(!root[u]&&low[j]>=dfn[u])res[u]=true;
        }else{
            low[u]=min(low[u],dfn[j]);
        }
    }
    if(root[u]&&son[u]>=2)res[u]=true;
}
```

#### 桥/边双e-dcc

```cpp
int h[N],e[M],ne[M],idx;
int dcc_cnt,top,timestamp;
bool is_bridge[M];
int dfn[N],low[N],s[N],id[N],stk[N];

void add(int a,int b){
    e[idx]=b,ne[idx]=h[a],h[a]=idx++;
}

void tarjan(int u, int fa) {
    dfn[u] = low[u] = ++timestamp;
    stk[++top] = u;
    for (int i = h[u]; ~i; i = ne[i]) {
        int j = e[i];
        if (j == fa) continue;
        if (!dfn[j]) {
            tarjan(j, u);
            low[u] = min(low[j], low[u]);
            if (dfn[u] < low[j])
                is_bridge[i] = is_bridge[i ^ 1] = true;
        } else low[u] = min(low[u], dfn[j]);
    }
    if (dfn[u] == low[u]) {
        int y;
        dcc_cnt++;
        do {
            s[dcc_cnt]++;
            y = stk[top--];
            id[y] = dcc_cnt;
        } while (y != u);
    }
}

dcc_cnt = idx = timestamp = 0;
for (int i = 0; i <= n; i++){
    h[i] = -1;
    dfn[i] = s[i] = 0;
}
for (int i = 0; i < m; i++) {
    is_bridge[2 * i] = is_bridge[2 * i + 1] = false;
}
```

#### 点双v-dcc

```cpp
void tarjan(int u)
{
    low[u] = dfn[u] = ++timestamp;
    stk[++top] = u;
    // 1 u是孤立点-自称一个dcc
    if(u==root && h[u]==-1)//u是根节点且没有邻边
    {
        dcc_cnt++;
        dcc[dcc_cnt].push_back(u);
        return;
    }
    // 2 u不孤立
    int cnt = 0;
    for(int i = h[u];~i;i=ne[i])
    {
        int j = e[i];
        if(!dfn[j])
        {
            tarjan(j);
            low[u] = min(low[u],low[j]);
            // 看j是不是能连到比u还高的地方
            if(dfn[u]<=low[j])//j最高比u高度低 说明j是u一个新的分支(如果把u删掉 多一个j连通块)
            {
                cnt++;
                // 判u是否割点 如果不是根节点-只要有一个分支他就是割点||如果是根节点 需要有两个分支才是割点
                if(u!=root||cnt>1)cut[u] = true;
                ++dcc_cnt;
                int y;
                do{
                    y = stk[top--];
                    dcc[dcc_cnt].push_back(y);
                }while(y!=j);//注意弹出栈不是弹到u为止 而是弹到j为止(u仍保留在stk中)
                // 开新分支 == u一定和新分支j组成一个dcc 也和旧连通块组成dcc
                // 那么当前最高点u还要被用在更高的包含u的旧连通块
                // 所以如果这个时候出栈了 回溯到比u高的点的时候 u就加不进旧连通块里
                dcc[dcc_cnt].push_back(u);
            }
        }
        else low[u] = min(low[u],dfn[j]);
    }
}
```

## 差分约束

求最小->求所有下界的最大->最长路 ，存在正环则无解
求最大->求所有上界的最小->最短路，存在负环则无解

最长路$dist[j] ≥ dist[t] + w[i] , t+w[i]→j$

```cpp
T=1: A=B => A≥B B≥A   B+0→A A+0→B
T=2: A<B => B≥A+1     A+1→B
T=3: A≥B => A≥B       B+0→A
T=4: A>B => A≥B+1     B+1→A
T=5: A≤B => B≥A       A+0→B
```

$spfa$求最长路 - 做完后每个点的距离就是最小值
1 边是正的 - 存在正环 => 无解
2 有解 
    必须有绝对值
    超级源点(能到所有边)
    $x[i]≥x[0]+c$
当题目性质特殊时也可以用缩点

## 欧拉回路

### 无向图G

图G存在欧拉路径与欧拉回路的充要条件分别是：
欧拉路径： 图中所有奇度点的数量为0或2。
欧拉回路： 图中所有点的度数都是偶数。

### 有向图H

图H存在欧拉路径和欧拉回路的充要条件分别是：
欧拉路径： 所有点的入度等于出度 或者 存在一点出度比入度大1(起点)，一点入度比出度大1(终点)，其他点的入度均等于出度。
欧拉回路：所有点的入度等于出度。

```cpp
int h[N],e[M],ne[M],idx;
int ans[N*2],cnt;
bool used[M];
int din[N],dout[N];
int n,m,ver;

void dfs(int u){
    for(int &i = h[u]; ~i; ){
        if(used[i]){  //如果这条边用过了
            i = ne[i];   //删除这条边
            continue;
        }
        used[i] = true;  //标记这条边已使用
        if(ver == 1) used[i^1] = true;   //如果是无向图，那么这条边的反向边也要标记使用过了
        int t;
        if(ver == 1){
            t = i/2 + 1;
            if(i&1) t = -t;  //(0,1) (2,3) (4,5) 奇数编号是返回的边

        }else t = i+1;
        int j = e[i];
        i = ne[i];
        dfs(j);
        ans[cnt++] = t;
    }
}
int main()
{
    scanf("%d%d%d",&ver,&n,&m);
    memset(h,-1,sizeof h);

    for(int i = 0; i<m; i++){
        int a,b;
        scanf("%d%d",&a,&b);
        add(a,b);
        if(ver == 1) add(b,a);  //无向边
        din[b]++, dout[a]++;   
    }
    if(ver == 1){
        for(int i = 1; i<=n; i++){
            if(din[i]+dout[i] &1){
                //无向图含欧拉回路的充要条件是每个点的度都为偶数
                puts("NO");
                return 0;
            }
        }
    }else{
        for(int i = 1; i<=n; i++){
            if(din[i] != dout[i]){
                //有向图含欧拉回路的充要条件是每个点的入度等于出度
                puts("NO");
                return 0;
            }
        }
    }
    for(int i = 1; i<=n; i++){
        if(~h[i]) {
            dfs(i);
            break;
        }
    }
    if(cnt < m){
        puts("NO");
        return 0;
    }
    puts("YES");
    for(int i = cnt-1; i>=0; --i){
        cout<<ans[i]<<" ";
    }
    return 0;
}
```



## 网络流



### 最大流

**dinic**

散装写法

```cpp
int h[N], cur[N], e[M], ne[M], idx;
ll w[M];
int s, t;
int d[N];

void add(int a, int b, ll c) {
    e[idx] = b, ne[idx] = h[a], w[idx] = c, h[a] = idx++;
}

bool bfs() {
    for (int i = 0; i <= n; i++) {
        d[i] = -1;        
        cur[i] = h[i];
    }
    queue<int> q;
    q.push(s);
    d[s] = 0;
    while (q.size()) {
        int u = q.front();
        q.pop();
        for (int i = h[u]; ~i; i = ne[i]) {
            int j = e[i];
            if (w[i] && d[j] == -1) {
                d[j] = d[u] + 1;
                if (j == t) return true;
                q.push(j);
            }
        }
    } 
    return false;
}

ll dfs(int u, ll ma) {
    if (u == t) return ma;
    ll flow = 0;
    for (int i = cur[u]; ~i; cur[u] = i = ne[i]) {
        int j = e[i];
        if (d[u] + 1 == d[j] && w[i]) {
            ll f = dfs(j, min(ma, w[i]));
            flow += f;
            w[i] -= f;
            w[i ^ 1] += f;
            ma -= f;
            if (!ma) break; 
        }
    }
    if (!flow) d[u] = -1;
    return flow;
}

void solve() {
    cin >> n >> m >> s >> t;
    memset(h, -1, sizeof h);
    while (m--) {
        int a, b, c;
        cin >> a >> b >> c;
        add(a, b, c);
        add(b, a, 0);
    }
    ll flow = 0;
    while (bfs()) flow += dfs(s, 1e18);
    cout << flow << endl;
}
```

结构体写法

```cpp
struct FlowGraph{
    int h[N], cur[N], e[M], ne[M], idx;
    ll w[M];
    int n, s, t;
    int d[N];
    
    void add(int a, int b, ll c, ll d = 0) {
        e[idx] = b, ne[idx] = h[a], w[idx] = c, h[a] = idx++;
        e[idx] = a, ne[idx] = h[b], w[idx] = d, h[b] = idx++;
    }

    bool bfs() {
        for (int i = 0; i <= n; i++) {
            d[i] = -1;        
            cur[i] = h[i];
        }
        queue<int> q;
        q.push(s);
        d[s] = 0;
        while (q.size()) {
            int u = q.front();
            q.pop();
            for (int i = h[u]; ~i; i = ne[i]) {
                int j = e[i];
                if (w[i] && d[j] == -1) {
                    d[j] = d[u] + 1;
                    if (j == t) return true;
                    q.push(j);
                }
            }
        } 
        return false;
    }

    ll dfs(int u, ll ma) {
        if (u == t) return ma;
        ll flow = 0;
        // 当前弧优化
        for (int i = cur[u]; ~i; cur[u] = i = ne[i]) {
            int j = e[i];
            if (d[u] + 1 == d[j] && w[i]) {
                ll f = dfs(j, min(ma, w[i]));
                flow += f;
                w[i] -= f;
                w[i ^ 1] += f;
                ma -= f;
                // 流满了就跳过
                if (!ma) break; 
            }
        }
        // 不能流了
        if (!flow) d[u] = -1;
        return flow;
    }
    
    ll dinic() {
        ll flow = 0;
        while (bfs()) flow += dfs(s, 1e18);
        return flow;
    }

    void init(int _n, int _s, int _t) {
        idx = 0;
        n = _n;
        s = _s;
        t = _t;
        for (int i = 0; i <= n; i++) h[i] = -1;
    }
}g;

void solve() {
    int s, t;
    cin >> n >> m >> s >> t;
    g.init(n, s, t);
    while (m--) {
        int a, b, c;
        cin >> a >> b >> c;
        g.add(a, b, c);
    }
    cout << g.dinic() << endl;
}
```

### 费用流

SSP算法

```cpp
struct MinCostGraph{
    int h[N], e[M], ne[M], idx;
    ll w[M], c[M], d[N], f[N];
    int n, s, t;
    int pre[N];
    bool vis[N];
    ll flow, cost;
    
    void add(int a, int b, ll _w, ll _c, ll d = 0) {
        e[idx] = b, ne[idx] = h[a], w[idx] = _w, c[idx] = _c, h[a] = idx++;
        e[idx] = a, ne[idx] = h[b], w[idx] = d, c[idx] = -_c, h[b] = idx++;
    }

    bool spfa() {
        for (int i = 0; i <= n; i++) {
            f[i] = d[i] = INF;  
            pre[i] = -1;      
        }
        queue<int> q;
        q.push(s);
        d[s] = 0;
        vis[s] = true;
        while (q.size()) {
            int u = q.front();
            q.pop();
            vis[u] = false;
            for (int i = h[u]; ~i; i = ne[i]) {
                int j = e[i];
                if (w[i] && d[u] + c[i] < d[j]) {
                    d[j] = d[u] + c[i];
                    f[j] = min(w[i], f[u]);
                    pre[j] = i;
                    if (!vis[j]) {
                        q.push(j);
                        vis[j] = true;
                    }
                }
            }
        } 
        if (d[t] != INF) {
            int u = t;
            while (~pre[u]) {
                auto& i = pre[u];
                w[i] -= f[t];
                w[i ^ 1] += f[t];
                u = e[i ^ 1];
            }
            flow += f[t];
            cost += f[t] * d[t];
            return true;
        }
        return false;
    }
    
    pair<ll, ll> solve() {
        flow = 0, cost = 0;
        while (spfa()); 
        return {flow, cost};
    }

    void init(int _n, int _s, int _t) {
        idx = 0;
        n = _n;
        s = _s;
        t = _t;
        for (int i = 0; i <= n; i++) h[i] = -1;
    }
}g;
```

Primal-Dual 原始对偶算法

```cpp
struct MinCostGraph{
    int h[N], e[M], ne[M], idx;
    ll w[M], c[M], d[N], f[N], p[N];
    int n, s, t;
    int pre[N];
    bool vis[N];
    ll flow, cost;
    
    void add(int a, int b, ll _w, ll _c, ll d = 0) {
        e[idx] = b, ne[idx] = h[a], w[idx] = _w, c[idx] = _c, h[a] = idx++;
        e[idx] = a, ne[idx] = h[b], w[idx] = d, c[idx] = -_c, h[b] = idx++;
    }

    void spfa() {
        queue<int> q;
        for (int i = 0; i <= n; i++) {
            p[i] = INF;
        }
        q.push(s);
        p[s] = 0;
        vis[s] = true;
        while (q.size()) {
            int u = q.front();
            q.pop();
            vis[u] = false;
            for (int i = h[u]; ~i; i = ne[i]) {
                int j = e[i];
                if (w[i] && p[u] + c[i] < p[j]) {
                    p[j] = p[u] + c[i];
                    if (!vis[j]) {
                        q.push(j);
                        vis[j] = true;
                    }
                }
            }
        } 
    }
    
    bool dijkstra() {
        for (int i = 0; i <= n; i++) {
            f[i] = d[i] = INF;  
            pre[i] = -1;    
            vis[i] = false;
        }
        d[s] = 0;
        priority_queue<pair<ll, ll>, vector<pair<ll, ll>>, greater<pair<ll, ll>>> q;
        q.push({0, s});
        while (q.size()) {
            int u = q.top().se;
            q.pop();
            if (vis[u]) continue;
            vis[u] = true;
            for (int i = h[u]; ~i; i = ne[i]) {
                int j = e[i];
                if (w[i] && d[u] + c[i] + p[u] - p[j] < d[j]) {
                    d[j] = d[u] + c[i] + p[u] - p[j];
                    f[j] = min(w[i], f[u]);
                    pre[j] = i;
                    q.push({d[j], j});
                }
            }
        }
        return d[t] != INF;
    }

    pair<ll, ll> solve() {
        flow = 0, cost = 0;
        spfa();
        while (dijkstra()) {
            for (int i = 0; i <= n; i++) {
                p[i] += d[i];
            }
            int u = t;
            while (~pre[u]) {
                auto& i = pre[u];
                w[i] -= f[t];
                w[i ^ 1] += f[t];
                u = e[i ^ 1];
            }
            flow += f[t];
            cost += f[t] * p[t];
        } 
        return {flow, cost};
    }

    void init(int _n, int _s, int _t) {
        idx = 0;
        n = _n;
        s = _s;
        t = _t;
        for (int i = 0; i <= n; i++) h[i] = -1;
    }
}g;
```

zkw费用流：多路增广，适用于流量大、费用取值范围小不大的图或者时增广路径较短的图（如二分图

```cpp
struct MinCostGraph{
    int h[N], cur[N], e[M], ne[M], idx;
    ll w[M], c[M], d[N];
    int n, s, t;
    bool vis[N];
    ll flow, cost;
    
    void add(int a, int b, ll _w, ll _c, ll d = 0) {
        e[idx] = b, ne[idx] = h[a], w[idx] = _w, c[idx] = _c, h[a] = idx++;
        e[idx] = a, ne[idx] = h[b], w[idx] = d, c[idx] = -_c, h[b] = idx++;
    }

    bool spfa() {
        for (int i = 0; i <= n; i++) {
            d[i] = INF;  
            cur[i] = h[i];
        }
        deque<int> q;
        q.push_back(s);
        d[s] = 0;
        vis[s] = true;
        while (q.size()) {
            int u = q.front();
            q.pop_front();
            vis[u] = false;
            for (int i = h[u]; ~i; i = ne[i]) {
                int j = e[i];
                if (w[i] && d[u] + c[i] < d[j]) {
                    d[j] = d[u] + c[i];
                    if (!vis[j]) {
                        if (q.size() && d[j] < d[q.front()]) {
                            q.push_front(j);
                        } else {
                            q.push_back(j);
                        }
                        vis[j] = true;
                    }
                }
            }
        } 
        return d[t] != INF;
    }
    
    ll dfs(int u, ll ma) {
        if (u == t || !ma) return ma;
        vis[u] = true;
        ll flow = 0;
        for (int&i = cur[u]; ~i; i = ne[i]) {
            int j = e[i];
            if (!vis[j] && w[i] && d[j] == d[u] + c[i]) {
                ll f = dfs(j, min(ma, w[i]));
                ma -= f;
                flow += f;
                w[i] -= f;
                w[i ^ 1] += f;
                cost += f * c[i];
                if (!ma) break;
            }
        }
        vis[u] = false;
        if (!flow) d[u] = INF;
        return flow;
    }

    pair<ll, ll> solve() {
        flow = 0, cost = 0;
        while (spfa()) {
            // INF 0x3f3f3f3f or 1e18
            flow += dfs(s, INF);
        }
        return {flow, cost};
    }

    void init(int _n, int _s, int _t) {
        idx = 0;
        n = _n;
        s = _s;
        t = _t;
        for (int i = 0; i <= n; i++) h[i] = -1;
    }
}g;
```







## 竞赛图

有向完全图

- 竞赛图强连通缩点后的DAG呈链状, 前面的所有点向后面的所有点连边
- 竞赛图的强连通块 存在一条哈密顿回路
- 竞赛图存在一条 哈密顿路径
- 竞赛图里, 大小为 n>1 的强连通块中, 大小为 [3,n] 的简单环均存在
- 定义比分序列为将每个点的出度 $s_i$从小到大排序的序列，一定有$\sum_{i=1}^{k}s_i \ge C_k^2$，且当$k=n$时取等
