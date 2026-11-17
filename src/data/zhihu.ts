export type ZhihuCategory = 'solutions' | 'knowledge' | 'tech';

export interface ZhihuPost {
  title: string;
  cover: string;
  url: string;
  category: ZhihuCategory;
  date?: string;
}

/**
 * 知乎帖子 / 专栏卡片。
 * 封面图建议放到 public/covers/ 下（本地图片不会被知乎防盗链拦截）。
 */
export const zhihuPosts: ZhihuPost[] = [
  {
    title: '算法竞赛题解专栏',
    cover: '/covers/solution-1.svg',
    url: 'https://www.zhihu.com/column/c_2105810139177665145',
    category: 'solutions',
  },
  {
    title: '算法竞赛知识专栏',
    cover: '/covers/knowledge.svg',
    url: 'https://www.zhihu.com/column/c_2105821223183767478',
    category: 'knowledge',
  },
  {
    title: 'CS:APP 实验详细题解合集',
    cover: '/covers/csapp.svg',
    url: 'https://www.zhihu.com/column/c_1892333014178068030',
    category: 'tech',
  },
];

export const zhihuCategoryLabel: Record<ZhihuCategory, string> = {
  solutions: '题解',
  knowledge: '知识',
  tech: '技术',
};
