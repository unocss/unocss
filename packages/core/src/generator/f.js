/* eslint-disable @typescript-eslint/no-var-requires */
const Fontmin = require('fontmin');
const path = require('path');

const words = `
0123456789
?!？！
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
新年快乐
`;

const fontmin = ({ list, srcPath, destPath, words, fontFamily }) => {
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

        zip.run(function (err, file) {
            if (err) {
                rej(err);
            } else {
                res(true);
            }
        });
    });
};

fontmin({
    fontFamily: 'hansdsome antfu',
    list: ['ttf2eot', 'ttf2woff'],
    srcPath: path.resolve(__dirname,'./FZDWTJW.ttf'),
    destPath: path.resolve(__dirname,'./fonts'),
    words,
}).catch(e => {
    console.log('fintmin error:', e);
});
