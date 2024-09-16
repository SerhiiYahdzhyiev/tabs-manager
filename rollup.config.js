import terser from "@rollup/plugin-terser";

const terserOptions = {
    mangle: {
        keep_classnames: true,
    },
    compress: false,
}
export default [
    {
        input: "build/index.js",
        output: {
            file: "dist/tabs-manager.js",
            format: "iife",
            plugins: [terser(terserOptions)],
        },
    },
];
