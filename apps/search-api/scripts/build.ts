import path from "node:path";

import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";
import { build } from "esbuild";

const isProd = process.argv.includes("--prod");
const root = process.cwd();

async function main(): Promise<void> {
  await build({
    entryPoints: [path.resolve(root, "src/index.ts")],
    outfile: path.resolve(root, "dist/index.js"),

    bundle: true,
    platform: "node",
    target: "node22",
    format: "esm",

    sourcemap: !isProd,
    minify: isProd,

    packages: "external",
    legalComments: "none",
    logLevel: "info",

    tsconfig: path.resolve(root, "tsconfig.json"),

    plugins: [
      TsconfigPathsPlugin({
        tsconfig: path.resolve(root, "tsconfig.json")
      })
    ]
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});