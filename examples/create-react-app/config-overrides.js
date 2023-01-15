const path = require('path');
const { override, addWebpackPlugin } = require('customize-cra');
const UnoCss = require("@unocss/webpack").default;
const { presetIcons, presetUno } = require("unocss");

module.exports = {
    webpack: override(
        addWebpackPlugin(
            UnoCss({
                shortcuts: [
                    { logo: 'i-logos-react w-6em h-6em transform transition-800 hover:rotate-180' },
                ],
                presets: [
                    presetIcons(),
                    presetUno()
                ],
            }),
        ),
        (config) => {
            const ModuleScopePlugin = config.resolve.plugins.find(plugin => plugin.constructor.name === 'ModuleScopePlugin');
            ModuleScopePlugin.allowedPaths.push(path.join(__dirname, '_virtual_%2F__uno.css'));
            config.optimization.realContentHash = true;
            return config;
        },
    ),

};
