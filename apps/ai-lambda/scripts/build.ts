import fs from "fs";
import { resolve } from "path";

import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";
import { build as esbuild } from "esbuild";
import JSZip from "jszip";

const root = process.cwd();

/** "@earthquake-reports/ai-lambda" → "aiLambda", "service-setup" → "serviceSetup" */
function packageNameToCamelCase(packageName: string): string {
  const baseName = packageName.includes("/") ? packageName.split("/")[1]! : packageName;

  return baseName
    .split(/[-_]/)
    .map((part, i) => (i === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()))
    .join("");
}

const pkg = JSON.parse(fs.readFileSync(resolve(root, "package.json"), "utf-8")) as { name: string };
const lambdaOutputDir = resolve(root, "lambdaOutput");
const zipName = `${packageNameToCamelCase(pkg.name)}.zip`;
const outputFile = resolve(lambdaOutputDir, "index.js");
const zipFile = resolve(lambdaOutputDir, zipName);

const isProd = process.argv.includes("--prod");

/** Remove previous lambda output and zip so we start clean */
async function cleanPreviousBuildAndZip(): Promise<void> {
  await fs.promises.rm(lambdaOutputDir, { recursive: true, force: true });
  await fs.promises.mkdir(lambdaOutputDir, { recursive: true });
}

async function buildLambda(): Promise<void> {
  await esbuild({
    entryPoints: [resolve(root, "src/index.ts")],
    outfile: outputFile,
    bundle: true,
    platform: "node",
    target: "node22",
    format: "cjs",
    sourcemap: !isProd,
    minify: isProd,
    legalComments: "none",
    logLevel: "info",
    tsconfig: resolve(root, "tsconfig.json"),
    plugins: [
      TsconfigPathsPlugin({
        tsconfig: resolve(root, "tsconfig.json")
      })
    ]
  });
}

async function zipDist(): Promise<void> {
  const zip = new JSZip();
  zip.file("index.js", fs.readFileSync(outputFile));
  const mapFile = `${outputFile}.map`;
  if (fs.existsSync(mapFile)) {
    zip.file("index.js.map", fs.readFileSync(mapFile));
  }
  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(zipFile, buffer);
}

async function build(): Promise<void> {
  await cleanPreviousBuildAndZip();
  await buildLambda();
  await zipDist();

  console.log(`Built Lambda: ${outputFile}`);
  console.log(`Created zip: ${zipFile}`);
  console.log("Lambda handler: index.handler");
}

build().catch(error => {
  console.error(error);
  process.exit(1);
});
