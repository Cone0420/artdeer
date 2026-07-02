import fs from "fs";
import path from "path";

const globalForRoot = globalThis as typeof globalThis & {
  __artdearProjectRoot?: string;
};

function readPackageName(packageJsonPath: string): string | null {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as { name?: string };
    return pkg.name ?? null;
  } catch {
    return null;
  }
}

export function getProjectRoot(): string {
  if (globalForRoot.__artdearProjectRoot) {
    return globalForRoot.__artdearProjectRoot;
  }

  if (process.env.ARTDEAR_PROJECT_ROOT) {
    globalForRoot.__artdearProjectRoot = path.resolve(process.env.ARTDEAR_PROJECT_ROOT);
    return globalForRoot.__artdearProjectRoot;
  }

  const candidates = new Set<string>([process.cwd()]);

  if (typeof __dirname !== "undefined") {
    candidates.add(__dirname);
  }

  for (const startDir of candidates) {
    let dir = startDir;

    for (let depth = 0; depth < 12; depth += 1) {
      const packageJsonPath = path.join(dir, "package.json");
      if (fs.existsSync(packageJsonPath) && readPackageName(packageJsonPath) === "my-app") {
        globalForRoot.__artdearProjectRoot = dir;
        return dir;
      }

      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  globalForRoot.__artdearProjectRoot = process.cwd();
  return globalForRoot.__artdearProjectRoot;
}

export function resolveProjectPath(...segments: string[]): string {
  return path.join(getProjectRoot(), ...segments);
}
