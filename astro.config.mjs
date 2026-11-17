import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// 部署到 https://remain11.github.io 时保持 base: '/'
// 如果部署到项目仓库（如 /homepage），改成 base: '/homepage'
export default defineConfig({
  site: 'https://remain11.github.io',
  base: '/',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: 'ignore' }]],
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
