# Extractors

Extractors are used to extract the usage of utilities from your source code.

By default [extractorSplit](https://github.com/unocss/unocss/blob/main/packages/core/src/extractors/split.ts) will be applied, which split the source code into tokens and directly feed to the engine.

You can also provide your own extractors to extract the usage of utilities from your source code.

For example, you could check how we implement the [pug extractor](https://github.com/unocss/unocss/tree/main/packages/extractor-pug) or the [attributify extractor](https://github.com/unocss/unocss/blob/main/packages/preset-attributify/src/extractor.ts).
