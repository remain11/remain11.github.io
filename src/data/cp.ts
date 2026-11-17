export interface CpLink {
  name: string;
  description: string;
  url: string;
  tag: string;
}

export const cpLinks: CpLink[] = [
  {
    name: '知乎 · remain11',
    description: '知乎主页，题解、算法笔记与日常分享。',
    url: 'https://www.zhihu.com/people/remain11',
    tag: '知乎',
  },
  {
    name: '面向天梯赛、蓝桥杯的 Dev C++ 配置教程',
    description: '从零配置 Dev C++ 的编译环境、调试与常用设置。',
    url: 'https://zhuanlan.zhihu.com/p/1896591542535292631',
    tag: '教程',
  },
  {
    name: 'VJudge · 保研机试题单',
    description: '个人整理的保研机试题目合集，按专题分类，可在线提交。',
    url: 'https://vjudge.net/article/8781',
    tag: 'VJudge',
  },
];
