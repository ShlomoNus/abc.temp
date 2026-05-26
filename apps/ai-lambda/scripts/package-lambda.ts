/**
 * Package for AWS Lambda deploy (bundle + node_modules in zip).
 * Use when you need dependencies loaded from node_modules at runtime.
 * Run after: npm run build. Output: lambdaOutput/<packageName>.zip (with deps).
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import JSZip from "jszip";

import { logger } from "@/utils/logger";

const root = process.cwd();

function packageNameToCamelCase(packageName: string): string {
  const baseName = packageName.includes("/") ? packageName.split("/")[1]! : packageName;

  return baseName
    .split(/[-_]/)
    .map((part, i) => (i === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()))
    .join("");
}

const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf-8")) as { name: string };
const lambdaOutputDir = path.join(root, "lambdaOutput");
const zipName = `${packageNameToCamelCase(pkg.name)}.zip`;
const outZip = path.join(lambdaOutputDir, zipName);

const excludeFromNodeModules = new Set([".cache"]);

function addDirToZip({ zip, dirPath, zipPath }: { zip: JSZip, dirPath: string, zipPath: string }): void {
  const entries = readdirSync(dirPath, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dirPath, e.name);
    const rel = path.join(zipPath, e.name);

    if (e.isDirectory()) {
      if (zipPath === "node_modules" && excludeFromNodeModules.has(e.name)) continue;

      addDirToZip({ zip, dirPath: full, zipPath: rel });
    }
    else {
      zip.file(rel, readFileSync(full));
    }
  }
}

async function main(): Promise<void> {
  execSync("npm run build", { cwd: root, stdio: "inherit" });

  const zip = new JSZip();

  zip.file("index.js", readFileSync(path.join(lambdaOutputDir, "index.js")));
  const mapPath = path.join(lambdaOutputDir, "index.js.map");

  if (existsSync(mapPath)) {
    zip.file("index.js.map", readFileSync(mapPath));
  }

  addDirToZip({ zip, dirPath: path.join(root, "node_modules"), zipPath: "node_modules" });
  zip.file("package.json", readFileSync(path.join(root, "package.json")));

  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  writeFileSync(outZip, buffer);

  logger.info(`Created ${outZip}`);
  logger.info("Lambda handler: index.handler");
}

main().catch(err => {
  logger.error({ error: err }, "package-lambda: error");
  process.exit(1);
});
