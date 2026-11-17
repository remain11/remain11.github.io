# remain11 · 个人主页

一个极简亮色风格的个人主页，使用 [Astro](https://astro.build/) 构建，部署目标为 GitHub Pages。

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:4321。

```bash
npm run build      # 构建到 dist/
npm run preview    # 本地预览构建结果
```

## 页面结构

| 路径 | 内容 |
| --- | --- |
| `/` | 简介（求学、竞赛、跑步）+ 技术、算竞、项目精选 |
| `/tech` | 技术：本地 Markdown 笔记 + CS:APP 知乎专栏 |
| `/tech/<文件名>/` | 技术笔记详情（桌面端左侧目录，移动端折叠目录） |
| `/cp` | 算竞：知乎专栏、模版、经验、帖子链接 |
| `/cp/templates/<文件名>/` | 算法模板详情 |
| `/cp/notes/<文件名>/` | 算竞经验文章详情 |
| `/projects` | GitHub 项目 |
| `/agent` | Agent 使用轨迹（占位，后续开发） |

## 技术笔记

`src/content/tech/` 下目前有 7 篇笔记：

| 文件 | 内容 | 日期 |
| --- | --- | --- |
| `generative-software-engineering.md` | 生成式软件工程笔记 | 2026.11 |
| `cpp-notes.md` | C++ 学习笔记 | 2026.02 |
| `pa0.md` | PA0：实验环境与 hello world | 2026.01 |
| `pa1.md` | PA1：NEMU 与表达式求值 | 2026.01 |
| `pa2.md` | PA2：指令与运行时环境 | 2026.01 |
| `linux-notes.md` | Linux 基础课笔记 | 2024.06 |
| `markdown-syntax.md` | Markdown 语法知识 | 2023.08 |

新增笔记时，在 `src/content/tech/` 新建 `.md` 文件：

```yaml
---
title: 笔记标题
description: 一句话摘要，会显示在列表里
date: 2026-11-17
tags: [Linux, Shell]
---

正文……
```

保存后会自动出现在 `/tech` 列表，并生成 `/tech/<文件名>/` 详情页。支持代码高亮（Shiki，github-light 主题）和 KaTeX 数学公式（`$...$` 与 `$$...$$`）。

长文章在桌面端会自动生成**左侧固定目录**：支持多级标题折叠、滚动高亮当前章节，目录本身可独立滚动；移动端收成可展开的「目录」框。

笔记中的图片放到 `public/notes/<文件名>/`，Markdown 里用 `/notes/<文件名>/图片.png` 引用。

## 算竞

`/cp` 分为四块：

1. **知乎专栏**：两个横向专栏卡片：
   - 算法竞赛题解专栏 https://www.zhihu.com/column/c_2105810139177665145
   - 算法竞赛知识专栏 https://www.zhihu.com/column/c_2105821223183767478
2. **模版**：`src/content/templates/` 下的 5 篇模板：
   - 数据结构模板
   - 图论模板
   - 数学模板
   - 算法知识
   - 计算几何模板
3. **经验**：`src/content/cpNotes/experience.md`，保研机试准备经验分享。
4. **帖子链接**：`src/data/cp.ts`，包含知乎主页、Dev C++ 配置教程和 VJudge 保研机试题单。

模板与经验文章的详情页在 `/cp/templates/<文件名>/` 和 `/cp/notes/<文件名>/`，同样支持左侧目录。

## 知乎专栏卡片

编辑 `src/data/zhihu.ts`：

```ts
{
  title: '专栏标题',
  cover: '/covers/your-cover.svg',
  url: 'https://www.zhihu.com/column/xxxx',
  category: 'solutions', // solutions | knowledge | tech
}
```

- 封面放在 `public/covers/`，用本地图片，避免知乎图床防盗链导致裂图。
- `solutions` 和 `knowledge` 会显示在算竞页，`tech` 会显示在技术页。
- 目前挂了三个真实专栏：算法竞赛题解、算法竞赛知识、CS:APP 实验题解。

## 跑步经历

跑步模块的数据在 `src/data/profile.ts` 的 `running` 中：

- `intro`、`stats`：左侧文字与数据（约 4000 km、半马 PB 1:26:26）；
- `photos`：中间滚动照片，图片在 `public/running/`；
- `races`：右侧比赛经历，目前 11 场。

照片来自个人资料中的跑协活动图，替换 `public/running/run-01.jpg` 等文件即可。

## 添加项目

编辑 `src/data/projects.ts`，每项包含 `name`、`description`、`url`、`language`、`languageColor`、`year`、`tags`，`stars` 可选。目前展示 4 个项目。

## 修改个人信息

- 姓名、简介、邮箱、社交链接：`src/data/profile.ts`
- 求学经历（`education`）：`src/data/profile.ts`
- 竞赛与认证（`awards`）：`src/data/profile.ts`
- 跑步经历（`running`）：`src/data/profile.ts`
- 首页生活照：替换 `public/portrait.jpg`

> 初中 / 高中按 2019 年拆分，如果与实际入学年份不符，直接改 `education` 里的 `period`。

## 部署到 GitHub Pages

推荐直接用用户主页仓库 `remain11.github.io`：

1. 在 GitHub 新建仓库 `remain11.github.io`（公开）。
2. 推送代码：

   ```bash
   git init
   git add .
   git commit -m "init personal homepage"
   git branch -M main
   git remote add origin git@github.com:remain11/remain11.github.io.git
   git push -u origin main
   ```

3. 打开仓库 **Settings → Pages**，把 **Source** 设为 **GitHub Actions**。
4. 稍等片刻，访问 https://remain11.github.io。

仓库里已经包含 `.github/workflows/deploy.yml`，之后每次 push 到 `main` 都会自动构建并发布。

### 如果部署到项目仓库

比如仓库名是 `homepage`，访问地址会变成 `https://remain11.github.io/homepage/`。需要把 `astro.config.mjs` 里的 `base` 改成：

```js
base: '/homepage',
```

同时把站内绝对路径（`/covers/...`、`/running/...`、`/portrait.jpg` 等）改成带 base 的路径。当前配置按用户主页仓库设置，建议先走 `remain11.github.io`。

## 已知待办

- [ ] Agent 轨迹模块
