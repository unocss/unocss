---
home: true
sidebar: false
title: UnoCSS - The instant on-demand Atomic CSS engine.
heroImage: /favicon.svg
actionText: Get Started
actionLink: /guide/

altActionText: Learn More
altActionLink: /guide/why

features:
  - title: 💡 Instant Server Start
    details: On demand file serving over native ESM, no bundling required!
  - title: ⚡️ Lightning Fast HMR
    details: Hot Module Replacement (HMR) that stays fast regardless of app size.
  - title: 🛠️ Rich Features
    details: Out-of-the-box support for TypeScript, JSX, CSS and more.
  - title: 📦 Optimized Build
    details: Pre-configured Rollup build with multi-page and library mode support.
  - title: 🔩 Universal Plugins
    details: Rollup-superset plugin interface shared between dev and build.
  - title: 🔑 Fully Typed APIs
    details: Flexible programmatic APIs with full TypeScript typing.

footer: MIT Licensed | Copyright © 2019-present Evan You & Vite Contributors
---

<p align="center">
<img src="https://raw.githubusercontent.com/unocss/unocss/main/playground/public/icon-gray.svg" style="width:100px;" />
</p>

<h1 align="center">UnoCSS</h1>

<p align="center">
The instant on-demand Atomic CSS engine.
</p>

<p align="center">
<a href="https://www.npmjs.com/package/unocss"><img src="https://img.shields.io/npm/v/unocss?color=c95f8b&amp;label=" alt="NPM version"></a></p>

<div align="center">
<p>💡 I highly recommend reading this blog post - <br><a href="https://antfu.me/posts/reimagine-atomic-css"><strong>Reimagine Atomic CSS</strong></a><br>for the story behind</p>
</div>

<br>
<p align="center"><a href="https://unocss.antfu.me/">🤹‍♂️ Online Playground</a></p>
<br>

## Features

Inspired by [Windi CSS](http://windicss.org/), [Tailwind CSS](https://tailwindcss.com/), [Twind](https://github.com/tw-in-js/twind) but:

- [Fully customizable](#configurations) - no core utilities, all functionalities are provided via presets.
- No parsing, no AST, no scanning, it's **INSTANT** (200x faster than Windi CSS or Tailwind JIT)
- ~3.5kb min+gzip - zero deps and browser friendly.
- [Shortcuts](#shortcuts) - aliasing utilities, dynamically.
- [Attributify Mode](https://github.com/unocss/unocss/tree/main/packages/preset-attributify/) - group utilities in attributes
- [Pure CSS Icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons/) - use any icon as a single class.
- [Inspector](#inspector) - inspect and debug interatively.
- [CSS-in-JS Runtime version](https://github.com/unocss/unocss/tree/main/packages/runtime)
- [CSS Scoping](#css-scoping)
- [VS Code extension](https://marketplace.visualstudio.com/items?itemName=antfu.unocss)
- Code-splitting for CSS - ships minimal CSS for MPA.
- Library friendly - ships atomic styles with your component libraries and safely scoped.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>
