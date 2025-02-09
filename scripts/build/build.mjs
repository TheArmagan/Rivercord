#!/usr/bin/node
/*
 * Rivercord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import esbuild from "esbuild";
import { readdir, writeFile } from "fs/promises";
import { join } from "path";

import { BUILD_TIMESTAMP, commonOpts, exists, globPlugins, IS_DEV, IS_REPORTER, IS_STANDALONE, IS_UPDATER_DISABLED, resolvePluginName, VERSION, watch, gitHash, stringifyValues } from "./common.mjs";

const defines = {
    IS_STANDALONE,
    IS_DEV,
    IS_REPORTER,
    IS_UPDATER_DISABLED,
    IS_WEB: false,
    IS_EXTENSION: false,
    VERSION: JSON.stringify(VERSION),
    BUILD_TIMESTAMP
};

if (defines.IS_STANDALONE === false)
    // If this is a local build (not standalone), optimize
    // for the specific platform we're on
    defines["process.platform"] = JSON.stringify(process.platform);

/**
 * @type {esbuild.BuildOptions}
 */
const nodeCommonOpts = {
    ...commonOpts,
    format: "cjs",
    platform: "node",
    target: ["esnext"],
    external: ["electron", "original-fs", "~pluginNatives", ...commonOpts.external],
    define: stringifyValues(defines),
    logLevel: "info"
};

const sourceMapFooter = s => watch ? "" : `//# sourceMappingURL=rivercord://${s}.js.map`;
const sourcemap = watch ? "inline" : "external";

/**
 * @type {import("esbuild").Plugin}
 */
const globNativesPlugin = {
    name: "glob-natives-plugin",
    setup: build => {
        const filter = /^~pluginNatives$/;
        build.onResolve({ filter }, args => {
            return {
                namespace: "import-natives",
                path: args.path
            };
        });

        build.onLoad({ filter, namespace: "import-natives" }, async () => {
            const pluginDirs = ["plugins", "userplugins"];
            let code = "";
            let natives = "\n";
            let i = 0;
            for (const dir of pluginDirs) {
                const dirPath = join("src", dir);
                if (!await exists(dirPath)) continue;
                const plugins = await readdir(dirPath, { withFileTypes: true });
                for (const file of plugins) {
                    const fileName = file.name;
                    const nativePath = join(dirPath, fileName, "native.ts");
                    const indexNativePath = join(dirPath, fileName, "native/index.ts");

                    if (!(await exists(nativePath)) && !(await exists(indexNativePath)))
                        continue;

                    const pluginName = await resolvePluginName(dirPath, file);

                    const mod = `p${i}`;
                    code += `import * as ${mod} from "./${dir}/${fileName}/native";\n`;
                    natives += `${JSON.stringify(pluginName)}:${mod},\n`;
                    i++;
                }
            }
            code += `export default {${natives}};`;
            return {
                contents: code,
                resolveDir: "./src"
            };
        });
    }
};

await Promise.all([
    // Discord Desktop main & renderer & preload
    esbuild.context({
        ...nodeCommonOpts,
        entryPoints: ["src/main/index.ts"],
        outfile: "dist/patcher.js",
        footer: { js: "//# sourceURL=RivercordPatcher\n" + sourceMapFooter("patcher") },
        sourcemap,
        define: {
            ...stringifyValues(defines),
            IS_DISCORD_DESKTOP: "true",
            IS_VESKTOP: "false"
        },
        plugins: [
            ...nodeCommonOpts.plugins,
            globNativesPlugin
        ]
    }),
    esbuild.context({
        ...commonOpts,
        entryPoints: ["src/Rivercord.ts"],
        outfile: "dist/renderer.js",
        format: "iife",
        target: ["esnext"],
        footer: { js: "//# sourceURL=RivercordRenderer\n" + sourceMapFooter("renderer") },
        globalName: "Rivercord",
        sourcemap,
        plugins: [
            globPlugins("discordDesktop"),
            ...commonOpts.plugins
        ],
        define: {
            ...stringifyValues(defines),
            IS_DISCORD_DESKTOP: "true",
            IS_VESKTOP: "false"
        }
    }),
    esbuild.context({
        ...nodeCommonOpts,
        entryPoints: ["src/preload.ts"],
        outfile: "dist/preload.js",
        footer: { js: "//# sourceURL=RivercordPreload\n" + sourceMapFooter("preload") },
        sourcemap,
        define: {
            ...stringifyValues(defines),
            IS_DISCORD_DESKTOP: "true",
            IS_VESKTOP: "false"
        }
    }),

    // Rivercord Desktop main & renderer & preload
    esbuild.context({
        ...nodeCommonOpts,
        entryPoints: ["src/main/index.ts"],
        outfile: "dist/rivercordDesktopMain.js",
        footer: { js: "//# sourceURL=RivercordDesktopMain\n" + sourceMapFooter("rivercordDesktopMain") },
        sourcemap,
        define: {
            ...stringifyValues(defines),
            IS_DISCORD_DESKTOP: "false",
            IS_VESKTOP: "true"
        },
        plugins: [
            ...nodeCommonOpts.plugins,
            globNativesPlugin
        ]
    }),
    esbuild.context({
        ...commonOpts,
        entryPoints: ["src/Rivercord.ts"],
        outfile: "dist/rivercordDesktopRenderer.js",
        format: "iife",
        target: ["esnext"],
        footer: { js: "//# sourceURL=RivercordDesktopRenderer\n" + sourceMapFooter("rivercordDesktopRenderer") },
        globalName: "Rivercord",
        sourcemap,
        plugins: [
            globPlugins("rivercordDesktop"),
            ...commonOpts.plugins
        ],
        define: {
            ...stringifyValues(defines),
            IS_DISCORD_DESKTOP: "false",
            IS_VESKTOP: "true"
        }
    }),
    esbuild.context({
        ...nodeCommonOpts,
        entryPoints: ["src/preload.ts"],
        outfile: "dist/rivercordDesktopPreload.js",
        footer: { js: "//# sourceURL=RivercordPreload\n" + sourceMapFooter("rivercordDesktopPreload") },
        sourcemap,
        define: {
            ...stringifyValues(defines),
            IS_DISCORD_DESKTOP: "false",
            IS_VESKTOP: "true"
        }
    }),
]).then(ctxs => {
    for (const ctx of ctxs) {
        if (watch) {
            ctx.watch();
        } else {
            ctx.rebuild().then(d => {
                d.errors.forEach(e => console.error(e));
                d.warnings.forEach(w => console.warn(w));
            }).catch(console.error).finally(() => {
                ctx.dispose();
            });
        }
    }
});
writeFile("dist/git-hash.txt", gitHash, "utf8");
