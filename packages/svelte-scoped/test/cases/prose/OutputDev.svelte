<div class="uno-prose" />

<style uno-preflights uno-safelist>
  *,
  ::before,
  ::after {
    --un-rotate: 0;
    --un-rotate-x: 0;
    --un-rotate-y: 0;
    --un-rotate-z: 0;
    --un-scale-x: 1;
    --un-scale-y: 1;
    --un-scale-z: 1;
    --un-skew-x: 0;
    --un-skew-y: 0;
    --un-translate-x: 0;
    --un-translate-y: 0;
    --un-translate-z: 0;
    --un-pan-x: ;
    --un-pan-y: ;
    --un-pinch-zoom: ;
    --un-scroll-snap-strictness: proximity;
    --un-ordinal: ;
    --un-slashed-zero: ;
    --un-numeric-figure: ;
    --un-numeric-spacing: ;
    --un-numeric-fraction: ;
    --un-border-spacing-x: 0;
    --un-border-spacing-y: 0;
    --un-ring-offset-shadow: 0 0 rgb(0 0 0 / 0);
    --un-ring-shadow: 0 0 rgb(0 0 0 / 0);
    --un-shadow-inset: ;
    --un-shadow: 0 0 rgb(0 0 0 / 0);
    --un-ring-inset: ;
    --un-ring-offset-width: 0px;
    --un-ring-offset-color: #fff;
    --un-ring-width: 0px;
    --un-ring-color: rgb(147 197 253 / 0.5);
    --un-blur: ;
    --un-brightness: ;
    --un-contrast: ;
    --un-drop-shadow: ;
    --un-grayscale: ;
    --un-hue-rotate: ;
    --un-invert: ;
    --un-saturate: ;
    --un-sepia: ;
    --un-backdrop-blur: ;
    --un-backdrop-brightness: ;
    --un-backdrop-contrast: ;
    --un-backdrop-grayscale: ;
    --un-backdrop-hue-rotate: ;
    --un-backdrop-invert: ;
    --un-backdrop-opacity: ;
    --un-backdrop-saturate: ;
    --un-backdrop-sepia: ;
  }
  ::backdrop {
    --un-rotate: 0;
    --un-rotate-x: 0;
    --un-rotate-y: 0;
    --un-rotate-z: 0;
    --un-scale-x: 1;
    --un-scale-y: 1;
    --un-scale-z: 1;
    --un-skew-x: 0;
    --un-skew-y: 0;
    --un-translate-x: 0;
    --un-translate-y: 0;
    --un-translate-z: 0;
    --un-pan-x: ;
    --un-pan-y: ;
    --un-pinch-zoom: ;
    --un-scroll-snap-strictness: proximity;
    --un-ordinal: ;
    --un-slashed-zero: ;
    --un-numeric-figure: ;
    --un-numeric-spacing: ;
    --un-numeric-fraction: ;
    --un-border-spacing-x: 0;
    --un-border-spacing-y: 0;
    --un-ring-offset-shadow: 0 0 rgb(0 0 0 / 0);
    --un-ring-shadow: 0 0 rgb(0 0 0 / 0);
    --un-shadow-inset: ;
    --un-shadow: 0 0 rgb(0 0 0 / 0);
    --un-ring-inset: ;
    --un-ring-offset-width: 0px;
    --un-ring-offset-color: #fff;
    --un-ring-width: 0px;
    --un-ring-color: rgb(147 197 253 / 0.5);
    --un-blur: ;
    --un-brightness: ;
    --un-contrast: ;
    --un-drop-shadow: ;
    --un-grayscale: ;
    --un-hue-rotate: ;
    --un-invert: ;
    --un-saturate: ;
    --un-sepia: ;
    --un-backdrop-blur: ;
    --un-backdrop-brightness: ;
    --un-backdrop-contrast: ;
    --un-backdrop-grayscale: ;
    --un-backdrop-hue-rotate: ;
    --un-backdrop-invert: ;
    --un-backdrop-opacity: ;
    --un-backdrop-saturate: ;
    --un-backdrop-sepia: ;
  }
  :global(
      .uno-prose
        :where(h1, h2, h3, h4, h5, h6):not(
          :where(.not-uno-prose, .not-uno-prose *)
        )
    ) {
    color: var(--un-prose-headings);
    font-weight: 600;
    line-height: 1.25;
  }
  :global(.uno-prose :where(a):not(:where(.not-uno-prose, .not-uno-prose *))) {
    color: var(--un-prose-links);
    text-decoration: underline;
    font-weight: 500;
  }
  :global(
      .uno-prose :where(a code):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    color: var(--un-prose-links);
  }
  :global(
      .uno-prose
        :where(p, ul, ol, pre):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    margin: 1em 0;
    line-height: 1.75;
  }
  :global(
      .uno-prose
        :where(blockquote):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    margin: 1em 0;
    padding-left: 1em;
    font-style: italic;
    border-left: 0.25em solid var(--un-prose-borders);
  }
  :global(.uno-prose :where(h1):not(:where(.not-uno-prose, .not-uno-prose *))) {
    margin: 1rem 0;
    font-size: 2.25em;
  }
  :global(.uno-prose :where(h2):not(:where(.not-uno-prose, .not-uno-prose *))) {
    margin: 1.75em 0 0.5em;
    font-size: 1.75em;
  }
  :global(.uno-prose :where(h3):not(:where(.not-uno-prose, .not-uno-prose *))) {
    margin: 1.5em 0 0.5em;
    font-size: 1.375em;
  }
  :global(.uno-prose :where(h4):not(:where(.not-uno-prose, .not-uno-prose *))) {
    margin: 1em 0;
    font-size: 1.125em;
  }
  :global(
      .uno-prose
        :where(img, video):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    max-width: 100%;
  }
  :global(
      .uno-prose
        :where(figure, picture):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    margin: 1em 0;
  }
  :global(
      .uno-prose
        :where(figcaption):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    color: var(--un-prose-captions);
    font-size: 0.875em;
  }
  :global(
      .uno-prose :where(code):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    color: var(--un-prose-code);
    font-size: 0.875em;
    font-weight: 600;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
  }
  :global(
      .uno-prose
        :where(:not(pre) > code):not(
          :where(.not-uno-prose, .not-uno-prose *)
        )::before,
      .uno-prose
        :where(:not(pre) > code):not(
          :where(.not-uno-prose, .not-uno-prose *)
        )::after
    ) {
    content: "`";
  }
  :global(
      .uno-prose :where(pre):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    padding: 1.25rem 1.5rem;
    overflow-x: auto;
    border-radius: 0.375rem;
  }
  :global(
      .uno-prose :where(pre, code):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    hyphens: none;
    background: transparent;
  }
  :global(
      .uno-prose :where(pre code):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    font-weight: inherit;
  }
  :global(
      .uno-prose :where(ol, ul):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    padding-left: 1.25em;
  }
  :global(.uno-prose :where(ol):not(:where(.not-uno-prose, .not-uno-prose *))) {
    list-style-type: decimal;
  }
  :global(
      .uno-prose
        :where(ol[type="A"]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: upper-alpha;
  }
  :global(
      .uno-prose
        :where(ol[type="a"]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: lower-alpha;
  }
  :global(
      .uno-prose
        :where(ol[type="A" s]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: upper-alpha;
  }
  :global(
      .uno-prose
        :where(ol[type="a" s]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: lower-alpha;
  }
  :global(
      .uno-prose
        :where(ol[type="I"]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: upper-roman;
  }
  :global(
      .uno-prose
        :where(ol[type="i"]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: lower-roman;
  }
  :global(
      .uno-prose
        :where(ol[type="I" s]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: upper-roman;
  }
  :global(
      .uno-prose
        :where(ol[type="i" s]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: lower-roman;
  }
  :global(
      .uno-prose
        :where(ol[type="1"]):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    list-style-type: decimal;
  }
  :global(.uno-prose :where(ul):not(:where(.not-uno-prose, .not-uno-prose *))) {
    list-style-type: disc;
  }
  :global(
      .uno-prose
        :where(ol > li):not(:where(.not-uno-prose, .not-uno-prose *))::marker,
      .uno-prose
        :where(ul > li):not(:where(.not-uno-prose, .not-uno-prose *))::marker,
      .uno-prose
        :where(summary):not(:where(.not-uno-prose, .not-uno-prose *))::marker
    ) {
    color: var(--un-prose-lists);
  }
  :global(.uno-prose :where(hr):not(:where(.not-uno-prose, .not-uno-prose *))) {
    margin: 2em 0;
    border: 1px solid var(--un-prose-hr);
  }
  :global(
      .uno-prose :where(table):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    display: block;
    margin: 1em 0;
    border-collapse: collapse;
    overflow-x: auto;
  }
  :global(
      .uno-prose
        :where(tr):not(:where(.not-uno-prose, .not-uno-prose *)):nth-child(2n)
    ) {
    background: var(--un-prose-bg-soft);
  }
  :global(
      .uno-prose :where(td, th):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    border: 1px solid var(--un-prose-borders);
    padding: 0.625em 1em;
  }
  :global(
      .uno-prose :where(abbr):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    cursor: help;
  }
  :global(
      .uno-prose :where(kbd):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    color: var(--un-prose-code);
    border: 1px solid;
    padding: 0.25rem 0.5rem;
    font-size: 0.875em;
    border-radius: 0.25rem;
  }
  :global(
      .uno-prose :where(details):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    margin: 1em 0;
    padding: 1.25rem 1.5rem;
    background: var(--un-prose-bg-soft);
  }
  :global(
      .uno-prose :where(summary):not(:where(.not-uno-prose, .not-uno-prose *))
    ) {
    cursor: pointer;
    font-weight: 600;
  }
  :global(.uno-prose) {
    color: var(--un-prose-body);
    max-width: 65ch;
  }
  :global(.mb-7px) {
    margin-bottom: 7px;
  }
</style>
