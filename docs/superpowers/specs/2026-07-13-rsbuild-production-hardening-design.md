# Rsbuild 2.x Production Hardening Design

## Goal

Make `@unocss/rsbuild` reliable for production use on Rsbuild 2.x and Rspack 2.x without changing UnoCSS core behavior or adding compatibility abstractions for older bundler versions.

## Scope

Changes remain inside `packages-integrations/rsbuild`, except for package metadata required by that package. Public plugin options and exports remain compatible.

The work addresses only risks demonstrated by code inspection or regression tests:

- prevent the UnoCSS loader from running twice for Vue modules;
- update external filesystem content incrementally after the initial scan;
- avoid duplicate invalidations for files already tracked by Rspack;
- bound persistent-cache recovery concurrency;
- prove that virtual CSS invalidation converges instead of looping;
- close watchers and registry entries when the compiler shuts down.

It does not introduce a generic watcher framework, modify shared UnoCSS integration code, support Rsbuild 1.x, or add configuration options without a demonstrated use case.

## Architecture

### Loader Pipeline

Use one Rspack pre-loader rule as the only UnoCSS loader entry. The rule processes normal source modules, Vue subresources, and CSS transformer inputs based on the normalized resource identifier. Do not mutate existing Vue rules.

The loader continues to preserve incoming source maps and uses the resource query to distinguish Vue style requests.

### External Content State

`NativeContext` owns the external-file token map and exposes a batch update operation accepting changed and removed absolute paths.

Initial configuration loading performs one glob scan. Subsequent file events follow these rules:

- changed or added matching files are read and re-extracted individually;
- removed files delete their token entry;
- configuration changes rebuild glob patterns and perform a full scan;
- a failed read caused by a concurrent deletion is treated as a removal;
- unrelated files do not invalidate generated CSS.

Rspack remains responsible for changes to known files. Chokidar watches glob roots to discover newly added files and removals, and forwards only events that Rspack cannot reliably discover through existing file dependencies.

### Persistent Cache Recovery

Cached modules that skipped loaders are restored from source with a small fixed concurrency limit implemented locally. Requests sharing the same physical file are deduplicated. Virtual UnoCSS files and excluded resources are ignored.

No new dependency is added for the limiter because the required behavior is small and package-local.

### CSS Invalidation

Generated CSS is hashed. Virtual modules are rewritten only when the hash changes. A CSS change may cause one follow-up compilation so Rspack can consume the new virtual-module content; the next compilation must observe the same hash and stop invalidating.

## Error Handling

- Watcher setup errors fail the active compilation instead of being ignored.
- Shutdown is idempotent and clears pending timers and filesystem watchers.
- External file read errors other than file disappearance propagate to Rspack.
- Cache recovery read failures propagate because silently missing tokens would produce incomplete CSS.

## Performance Constraints

- No full external-content scan for a single ordinary file change.
- No unbounded `Promise.all` over cached compilation modules.
- No duplicate UnoCSS loader execution for one module request.
- CSS generation caching remains token-content based.
- Asset replacement continues to inspect only assets containing UnoCSS placeholders.

## Verification

Add or extend tests for:

- one transformer execution per Vue-style module request;
- external content add, modify, and removal without stale utilities;
- incremental updates not rereading unchanged external files;
- persistent-cache recovery deduplication and bounded concurrency;
- watch mode reaching a stable build count after source and config changes;
- direct Rspack and wrapped Rsbuild production builds;
- watcher and context cleanup.

Run package ESLint, package build, package tests, and repository type checking where the workspace build state permits it. Any repository-level failure unrelated to this package must be reported with the failing paths.
