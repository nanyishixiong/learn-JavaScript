// 配置网站的标题和描述，方便SEO

module.exports = {
  title: '南一的博客',
  description: '学习笔记',
  base: '/learn-JavaScript/',
  locales: {
    '/': {
      lang: 'zh-CN'
    }
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Github', link: 'https://github.com/nanyishixiong' },
      { text: '掘金', link: 'https://juejin.cn/user/1799224251386701' },
    ],
    sidebar: [
      {
        title: '欢迎学习',
        path: '/',
        collapsable: false, // 不折叠
        children: [
          { title: '学前必读', path: '/' }
        ]
      },
      {
        title: 'JavaScript深入',
        path: '/bolgs/JavaScript/',
        collapsable: false, // 不折叠
        children: [
          { title: '词法作用域和动态作用域', path: '/bolgs/JavaScript/scope' },
          { title: '原型与继承', path: '/bolgs/JavaScript/prototype' }
        ]
      }
    ],
    lastUpdated: 'Last Updated',
  }
}