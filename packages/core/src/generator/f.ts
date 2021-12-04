/* eslint-disable */
const Fontmin = require('fontmin');

// const Fontmin = import.meta.globeager!('../../node_modules/fontmin/**/*.js');
// did not effect

type List = Array<'ttf2eot' | 'ttf2woff' | 'ttf2woff2' | 'ttf2svg' | 'svg2ttf' | 'svgs2ttf' | 'otf2ttf'>;

type Params = {
    list: List;
    srcPath: string,
    destPath: string,
    words: string,
    fontFamily: string,
};

const fontmin = ({ list, srcPath, destPath, words, fontFamily }: Params) => {
    return new Promise((res, rej) => {
        const zip = new Fontmin().src(srcPath).dest(destPath); // 输出配置

        if (words) {
            zip.use(
                Fontmin.glyph({
                    // 字型提取插件
                    text: words, // 所需文字
                })
            );
        }
        list.forEach(item => {
            const plugin = Fontmin[item];
            if (plugin) {
                zip.use(plugin());
            }
        });

        if (fontFamily) {
            zip.use(
                Fontmin.css({
                    fontFamily, // custom fontFamily, default to filename or get from analysed ttf file
                })
            );
        }

        zip.run(function (err: unknown) {
            if (err) {
                rej(err);
            } else {
                res(true);
            }
        });
    });
};

const words = `
新年
`;
fontmin({
    fontFamily: 'handsome antfu',
    list: ['ttf2eot', 'ttf2woff'],
    srcPath: './FZDWTJW.ttf',
    destPath: './fonts',
    words,
}).catch(e => {
    console.log('fintmin error:', e);
});
