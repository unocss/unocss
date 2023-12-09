---
outline: deep
---

# Why UnoCSS?

## Motivations

We recommend you to read the blog post [Reimagine Atomic CSS](https://antfu.me/posts/reimagine-atomic-css) written by the creator of UnoCSS, [Anthony Fu](https://antfu.me/), to get a better understanding of the motivation behind UnoCSS.

## How is UnoCSS Different from X?

### Windi CSS

UnoCSS was started by one of the [Windi CSS](https://windicss.org/)'s team members, with a lot of inspiration taken from the work we did in Windi CSS. While Windi CSS is no longer actively maintained (as of March 2023), you may consider UnoCSS as a *"spiritual successor"* of Windi CSS.

UnoCSS inherits Windi CSS's on-demand nature, [attributify mode](/presets/attributify), [shortcuts](/config/shortcuts), [variant groups](/transformers/variant-group), [compilation mode](/transformers/compile-class) and a lot more. On top of that, UnoCSS is built from the ground up with the maximum extensibility and performance in mind, making us able to introduce new features like [pure CSS icons](/presets/icons), [valueless attributify](/presets/attributify#valueless-attributify), [tagify](/presets/tagify), [web fonts](/presets/web-fonts), etc.

Most importantly, UnoCSS is extracted as an atomic CSS engine, where all the features are optional, and making it easy to create your own conventions, own design system, and own presets - with the combinations of the features you want.

### Tailwind CSS

Both Windi CSS and UnoCSS took a lot of inspiration from [Tailwind CSS](https://tailwindcss.com/). Since UnoCSS is built from the ground up, we are able to have a great overview of how atomic CSS has been designed with prior arts and abstracted into an elegant and powerful API. With quite different design goals, it's not really an apples-to-apples comparison with Tailwind CSS. But we will try to list a few differences.

Tailwind CSS is a PostCSS plugin, while UnoCSS is an isomorphic engine with a collection of first-class integrations with build tools (including a [PostCSS plugin](/integrations/postcss)). This means UnoCSS can be much more flexible to be used in different places (for example, [CDN Runtime](/integrations/runtime), which generates CSS on the fly) and have deep integrations with build tools to provide better HMR, performance, and developer experience (for example, the [Inspector](/tools/inspector)).

Technical trade-offs aside, UnoCSS is also designed to be fully extensible and customizable, while Tailwind CSS is more opinionated. Building a custom design system (or design tokens) on top of Tailwind CSS can be hard, and you can't really move away from the Tailwind CSS's conventions. With UnoCSS, you can build pretty much anything you want with full control. For example, we implemented the whole Tailwind CSS compatible utilities within [a single preset](/presets/wind), and there are a lot of [awesome community presets](/presets/community) implemented with other interesting philosophies.

Thanks to the flexibility UnoCSS provides, we are able to experiment with a lot of innovative features on top of it, for example:

- [Pure CSS icons](/presets/icons)
- [Attributify Mode](/presets/attributify)
- [Variant Groups](/transformers/variant-group)
- [Shortcuts](/config/shortcuts)
- [Tagify](/presets/tagify)
- [Web fonts](/presets/web-fonts)
- [CDN Runtime](/integrations/runtime)
- [Inspector](/tools/inspector)

Due to the differing design goals over Tailwind CSS, UnoCSS does not support Tailwind CSS's plugin system or configurations, meaning it might make it harder to migrate from a heavily customized Tailwind CSS project. This is the intended decision to make UnoCSS high-performant and extensible, and we believe the trade-off is worth it.
