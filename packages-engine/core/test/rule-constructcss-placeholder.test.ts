import { createGenerator } from "@unocss/core";
import { describe, expect, it } from "vitest";

// Regression test for https://github.com/unocss/unocss/issues/5351
describe("constructCSS scope placeholder", () => {
  it("expands the $$ placeholder left by prefix-based variants", async () => {
    const uno = await createGenerator({
      envMode: "dev",
      presets: [],
      rules: [
        [
          /^(where|\?)$/,
          (_match, { constructCSS }) => {
            return `@keyframes __un_qm{0%{opacity:0}100%{opacity:1}} ${constructCSS({ animation: "__un_qm 1s infinite" })}`;
          },
        ],
      ],
      variants: [
        (input) => {
          if (input.startsWith("dark:")) {
            return {
              matcher: input.slice(5),
              handle: (input, next) =>
                next({ ...input, prefix: `.dark $$ ${input.prefix}` }),
            };
          }
        },
      ],
    });

    const { css } = await uno.generate("dark:?", { preflights: false });
    expect(css).not.toContain("$$");
    expect(css).toContain(".dark .dark\\:\\?{animation:__un_qm 1s infinite;}");
  });

  it("expands the $$ placeholder in parents of composed parent variants", async () => {
    const uno = await createGenerator({
      envMode: "dev",
      presets: [],
      rules: [
        [
          /^(where|\?)$/,
          (_match, { constructCSS }) => {
            return constructCSS({ animation: "__un_qm 1s infinite" });
          },
        ],
      ],
      variants: [
        {
          multiPass: true,
          // parent-based variant that composes with another parent carrier
          match: (input) => {
            if (input.startsWith("group:")) {
              return {
                matcher: input.slice(6),
                handle: (input, next) =>
                  next({
                    ...input,
                    parent: `${input.parent ? `${input.parent} $$ ` : ""}@media (min-width: 100px)`,
                  }),
              };
            }
          },
        },
      ],
    });

    const { css } = await uno.generate("group:group:?", { preflights: false });
    expect(css).not.toContain("$$");
    expect(css).toContain(
      "@media (min-width: 100px){@media (min-width: 100px){",
    );
  });

  it("leaves plain selectors untouched", async () => {
    const uno = await createGenerator({
      envMode: "dev",
      presets: [],
      rules: [
        [
          /^(where|\?)$/,
          (_match, { constructCSS }) =>
            constructCSS({ animation: "__un_qm 1s infinite" }),
        ],
      ],
    });

    const { css } = await uno.generate("?", { preflights: false });
    expect(css).toContain(".\\?{animation:__un_qm 1s infinite;}");
  });
});
