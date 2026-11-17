export interface Project {
  name: string;
  description: string;
  url: string;
  language: string;
  languageColor: string;
  stars?: number;
  year: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    name: 'interview-review',
    description: '本地运行的八股刷题站，无需后端即可看答案，越刷越少，支持 Tailscale 手机访问。',
    url: 'https://github.com/remain11/interview-review',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    stars: 2,
    year: '2026',
    tags: ['Web', '刷题', 'Tailscale'],
  },
  {
    name: 'Airnavigation',
    description: '无人机仿真平台，支持切换机型与天气、对话式导航，也可用于评估飞行条件与飞行算法。',
    url: 'https://github.com/remain11/Airnavigation',
    language: 'Python',
    languageColor: '#3572A5',
    year: '2025',
    tags: ['UAV', '仿真', '导航'],
  },
  {
    name: 'hhurunclub',
    description: '河海大学长跑协会官网，基于 VuePress 2 + Theme Hope，包含社团介绍、跑步知识、活动动态与跑步路线。',
    url: 'https://github.com/remain11/hhurunclub',
    language: 'TypeScript',
    languageColor: '#3178c6',
    year: '2025',
    tags: ['社团', 'VuePress'],
  },
  {
    name: 'csapp',
    description: 'CS:APP 实验记录与详细题解，包含全部实验代码，题解同步在知乎专栏。',
    url: 'https://github.com/remain11/csapp',
    language: 'C',
    languageColor: '#555555',
    year: '2025',
    tags: ['系统', 'Lab'],
  },
];
