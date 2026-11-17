---
title: "算法知识"
description: "DP、字符串、哈希与常见杂项技巧的算法笔记。"
date: 2026-05-07
tags: [算法, 模板, C++]
---
## DP

### 数位dp

对于求区间$[l,r]$之间的满足某些性质的数的个数，直接暴力做是$O(n*check)$，一般无法通过

解决此类问题我们一般采取以下步骤

- 解决$[1,r]$和$[1,l-1]$的问题
- 将数字拆位
- 把所有状态塞到数组，记忆化搜索，从高位到低位考虑

```cpp
vector<int>a;   //拆位数组
int b;          //b进制
ll f[60];       //记忆化数组,f[pos]定义为在没有限制没有前导零的情况,从pos位开始填的答案
                //状态数随题目条件改变,一般不止一维,记得初始化为-1

//pos表示还有几位要填
//lim表示是否有最高位限制
//lead表示是否填的数全是前导0,这里0也会被判成前导0,不过一般不影响结果
//st是与题目相关的状态,数量和名字都依据题目变化
ll dfs(int pos,bool lim=1,int st,bool lead=1){
    if (!pos) return 1;   //递归到底层,满足要求就返回1
    if (!lim&&!lead&&~f[pos][st]) return f[pos][st]; //如果发现没有限制,不全是0且状态搜过则直接返回
    int up = lim ? a[pos - 1] : b - 1;//当前位最高能填多少
    ll ans = 0;
    for (int i = 0; i <= up; i++){
        //一些与题目要求去条件的判断
        ans += dfs(pos-1,lim&&i==up,  ,lead&&!i);
    }
    if(!lim&&!lead)f[pos][st]=ans;//如果发现没有限制,不全是0,则加入记忆化数组                                       
    return ans;
} 

ll calc(ll x){
    if(!x)return 1;                 //把<=0的特判掉
    a.clear();                      //清空上次数组
    while(x)a.push_back(x%b),x/=b;  
    return dfs(a.size(),1,0,1);
}

void solve() {
    ll l,r;
    b=10;
    cin>>l>>r;
    cout<<calc(r)-calc(l-1)<<endl;
}
```

#### 典题

##### [数字计数 数位计数](https://www.luogu.com.cn/problem/P2602 "P2602")

题意：求$[l,r]$区间内**各个数的的出现次数**

```cpp
#include<bits/stdc++.h>
using namespace std;

#define fi first
#define se second
#define lowbit(x) ((x)&(-x));

typedef long long ll;
typedef pair<int,int> pii;
const int N=4e5+10,M=2e5+10,mod=1e9+7,INF=0x3f3f3f3f;
int n,m,k,q;
vector<int>a;
int b,num;       //num表示当前填的数
ll f[25][20][10];//f[pos][cnt][num]表示考虑还有pos为需要填且已经出现了cnt次num的答案

//注意要判掉前导0，07中是没有出现0的，
//0需要被特，因为0也被判成前导0了

ll dfs(int pos,bool lim,int cnt,bool lead){
    if(pos==0)return cnt;
    if(!lim&&!lead&&f[pos][cnt][num]!=-1)return f[pos][cnt][num];
    int up=lim?a[pos-1]:b-1;
    ll ans=0;
    for(int i=0;i<=up;i++){
        //这里分成非0和0了
        if(num)ans+=dfs(pos-1,lim&&i==up,cnt+(i==num),lead&&i==0);
        else ans+=dfs(pos-1,lim&&i==up,cnt+(i==num&&!lead),lead&&i==0);
    }
    if(!lim&&!lead)f[pos][cnt][num]=ans;                                                   
    return ans;
} 

ll calc(ll x){
    if(!x)return 0;
    a.clear();
    while(x)a.push_back(x%10),x/=10;
    return dfs(a.size(),1,0,1);
}

void solve() {
    ll l,r;
    cin>>l>>r;
    b=10;
    for(int i=0;i<=9;i++){
        num=i;
        cout<<calc(r)-calc(l-1)<<" ";
    }
}

int main() {
    cin.tie(0);
    cout.tie(0);
    ios::sync_with_stdio(0);
    int _;
    _=1;
    memset(f,-1,sizeof f);
    //cin>>_;
    while(_--) {
        solve();
    }
    return 0;
}
```



##### [烦人的数学作业 数位总和](https://www.luogu.com.cn/problem/P4999 "P4999")  

题意：求$[l,r]$区间内**每个数的数字和**，如114514的数字和为16

```cpp
int f[25][200];//f[pos][sum]定义为从pos位考虑完，且前面填的数的总和为sum的答案
//这里前导0不影响和，所以少限制了个状态
int dfs(int pos,bool lim,int sum){
    if(!pos)return sum;
    if(!lim&&~f[pos][sum])return f[pos][sum];
    int up=lim?a[pos-1]:9;
    int ans=0;
    for(int i=0;i<=up;i++){
        ans+=dfs(pos-1,lim&&i==up,sum+i);
        ans%=mod;
    }
    if(!lim)f[pos][sum]=ans;
    return ans;
} 
```

### 动态dp

一般用于解决带修的强制在线询问的dp问题，原dp为树形dp或是线性dp，带修过后需要用到矩阵乘法和一些数据结构优化。

在线询问树的最大权独立集的大小，带修。

```cpp
#include<bits/stdc++.h> 

using namespace std;

#define fi first
#define se second
#define lowbit(x) ((x)&(-x))   
#define endl '\n'

typedef long long ll;
typedef pair<int,int> pii;
const int N=1e5+10,M=2e5+10,mod=998244353,INF=0x3f3f3f3f;
int n, m, k;
int w[N];
vector<int> e[N];
int dp[N][2],g[N][2];
int s[N],son[N],fa[N],dep[N];
int uid[N],idu[N],top[N],ed[N],cnt;
//ed[i]为i节点所在重链的最后一个节点


struct Matrix{
    int mat[2][2];
    Matrix(){
        for (int i = 0 ; i < 2; i ++) {
            for (int j = 0; j < 2; j ++) {
                mat[i][j] = -INF;
            }
        }
    }
    Matrix operator*(Matrix b){
        Matrix c;
        for (int i = 0; i < 2; i ++) {
            for (int k = 0; k < 2; k ++) {
                for (int j = 0; j < 2; j ++) {
                    c.mat[i][j] = max(c.mat[i][j], mat[i][k] + b.mat[k][j]);
                }
            }
        }
        return c;
    }
};
Matrix val[N];

struct Tr{
    int l, r;
    Matrix c;
}tr[4*N];

//由于dfs序是先从重链首节点开始的，结束于链尾
//所以矩阵乘法要由重链尾节点开始，结束于首节点，左乘更新
void pushup(Tr&rt, Tr&l, Tr&r){
    rt.c = l.c * r.c;
}

void pushup(int u){
    pushup(tr[u], tr[u << 1], tr[u << 1 | 1]);
}

void build(int u, int l, int r){
    if(l == r){
        tr[u]={l, r, val[idu[l]]};
        return;
    }
    tr[u] = {l, r};
    int mid = l + r >> 1;
    build(u << 1, l, mid);
    build(u << 1 | 1, mid + 1, r);
    pushup(u);
}
//x 为dfn序 
void update(int u, int x){
    if (x <= tr[u].l && tr[u].r <= x) {
        tr[u].c = val[idu[x]];
        return;
    }
    int mid = tr[u].l + tr[u].r >> 1;
    if (x <= mid) update(u << 1, x);
    if (x > mid) update(u << 1 | 1, x);
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

void dfs1(int u, int father, int d) {
    s[u] = 1, fa[u] = father, dep[u] = d;
    for (auto i : e[u]) {
        if (i == father) continue;
        dfs1(i, u, d + 1);
        s[u] += s[i];
        if(s[i] > s[son[u]]) son[u] = i;
    }
}
//第二遍数剖顺便处理g
void dfs2(int u, int t) {
    uid[u] = ++ cnt, idu[cnt] = u, top[u] = t;
    //预处理dp g val
    val[u].mat[0][0] = val[u].mat[0][1] = dp[u][0] = 0;
    val[u].mat[1][0] = dp[u][1] = w[u];
    if (!son[u]){
        ed[u] = u;
        return;
    }
    dfs2(son[u], t);
    ed[u] = ed[son[u]];
    //更新重儿子的贡献
    dp[u][0] += max(dp[son[u]][0], dp[son[u]][1]);
    dp[u][1] += dp[son[u]][0];
    for (auto i : e[u]) {
        if (i == fa[u] || i == son[u]) continue;
        dfs2(i, i);
        //更新轻儿子的贡献
        dp[u][0] += max(dp[i][0], dp[i][1]);
        dp[u][1] += dp[i][0];
        //更新val
        val[u].mat[0][0] += max(dp[i][0], dp[i][1]);
        val[u].mat[0][1] = val[u].mat[0][0];
        val[u].mat[1][0] += dp[i][0];
    }
}
//这里路径询问只为根节点1到u的路径
void update_path(int u, int d) {
    val[u].mat[1][0] += d - w[u]; 
    w[u] = d;
    while (1) {
        auto last = query(1, uid[top[u]], uid[ed[u]]);
        update(1, uid[u]);
        auto now = query(1, uid[top[u]], uid[ed[u]]);
        u = fa[top[u]];
        //到达根节点，跳出循环，否则会越界访问
        if (u == -1) break;
        //父节点的轻儿子矩阵改变，需更新父节点矩阵
        val[u].mat[0][0] += max(now.c.mat[0][0], now.c.mat[1][0]) - max(last.c.mat[0][0], last.c.mat[1][0]);
        val[u].mat[0][1] = val[u].mat[0][0];
        val[u].mat[1][0] += now.c.mat[0][0] - last.c.mat[0][0];
    }
}

void solve() {
    cin >> n >> m;
    for (int i = 1; i <= n; i ++ ) {
        cin >> w[i];
    }
    for (int i = 1; i < n; i ++) {
        int a, b;
        cin >> a >> b;
        e[a].push_back(b); 
        e[b].push_back(a);
    }
    dfs1(1, -1, 1);
    dfs2(1, 1);
    build(1, 1, n);
    while (m -- ){
        int a, b; 
        cin >> a >> b;
        update_path(a, b);
        auto res = query(1, uid[1], uid[ed[1]]);
        cout << max(res.c.mat[0][0], res.c.mat[1][0]) << endl;
    }
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

### 期望dp

有环时，会用到高斯消元。

在联通无向图上，由$1\rightarrow n$的期望路径长度

定义$dp[i]$为$i\rightarrow n$的期望长度

由
$$
dp[n]=0\\
dp[i]=\sum _{j\in son[i]}dp[j]/d[i] +1
$$
高斯消元可得答案

```cpp
const double eps = 1e-6;
int n, m, k;
vector<int> e[N];
int s[N];
double a[N][N];

int gauss() {
    int r, c;
    for (r = 0, c = 0; c < n; c ++) {
        int t = r;
        for (int i = r; i < n; i ++) {
            if (fabs(a[i][c]) > fabs(a[t][c])) t = i;
        }
        if (fabs(a[t][c]) < eps) continue;
        for (int i = c; i <= n; i ++) {
            swap(a[t][i], a[r][i]);
        }
        for (int i = n; i >= c; i --) {
            a[r][i] /= a[r][c];
        }
        for (int i = r + 1; i < n; i ++) {
            if(fabs(a[i][c]) > eps) {
                for (int j = n; j >= c; j --) {
                    a[i][j] -= a[i][c] * a[r][j];
                }
            }
        }
        r ++;
    }
    for (int i = n - 1; i >= 0; i --) {
        for (int j = i + 1; j < n; j ++) {
            a[i][n] -= a[j][n] * a[i][j];
        }
    }
    return 0;
}

void solve() {
    cin >> n >> m;
    for (int i = 1; i <= m; i ++) {
        int a, b;
        cin >> a >> b;
        a --, b --;
        e[a].push_back(b);
        e[b].push_back(a);
        s[a] += i, s[b] += i;
    }
    a[n - 1][n - 1] = 1;
    for (int i = 0; i <= n - 2; i ++) {
        for (int j : e[i]) {
            a[i][j] = -1.0 / e[i].size();
        }
        a[i][i] = 1;
        a[i][n] = 1.0 * s[i] / e[i].size();
    }
    for (int i = 0; i < n; i ++) {
        for (int j = 0 ; j <= n; j ++) {
            cout << a[i][j] << " \n"[j == n];
        }
    }
    cout << gauss() << endl;
    cout << fixed << setprecision(2) << a[0][n] << endl;
}
```

### 可撤销背包

设$a[i]$第$i$个物品的体积， $f[j]$为考虑前$i$个物品，容积为$j$的方案数，$g[j]$为撤销某物品$k$的方案数，于是有
$$
f[j]=f[j]+f[j-x], 倒序枚举 \\
g[j]=f[j]-g[j-x], 正序枚举
$$

```cpp
// 板子
void solve() {
    cin >> n >> m;
    vector<int> f(m + 1);
    f[0] = 1;
    while (n--) {
        char op;
        int x;
        cin >> op >> x;
        if (op == '+') {
            for (int i = m; i >= x; i--) {
                f[i] = (f[i] + f[i - x]) % mod;
            }
        } else {
            for (int i = x; i <= m; i++) {
                f[i] = (f[i] - f[i - x] + mod) % mod;
            }
        }
        cout << f[m] << endl;
    }
}
```





## 字符串

### hash

单哈希+自然溢出

```cpp
const int N=1e5+10,P=131;// or P=13331
typedef unsigned long long ull;
ull a[N],p[N];
char str[N];
int n,m;
ull get(int l,int r){
    return a[r]-a[l-1]*p[r-l+1];
}
```

大模数单哈希

```cpp
typedef unsigned long long ull;
ull p[N], h[N];

const ull mod = (1ull << 61) - 1, P = 1e9+7;

// mt19937_64 rnd(chrono::steady_clock::now().time_since_epoch().count());
// uniform_int_distribution<ull> dist(mod / 2, mod - 1);
// const ull P = dist(rnd);

// 哈希时全部转化成正数 add(-2, mod) != (-2) % mod 
ull add(ull a, ull b){
    a += b;
    if (a >= mod) a -= mod;
    return a;
}
// 保证字符集 < P 
ull mul(ull a, ull b){
    __uint128_t c = __uint128_t(a) * b;
    return add(c >> 61, c & mod);
}

ull get(int l, int r) {
    return add(h[r], mod - mul(h[l - 1], p[r - l + 1]));
}
```



### 最小表示法

```cpp
string getmin(int str[]) {
    n = strlen(str + 1);
    for (int i = 1; i <= n; i ++) {
        t[i + n] = t[i] = str[i];
    }
    int i = 1, j = 2;
    while (j <= n) {
        int k = 0;
        while (k < n && t[i + k] == t[j + k]) k ++;
        if (t[i + k] > t[j + k]) {
            i += k + 1;
        } else {
            j += k + 1;
        }
        if (i == j) j ++;
        if (i > j) swap(i, j);
    }
    string res = "";
    for (int k = i; k <= i + n - 1; k ++) {
        res += t[k];
    }
    return res;
}
```



### kmp

```cpp
cin>>n>>p+1>>s+1;
for(int i=2,j=0;i<=n;i++){
    while(j&&p[i]!=p[j+1])j=ne[j];
    if(p[i]==p[j+1])j++;
    ne[i]=j;
}
for(int i=1,j=0;i<=m;i++){
    while(j&&s[i]!=p[j+1])j=ne[j];
    if(s[i]==p[j+1])j++;
    if(j==n)cout<<i-n<<" ";
}
```

#### exkmp

```cpp
string a,b;
cin>>a>>b;
a=" "+b+'#'+a;
int n=a.size()-1,m=b.size();
vector<int>z(n+5);
int l=1,r=0;
z[1]=m;
for(int i=2;i<=n;i++){
    if(i<=r){
        int k=i-l+1;
        z[i]=min(z[k],r-i+1);
    }else z[i]=0;
    while(i+z[i]<=n&&a[z[i]+1]==a[i+z[i]])z[i]++;
    if(i+z[i]-1>r){
        l=i,r=i+z[i]-1;
    }
}
```



### manacher

```cpp

char a[N],b[N];
int p[N];
int res;

void init(){
    b[k++]='$',b[k++]='#';
    for(int i=0;i<n;i++){
        b[k++]=a[i];
        b[k++]='#';
    }
    b[k++]='^';
    n=k;
}

void manacher(){
    int mr=1,mid;
    for(int i=1;i<n;i++){
        if(i<mr)p[i]=min(p[2*mid-i],mr-i);
        else p[i]=1;
        while(b[i-p[i]]==b[i+p[i]])p[i]++;
        if(p[i]+i>mr){
            mid=i;
            mr=p[i]+i;
        }
    }
}
```

### AC自动机

```cpp
typedef long long ll;
typedef pair<int,int> pii;
const int N=2e5+10,M=26,mod=998244353,INF=0x3f3f3f3f;
int n, m, k;
int son[N][M],d[N],idx;
int go[N][M],fail[N];
ll cnt[N];
int q[N];
int hh, tt = -1;

void build() {
    q[++ tt] = 0;
    while (hh <= tt) {
        auto t = q[hh++];
        for (int j = 0; j < M; j++) {
            // 如果节点存在
            if (son[t][j]) {
                go[t][j] = son[t][j];
                // 如果为根节点
                if (!t) fail[go[t][j]] = t;
                else fail[son[t][j]] = go[fail[t]][j];
                q[++tt] = son[t][j]; 
            } else {
                if (!t) go[t][j] = t; 
                else go[t][j] = go[fail[t]][j];
            }
        } 
    }
}

void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) {
        string s;
        cin >> s;
        int t = 0;
        for (int j = 0; j < s.size(); j++) {
            int u = s[j] - 'a';
            if (!son[t][u]) son[t][u] = ++idx;
            t = son[t][u];
        }
        d[i] = t;
    }
    build();
    int t = 0;
    string str;
    cin >> str;
    // 统计文本中子串出现次数
    for (auto i : str) {
        if (i == '0') t = 0;
        else t = go[t][i - 'a'];
        cnt[t]++;
    }
    for (int i = tt; i >= 1; i--) {
        cnt[fail[q[i]]] += cnt[q[i]]; 
    }
    for (int i = 1; i <= n; i++) {
        cout << cnt[d[i]] << endl;
    }
}
```



## 杂项

### 异或-拆位

以下将记xor为为$\oplus$

#### [异或和之和](https://www.luogu.com.cn/problem/P9236 "P9236")

对于类似形如这样的式子
$$
\sum_{i=1}^{n}\sum_{j=i}^n\bigoplus_{k=i}^{j}a_k\\
$$

就可以使用拆位的技巧，记
$$
b_i=\bigoplus_{j=1}^ia_j
$$
则原式转化为
$$
\sum_{i=1}^{n}\sum_{j=i}^n(b_j\oplus b_{i-1})\\
$$
然后由于位运算的独立性，我们发现当$b_j\oplus b_{i-1}$的2进制第k位上位1时此时区间$[i,j]$有贡献$1<<k$
$$
res=\sum_{k=0}^{29}\sum_{i=1}^{n}\sum_{j=i}^n2^k[\lfloor\frac{b_j\oplus b_{i-1}}{2^k}\rfloor \%2=1]
$$




对于2进制上每一位维护一个0/1前缀和$s[0]\ ,s[1]$，$s[u]$表示考虑前i个$b[i]$的二进制第$k$位上为$u$的数量的前缀和，枚举每个$b[i]$，并把当前位加入$s$数组中

代码

``` c++

#include<bits/stdc++.h>

using namespace std;

#define fi first
#define se second
#define lowbit(x) ((x)&(-x))
#define endl '\n'

const int N=3e5+10,M=2e5+10,mod=998244353,INF=0x3f3f3f3f;
typedef long long ll;
typedef __int128 lll;
typedef pair<int,int> pii;
ll t,n,m,k;
int a[N],b[N];

int main(){
    ios::sync_with_stdio(0);
    cin.tie(0);
    cout.tie(0);
    t=1;
    while(t--){
        cin>>n;
        for(int i=1;i<=n;i++){
            cin>>a[i];
            b[i]=a[i]^b[i-1];
        }
        ll res=0;
        for(int i=20;i>=0;i--){
            int s[2]={0,0};
            for(int j=1;j<=n;j++){
                int u=b[j-1]>>i&1,v=b[j]>>i&1;
                //将前一位加入数组中，并统计区间[?,j]的答案
                s[u]++;
                res=(res+(1ll<<i)*s[!v]);
            }
        }
        cout<<res<<endl;
    }
    return 0;
}
```


时间复杂度$O(nlogV)$

### unordered_map/set 自定义哈希

```c++
struct HASH{
    int operator()(const pii&w)const{
    	hash<ll>hll;
        ll x=hash<int>()(w.fi),y=hash<int>()(w.se);
        return hash<ll>()(x<<32^y);
    }
};
unordered_set<pii,HASH>s;
```



### set/map/priority_queue 传入比较函数

```cpp
// 降序排列
auto cmp = [](int a, int b) { return a > b; };
std::set<int, decltype(cmp)> s(cmp);  // 必须传入 cmp 对象

// 小顶堆（注意符号相反）
auto cmp = [](int a, int b) { return a > b; };
std::priority_queue<int, std::vector<int>, decltype(cmp)> pq(cmp);
```





### stringstream

```c++
getline(cin, str);
stringstream ss(str);
ss.clear(); // 每次while(ss >> s) 需要清空异常状态，或者每次新建
ss << str; // ss.str(str); 这三种方式一个意思
while(ss >> s) {
    
} 
```





### 重载

```cpp
priority_queue(大根堆)
    set map 使用<less> 比较规则时,自定义结构体需要重载<号

struct E{
    int a,b;
    bool operator<(const E&w)const{
        return this -> a < w.a;
    }
};

小根堆或则使用<greater> 比较规则,需重载>号
struct E{
    int a,b;
    bool operator>(const E&w)const{
        return a>w.a;
    }
};
```



### 反悔贪心

如题，大概是指使用某一贪心策略，但是该贪心策略不一定是全对的，需要依据后面的数据调整前面贪心的具体项目，相当于可以反悔，通常使用优先队列实现。

### 二分

#### 简单二分

注意到答案具有单调性，或者看到题目中含有最小值最大或是最大值最小等字眼。

#### 整体二分 

这里以离线查询区间第$k$大为例

```cpp
int a[N],res[N],tr[N];
typedef struct Node{
    int x,y,k,id,type;
    //  a[id]=x    0(add)
    //  [x,y] k id 1(query)
}node;
//树状数组
void add(int x,int c){
    for(;x<=n;x+=lowbit(x)){
        tr[x]+=c;
    }
}

int sum(int x){
    int res=0;
    for(;x;x-=lowbit(x)){
        res+=tr[x];
    }
    return res;
}

int query(int l,int r){
    return sum(r)-sum(l-1);
}
//整体二分的是值域[-INF,INF]
void work(vector<node>q,int l,int r){
    //如果没数就反悔
    if(!q.size())return;
    if(l==r){
        //此时找到答案，并更新
        for(auto i:q){
            if(i.type){
                res[i.id]=l;
            }
        }
        return;
    }
    int mid=(l+r)>>1;
    vector<node>q1,q2;
    for(auto&i:q){
        //处理a[id]在[l,mid]的情况
        if(!i.type){
            if(i.x<=mid){
                q1.push_back(i);
                add(i.id,1);
            }else q2.push_back(i);
        }else{
        //此时[l,mid]的影响已经更新在tr中，因为type 0总是在type 1 前面
            int ans=query(i.x,i.y);
            if(i.k<=ans)q1.push_back(i);
            else{
                i.k-=ans;
                q2.push_back(i);
            }
        }
    }
    //消除[l,mid]的影响
    for(auto i:q1){
        if(!i.type){
            add(i.id,-1);
        }
    }
    work(q1,l,mid),work(q2,mid+1,r);
}

void solve() {
    cin>>n>>m;
    vector<node>q;
    for(int i=1;i<=n;i++){
        int x;
        cin>>x;
        q.push_back({x,0,0,i,0});
    }
    for(int i=1;i<=m;i++){
        int l,r,k;
        cin>>l>>r>>k;
        q.push_back({l,r,k,i,1});
    }
    work(q,-INF,INF);
    for(int i=1;i<=m;i++){
        cout<<res[i]<<endl;
    }
}

```

一共$logn$层，一共遍历$nlogn$个点，在树状数组上操作，于是时间复杂度为$O(nlog^2n)$

### 三分

浮点数三分直接限定次数即可

```cpp
int l=0,r=1e9;
while(l+2<r){
    int m1=(r-l)/3+l,m2=(r-l)/3*2+l;
    if(f(m1)>f(m2))l=m1;
    else r=m2;
}
```





### 易错点

-  $(x+mod)\%mod$注意$x$变化加减数时应该转化为$ll$类型
- 负数取模$(x\%mod+mod)\%mod$，转化为非负数，如果想转化为正数需特判$0$​
- 树形dp判叶子节点的时候需要注意根节点

#### 取整

- 除法是向$0$取整

#### 初始化

- 可以用`scanf("%lld",&a)读__int128`不过要初始化`__int128 a = 0;`

### 对拍

windows系统里

```cpp
#include<bits/stdc++.h>

using namespace std;

const int N=1e5;

void generate_data(){
	ofstream fout ("input.txt");
    //fout
}

int main(){
	srand(time(0));
	for(int i=0;i<1000;i++){
		printf("i=%d\n",i);
		generate_data();
		system("beatmatching\\bin\\a.exe <input.txt> beatmatching\\a.txt");
		system("beatmatching\\bin\\b.exe <input.txt> beatmatching\\b.txt");
		if(system("fc beatmatching\\a.txt beatmatching\\b.txt")){
			puts("wrong!");
			break;
		}
	}
}

```
linux系统里
```bash
#! /bin/bash
g++ mkd.cpp -o mkd -O2
g++ std.cpp -o std -O2
g++ my.cpp -o my -O2
cnt=0
while (($? == 0));do
    cnt=$$(cnt+1)
    echo $cnt
    ./mkd > 1.txt
    ./std < 1.txt > 2.txt
    ./my < 1.txt > 3.txt
    cmp 2.txt 3.txt
done
```



### 提交前检查

- 数据范围是否越界
- 答案范围？是否回爆`int`
- 想一点极端的、特殊的小样例
- 从头到尾检查一遍实现是否正确
