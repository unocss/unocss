import { CSSObject, Preset, Rule, StaticRule, warnOnce } from '@unocss/core';
import { iconToSVG } from '@iconify/utils/lib/svg/build';
import { defaults as DefaultIconCustomizations } from '@iconify/utils/lib/customisations';
import { getIconData } from '@iconify/utils/lib/icon-set/get-icon';
/* eslint-disable @typescript-eslint/no-var-requires */
import Fontmin from 'fontmin'


const fontmin = new Fontmin()
    .src('src/fonts/FZDWTJW.ttf')
    .use(Fontmin.glyph({
        text: words,
    }))
    .use(Fontmin.ttf2woff())
    .dest('src/assets/fonts');

// fontmin.run(err => {
//     if (err) {
//         throw err;
//     }
// });

type fontType = 'woff' | 'truetype' | 'svg' | 'woff2' | 'embedded-opentype' | 'eot'; // font type in css property
type PresetFontParams = {
    entries: {
        text: string, // texts include in `src`
        src: string, // file source
        dest: string, // output dist
        fontType?: fontType[],
        family: string, // font-family
        extraProperties: CSSObject;
    }[];
    layer?: string; //  = 'font-family'
    extraProperties: Record<string, unknown>;
};

export const preset = (params: PresetFontParams): Preset => {
    const {
        entries,
    } = params;
    const fontRules = entries.map(entry => {
        const fontType = entry.fontType || ['woff'];
        const fontFace = {
            '@font-face': `{'font-family': ${ entry.family };src: url('//at.alicdn.com/t/font_1258536_pkwzne0lvt.eot');
                src: url('//at.alicdn.com/t/font_1258536_pkwzne0lvt.eot?#iefix') format('embedded-opentype'),
                    url('//at.alicdn.com/t/font_1258536_pkwzne0lvt.woff2') format('woff2'),
                    url('//at.alicdn.com/t/font_1258536_pkwzne0lvt.woff') format('woff'),
                    url('//at.alicdn.com/t/font_1258536_pkwzne0lvt.ttf') format('truetype'),
                    url('//at.alicdn.com/t/font_1258536_pkwzne0lvt.svg#iconfont') format('svg');
            }`
        };
        return [entry.family, { 'S': 'S', ...entry.extraProperties }] as Rule;
    });
    return {
        name: '@unocss/font',
        enforce: 'pre',
        rules: fontRules
    };
};

export default preset;
