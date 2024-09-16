import terser from "@rollup/plugin-terser";

export default {
    input: "build/index.js",
    output: {
        file: "dist/tabs-manager.js",
        format: "iife",
        name: "version",
        plugins: [terser()]
    }
};
