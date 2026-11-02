# Core benchmark PR comments

`benchmark.yml` measures the exact PR head and base commits on the same Ubuntu
24.04 runner with the latest Node LTS (minimum Node 24), read-only permissions,
and no GitHub App secrets. It
installs and builds separate worktrees, then runs three measurement rounds for
each commit in alternating order: base/PR, PR/base, base/PR. Baseline results are
computed for each PR and do not depend on historical artifacts. Main-branch runs
measure only the current commit. New commits cancel obsolete benchmark runs.

The summary uses the median of each benchmark's three p50 measurements. It shows
commit links, run logs, and up to five of the largest changes outside observed
variation, with the full comparison table in a collapsible section. A change is
highlighted only when its magnitude exceeds the greater of 5% and each commit's
observed spread (maximum minus minimum, divided by median). This heuristic is
informational, not a statistical significance test or a CI failure threshold.
Shared runner load can still affect results; use a rerun to investigate a change.
New and removed benchmarks are listed separately in the table.

`comment-core-benchmark.yml` handles successful, failed, and timed-out PR runs. It
executes scripts from the default branch, treats reports as data, checks that the
PR is still open with the same head and base commits, and creates or updates one
`unocss-bot` comment. Failure comments replace stale results and link to the run
logs, including the failed installation/build/measurement step when recorded.
If a runner fails before uploading metadata, only an unambiguous GitHub PR
association can be used as a fallback. An older run or attempt cannot overwrite
a newer bot comment. Canceled runs are ignored.

The commenter never builds or executes PR code with the App token. A successful
PR report without its base data is rejected rather than silently reporting an
unverified comparison.

Configure these values in **this repository's** Actions settings:

- Variable `UNOCSS_BOT_APP_ID`: `5283403` for the existing `unocss-bot` App.
- Secret `UNOCSS_BOT_APP_PRIVATE_KEY`: the App's private key in PEM format.

Install the App on this repository with **Pull requests: Read and write**
permissions. Worker secrets and secrets configured in the bot's own repository
are separate from these Actions secrets.

Merge both workflows into the default branch before checking automatic comments;
GitHub only triggers `workflow_run` workflows from that branch. Fork PRs may
require a maintainer to approve the benchmark run under the repository's Actions
policy.

Keep `benchmark.yml`: it provides the GitHub runner used by this implementation.
Cloudflare Sandbox, Containers, Queues, and a local Docker installation are not
needed for these benchmarks.

The main CI matrix still builds and tests on all existing OS/Node combinations.
The minimum supported development/CI Node version is 24. Typechecking runs once
in the Ubuntu/latest-LTS job selected by an explicit matrix flag, reusing that
job's build and preserving the existing required check names. Ubuntu also tests
Node 24 to cover the supported minimum. Benchmark run logs record the actual
Node version used for both base and PR measurements.

Run the report/comment and runner orchestration checks with:

```sh
node --test scripts/check-benchmark-comment.mjs
```
