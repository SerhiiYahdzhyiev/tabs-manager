import terser from "@rollup/plugin-terser";

const isProduction = process.env.BUILD === "prod"

const terserOptions = {
    mangle: {
        keep_classnames: true,
    },
    compress: false,
};

const config = () => ({
    input: "build/index.js",
    output: {
        file: "dist/tabs-manager.js",
        format: "iife",
        plugins: isProduction ? [terser(terserOptions)] : [],
        sourcemap: !isProduction,
    },
});

export default [
    config()
];
