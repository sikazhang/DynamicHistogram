import { builtinModules } from "module";

const presets = [
    {
        '@babel/env',
        {
            targets: {
                browsers: ['> 0.25%', 'not dead']
            },
            useBuiltIns: 'usage'
        }
    }
];

modules.exports= { presets };