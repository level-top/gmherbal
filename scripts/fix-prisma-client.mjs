import fs from "node:fs/promises";
import path from "node:path";

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const root = process.cwd();
  const sourceDir = path.join(root, "node_modules", ".prisma", "client");
  const targetDir = path.join(
    root,
    "node_modules",
    "@prisma",
    "client",
    ".prisma",
    "client",
  );

  if (!(await exists(sourceDir))) {
    return;
  }

  await fs.mkdir(targetDir, { recursive: true });

  const relToRootGenerated = "../../../../.prisma/client";

  const files = [
    {
      name: "default.js",
      content: `module.exports = require('${relToRootGenerated}/default')\n`,
    },
    {
      name: "default.d.ts",
      content: `export * from '${relToRootGenerated}/default'\n`,
    },
    {
      name: "edge.js",
      content: `module.exports = require('${relToRootGenerated}/edge')\n`,
    },
    {
      name: "edge.d.ts",
      content: `export * from '${relToRootGenerated}/edge'\n`,
    },
  ];

  for (const f of files) {
    await fs.writeFile(path.join(targetDir, f.name), f.content, "utf8");
  }
}

main().catch(() => {
  // Non-fatal; Prisma client still works in many setups.
});
