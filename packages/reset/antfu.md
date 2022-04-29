# @unocss/reset/antfu.css

Based on [tailwind.css](./tailwind.css) with a few opinionated additions.

> This reset is **experimental** and at the current stage, changes will NOT follow semver.

### Added

```css
html {
  scrollbar-gutter: stable;
}
.dark {
  color-scheme: dark;
}
.dark ::-moz-selection  {
  background: #444;
}
.dark ::selection {
  background: #444;
}
```

### Default CSS Behavior Changes

- `<div>` is now **default to `display: flex`** and `flex-direction: column`
- `<div row>` for `flex-direction: row`
- `<div block>` original `display: block`

