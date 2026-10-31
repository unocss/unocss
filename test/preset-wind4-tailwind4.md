# Wind4 and Tailwind CSS 4 test scope

This suite tests representative capabilities of `presetWind4()` against Tailwind CSS 4.3.3.
It does not prove full compatibility or browser equivalence.
A covered family has at least one concrete assertion case. It does not mean that every value in that family works.

## Reference and inventory

The test-only compiler dependency is pinned to `tailwindcss: 4.3.3` in the testing catalog.
Tests load its installed theme and compiler. They do not download reference files or access the network.

The inventory comes from these complete upstream files at revision `c2b24dd15fed1c59dd521bd86082f520c9f5ad0d`:

- [utilities.test.ts](https://github.com/tailwindlabs/tailwindcss/blob/c2b24dd15fed1c59dd521bd86082f520c9f5ad0d/packages/tailwindcss/src/utilities.test.ts): 290 top-level test groups.
- [variants.test.ts](https://github.com/tailwindlabs/tailwindcss/blob/c2b24dd15fed1c59dd521bd86082f520c9f5ad0d/packages/tailwindcss/src/variants.test.ts): 91 top-level test groups.
- [Functions and directives](https://github.com/tailwindlabs/tailwindcss.com/blob/7f92c2213315c195dae583d68752da4042da3ade/src/docs/functions-and-directives.mdx): CSS-first configuration and functions.

`assets/wind4-tailwind4-inventory.json` records all 381 upstream group names.
`assets/wind4-tailwind4-coverage.json` maps each group to a utility case, variant case, or named assertion in a test file.
The inventory test requires exact key coverage and valid references. It fails if a mapped table case or source anchor disappears.
Source anchors identify assertion blocks. They do not measure assertion quality or prove semantic completeness.

The upstream groups include directional forms, compound variants, sorting, and configuration cases.
Related groups can share a parameterized assertion block. No group is omitted because Wind4 does not support it.
Skipped Wind4 tests retain their assertions. Their Tailwind reference checks remain active.
The focused suite has 741 passing tests and 46 skipped Wind4 contracts.

## Coverage matrix

| Test file                                    | Assertion scope                                                                                                                                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preset-wind4-tailwind4.test.ts`             | Layout, position, flex, grid, spacing, sizes, typography, backgrounds, borders, tables, effects, transforms, interaction, scrolling, SVG, arbitrary properties, variable shorthand, and variant conditions |
| `preset-wind4-tailwind4-composition.test.ts` | Multi-property utilities, rounded sides, transform axes, filter chains, backdrop filters, shadows, rings, touch actions, scroll snapping, and border spacing                                               |
| `preset-wind4-tailwind4-values.test.ts`      | Default and custom theme values, opacity modifiers, negative and fractional values, `calc()`, space/divide child selectors, scrollbar colors, gradient stops, masks, and keyframes                         |
| `preset-wind4-tailwind4-boundaries.test.ts`  | Explicit gaps, 3D composition, pseudo-element content, hover, dark mode, custom border defaults, mask shapes, important declarations, responsive stacking, and margin order                                |
| `preset-wind4-tailwind4-order.test.ts`       | Candidate order, reversed input, compound variants, breakpoint ranges, and mixed units                                                                                                                     |
| `preset-wind4-tailwind4-directives.test.ts`  | CSS-first syntax, compiler metadata, Uno configuration equivalents, transformer-directives integration, and representative preflight rules                                                                 |
| `preset-wind4-tailwind4-inventory.test.ts`   | Complete mapping of the pinned upstream group list                                                                                                                                                         |

The utility table adds documented capabilities beyond the upstream group names.
These include background attachment, mask mode/type/composite/repeat, backface visibility, and transform style.
Filter cases include each filter function and its backdrop form. Drop-shadow color replacement has an explicit gap test.
Container cases cover minimum width, maximum width, a named container, and a stacked range.
Background cases cover an angular linear gradient, radial mode, and an angular conic gradient with three explicit color stops.
These cases do not cover every background utility or gradient modifier.

Selector assertions replace the candidate class with `&` before testing conditions, so escaped class text cannot satisfy the condition.
Arbitrary group and group-hover assertions require a group ancestor. Arbitrary peer assertions require a preceding sibling with both the peer marker and condition.
The in-focus assertion requires a focused ancestor. Responsive focus assertions require both the media condition and the utility's focus pseudo-class.
Marker and selection assertions require both own-element and descendant targets.
The tests reject 28 deliberate selector and media mutations across both compilers.
The `matchVariant` test creates a fresh compiler for each input order and compares the selected engine's output.

## Known skipped Wind4 contracts

These are observed differences, not inferred from unmatched tokens alone.
Each skipped case has an active Tailwind reference test with the same expected behavior.
No implementation changes are part of this suite.

| Kind                           | Cases                                                             | Reason                                                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Missing container variants     | `@max-sm:flex`, `@sm:@max-lg:flex`                                | Wind4 emits no CSS for the maximum-width query or the range that contains it.                                                           |
| Invalid gradient angle         | `bg-linear-45`                                                    | Wind4 emits `from 45deg in oklab`. A linear gradient angle requires `45deg in oklab`, without `from`.                                   |
| Missing utility                | `font-features-["smcp"]`                                          | Wind4 does not emit `font-feature-settings` for this utility. An arbitrary CSS property remains available.                              |
| Syntax difference              | `scroll-ms`, `scroll-me`, `scroll-ps`, `scroll-pe`                | Wind4 uses `scroll-mis`, `scroll-mie`, `scroll-pis`, and `scroll-pie`. Active tests cover those equivalents.                            |
| Syntax difference              | `only:flex`                                                       | Wind4 uses `only-child` instead of Tailwind's `only` alias.                                                                             |
| Missing variants               | `inverted-colors` and all six `pointer-*` / `any-pointer-*` forms | Wind4 does not emit the requested media conditions.                                                                                     |
| Boundary difference            | `max-[900px]`                                                     | Wind4 includes 900px through `max-width`. Tailwind excludes it through `width < 900px`.                                                 |
| Missing composition utilities  | `translate-3d`, `scale-3d`                                        | Wind4 does not emit the three-axis consumer. Individual axis utilities have active tests.                                               |
| Pseudo-element difference      | `before:flex`, `after:flex`                                       | Wind4 does not insert default content. Explicit content has active tests.                                                               |
| Hover difference               | `hover:flex`                                                      | Default Wind4 does not add Tailwind's `(hover: hover)` guard. Selector tests alone do not cover this behavior.                          |
| Intentional default difference | `dark:flex`                                                       | Wind4 defaults to class-based dark mode. An active test covers its `dark: 'media'` option.                                              |
| Color replacement gap          | Arbitrary colored drop-shadow                                     | Wind4 retains `black` outside the color override variable instead of using it as the fallback.                                          |
| Theme difference               | Bare `border`, `divide-x`, `divide-y` with a custom default width | Wind4 uses 1px instead of the Tailwind default-border-width theme value.                                                                |
| Direction difference           | `divide-x`                                                        | Wind4 uses physical left/right borders. Tailwind uses logical inline borders. This matters in right-to-left layouts.                    |
| Enhancement difference         | Divide color with alpha                                           | Wind4 drops the `oklab` supports branch and retains the `srgb` fallback. This test does not claim a visible difference for every color. |
| Ordering difference            | Mixed-unit minimum breakpoints                                    | Wind4 and Tailwind sort the tested `px` and `rem` breakpoints differently.                                                              |
| CSS-first architecture         | 16 directive/function cases                                       | Uno does not implement these exact Tailwind CSS-first contracts through transformer-directives. See below.                              |

The CSS-first skips cover `@import`, `@reference`, `@theme` and its inline/static modes, `@utility`, functional utilities, `--modifier()`, `@variant`, `@custom-variant`, `@source inline`, `--spacing()`, `--alpha()`, `@config`, `@plugin`, and `matchVariant`.
They describe compiler syntax, not missing CSS properties.
The reference compiler uses in-memory stylesheet and module loaders. No test imports a user configuration or scans a real project.

Uno rules, shortcuts, variants, and safelist have active equivalent-capability tests.
`@apply`, `theme()`, and `@screen` have active tests through `@unocss/transformer-directives` with Wind4.
File discovery through `@source` is tested as Tailwind compiler metadata. Uno's content configuration is a different API, not an absent CSS feature.

## Accepted output differences

The suite does not require complete CSS text equality.
It permits explicit equivalent spellings such as `auto` versus `1 1 auto`, slash whitespace, and `currentColor` case.
It also permits `top left` versus `0 0`, and equivalent minimum-width media syntax.

Separate assertions cover known output forms instead of replacing all variable names or evaluating CSS.
Examples include `--tw-*` versus `--un-*`, `--color-*` versus `--colors-*`, URL variables, animation variables, and transition shorthands.
Assertions follow variable consumers, theme declarations, and selector conditions where the case requires them.
PostCSS reads the real output. Base declarations do not include unrelated nested declarations.

## Limits and maintenance

The inventory is a finite set of representative cases, not a copy of every upstream assertion.
It does not cover all arbitrary values, modifiers, theme combinations, plugin APIs, or combinations of variants.
A passing ordering test does not prove that two selectors have equal specificity.
A passing structural test does not prove equal computed styles, rendering, inheritance, animation, or cascade behavior in browsers.

Build integrations, automatic file discovery, CSS modules, framework setup, editor support, and browser compatibility need separate integration tests.
Existing Wind4 snapshots still cover broader output details. This suite adds independent contracts rather than replacing those snapshots.
The preset documentation describes Wind3 compatibility and intentional theme naming differences. It does not promise complete Tailwind CSS-first API compatibility.

When the reference version changes, review the complete upstream files again.
Update the inventory, mappings, dependency pin, gap reasons, and assertions together.
Do not remove a skipped case merely to reduce the gap count.
Enable it only after its real implementation passes the retained assertion.

Run the focused suite with:

```sh
pnpm exec vitest run test/preset-wind4-tailwind4*.test.ts
```

Run the repository checks with:

```sh
pnpm build
pnpm exec vitest run
pnpm typecheck
pnpm lint
```

The normal Vitest configuration discovers every new `*.test.ts` file. No separate opt-in or CI configuration is required.
