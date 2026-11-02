# Core benchmark PR comments

`benchmark.yml` runs core benchmarks on GitHub-hosted runners with read-only
permissions and no GitHub App secrets. It keeps the existing Actions summary and
baseline artifacts, and uploads JSON reports for PR comments.

`comment-core-benchmark.yml` runs after a successful PR benchmark. It executes
scripts from the default branch, treats reports as data, checks that the PR is
still open with the same head and base commits, and creates or updates one
`unocss-bot` comment. It never builds or executes the PR code with the App token.

Configure these values in **this repository's** Actions settings:

- Variable `UNOCSS_BOT_APP_ID`: `5283403` for the existing `unocss-bot` App.
- Secret `UNOCSS_BOT_APP_PRIVATE_KEY`: the App's private key in PEM format.

Install the App on this repository with **Pull requests: Read and write**
permissions. Worker secrets and secrets configured in the
bot's own repository are separate from these Actions secrets.

Merge both workflows into the default branch before checking automatic comments;
GitHub only triggers `workflow_run` workflows from that branch. Fork PRs may
require a maintainer to approve the benchmark run under the repository's Actions
policy. If there is no successful baseline artifact for the exact base commit,
the summary says that no baseline is available.

Keep `benchmark.yml`: it provides the GitHub runner used by this implementation.
Cloudflare Sandbox, Containers, Queues, and a local Docker installation are not
needed for these benchmarks.

Run the report/comment checks with:

```sh
node --test scripts/check-benchmark-comment.mjs
```
