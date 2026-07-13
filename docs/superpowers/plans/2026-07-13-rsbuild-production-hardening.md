# Rsbuild 2.x Production Hardening Implementation Plan

> **For AI agents:** Required sub-skill: use executing-plans to implement this plan task by task. Track progress with the checkboxes below.

**Goal:** Harden `@unocss/rsbuild` for production use on Rsbuild 2.x and Rspack 2.x while keeping changes isolated from UnoCSS core.

**Architecture:** Keep the native Rspack plugin, loader, and virtual-module design. Remove duplicate loader injection, make external filesystem token updates incremental, bound persistent-cache recovery concurrency, and verify that watch invalidation converges and resources are released.

**Technical stack:** TypeScript, Rspack 2, Rsbuild 2, Vitest, Chokidar, UnoCSS integration helpers.

---

## File Responsibilities

- `packages-integrations/rsbuild/src/rspack.ts`: compiler hooks, loader rule, virtual modules, invalidation lifecycle.
- `packages-integrations/rsbuild/src/context.ts`: module and external-content token state.
- `packages-integrations/rsbuild/src/content-watcher.ts`: discovery events for external glob roots.
- `packages-integrations/rsbuild/src/cache.ts`: bounded persistent-cache recovery.
- `packages-integrations/rsbuild/src/*.test.ts`: unit and real compiler regression coverage.

### Task 1: Ensure one loader execution per module

**Files:**

- Modify: `packages-integrations/rsbuild/src/rspack.ts`
- Modify: `packages-integrations/rsbuild/src/rspack.test.ts`

- [ ] Add a regression test with a counting transformer and a Vue-style resource query that fails when the transformer runs more than once.
- [ ] Run `pnpm -C packages-integrations/rsbuild vitest run src/rspack.test.ts` and confirm the new assertion fails.
- [ ] Remove mutation of existing Vue rules and keep the single pre-loader rule as the only injection path.
- [ ] Run the focused test and confirm it passes.

### Task 2: Update external content incrementally

**Files:**

- Modify: `packages-integrations/rsbuild/src/context.ts`
- Modify: `packages-integrations/rsbuild/src/content-watcher.ts`
- Modify: `packages-integrations/rsbuild/src/context.test.ts`
- Modify: `packages-integrations/rsbuild/src/rspack.ts`

- [ ] Add tests proving add, change, and removal update generated CSS without retaining stale utilities.
- [ ] Add an instrumentation test proving an unchanged external file is not reread during a one-file update.
- [ ] Run the focused context tests and confirm the incremental API is missing or the reread assertion fails.
- [ ] Add `updateExternalContent(changed, removed)` to update only affected token entries and filesystem membership.
- [ ] Treat `ENOENT` during an update as removal and propagate other read errors.
- [ ] Route Rspack `modifiedFiles` and `removedFiles` through the incremental API.
- [ ] Make Chokidar forward only new matching files and removals not already covered by known Rspack file dependencies.
- [ ] Run focused context and Rspack watch tests until they pass repeatedly.

### Task 3: Bound persistent-cache recovery

**Files:**

- Modify: `packages-integrations/rsbuild/src/cache.ts`
- Create: `packages-integrations/rsbuild/src/cache.test.ts`

- [ ] Add tests for physical-file deduplication, excluded resources, and a maximum active read count.
- [ ] Run `pnpm -C packages-integrations/rsbuild vitest run src/cache.test.ts` and confirm the concurrency test fails.
- [ ] Replace unbounded `Promise.all` scheduling with a small local worker pool over deduplicated files.
- [ ] Keep read and transform errors observable to the compilation.
- [ ] Run cache tests repeatedly and confirm the concurrency bound is deterministic.

### Task 4: Prove watch convergence and cleanup

**Files:**

- Modify: `packages-integrations/rsbuild/src/rspack.test.ts`
- Modify: `packages-integrations/rsbuild/src/registry.ts`
- Modify: `packages-integrations/rsbuild/src/rspack.ts`
- Modify: `packages-integrations/rsbuild/src/content-watcher.ts`

- [ ] Extend watch tests to count compilations and fail if builds continue after the expected follow-up compilation.
- [ ] Add registry observability for tests without exporting new public package API.
- [ ] Add tests proving compiler shutdown removes the context and closes pending watcher work.
- [ ] Make shutdown and watch close idempotent, with registry cleanup guaranteed once.
- [ ] Run watch-focused tests at least three consecutive times to catch timing instability.

### Task 5: Full verification

**Files:**

- Modify only if verification exposes a defect in the scoped integration files.

- [ ] Run `pnpm exec eslint packages-integrations/rsbuild/src` and require zero errors and warnings.
- [ ] Run `pnpm -C packages-integrations/rsbuild run build` and confirm declaration generation succeeds.
- [ ] Run `pnpm -C packages-integrations/rsbuild run test` at least twice.
- [ ] Run `pnpm run typecheck`; if workspace packages are not built, record unrelated module-resolution failures separately.
- [ ] Run `git diff --check` and inspect the final diff for changes outside the approved scope.
