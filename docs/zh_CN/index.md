---
layout: home
title: "UnoCSS: 即时按需的原子 CSS 引擎"

hero:
  image:
    src: /logo.svg
    alt: UnoCSS
  name: "UnoCSS"
  text: 即时按需的原子 CSS 引擎
  tagline: 可定制 . 强大 · 快 · 快乐
  actions:
    - theme: brand
      text: 马上开始
      link: /zh_CN/guide/
    - theme: alt
      text: 交互式文档
      link: https://unocss.dev/interactive/
      target: _blank
    - theme: alt
      text: 操场
      link: https://unocss.dev/play/
      target: _blank

features:
  - icon: <span class="i-carbon:ibm-toolchain"></span>
    title: 完全可定制
    details: 没有核心实用程序，所有功能都通过预设提供。
    link: /zh_CN/guide/
    linkText: 开始
  - icon: <span class="i-carbon-meter-alt"></span>
    title: 瞬间
    details: 没有解析、没有 AST、没有扫描。它比 Windi CSS 或 Tailwind JIT 快 5 倍。
  - icon: <span class="i-carbon-wind-gusts"></span>
    title: 轻量
    details: "零依赖和浏览器友好：~6kb brotli 压缩"
  - icon: <span class="i-carbon-ibm-cloud-transit-gateway"></span>
    title: 丰富的集成
    details: "Vite、Webpack、PostCSS、CLI、VS CODE、ESLint 等的一流支持。"
    link: /zh_CN/integrations/vite
    linkText: "了解更多"
  - icon: <span class="i-carbon-asset"></span>
    title: 快捷使用
    details: "动态别名或分组实用程序"
    link: /zh_CN/config/shortcuts
    linkText: "配置和用法"
  - icon: <span class="i-carbon:code"></span>
    title: 属性模式
    details: "在属性中对实用程序进行分组"
    link: /zh_CN/presets/attributify
    linkText: "@unocss/preset-attributify"
  - icon: <span class="i-carbon-face-wink hover:i-carbon-face-satisfied"></span>
    title: 纯 CSS 图标
    details: "一个类名即可使用任意图标"
    link: /zh_CN/presets/icons
    linkText: "@unocss/preset-icons"
  - icon: <span class="i-carbon:group-objects"></span>
    title: 变体
    details: "具有公共前缀的实用程序"
    link: /zh_CN/transformers/variant-group
    linkText: "@unocss/transformer-variant-group"
  - icon: <span class="i-carbon:at"></span>
    title: CSS 指令
    details: "在 CSS 中使用 @apply 指令来实现重用"
    link: /zh_CN/transformers/directives
    linkText: "@unocss/transformer-directives"
  - icon: <span class="i-carbon-tree-view-alt scale-x--100"></span>
    title: 编译模式
    details: "构建时将多个类聚合成一个类"
    link: /zh_CN/transformers/compile-class
    linkText: "@unocss/transformer-compile-class"
  - icon: <span class="i-carbon:inspection"></span>
    title: 即时检查
    details: "以交互方式检查和调试"
    link: /zh_CN/tools/inspector
    linkText: "@unocss/inspector"
  - icon: <span class="i-carbon:executable-program"></span>
    title: CDN 运行时构建
    details: "仅需一行代码从 CDN 中导入即可开箱使用 UnoCSS"
    link: /zh_CN/integrations/runtime
    linkText: "@unocss/runtime"
---
