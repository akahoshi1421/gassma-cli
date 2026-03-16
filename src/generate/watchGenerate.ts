import fs from "fs";
import path from "path";
import { generate } from "./generate";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";
import type { GenerateOptions } from "./generate";

const watchGenerate = (options?: GenerateOptions): (() => void) => {
  generate(options);

  const files = resolveSchemaFiles({ schema: options?.schema });
  const dirs = [...new Set(files.map((f) => path.dirname(f.filePath)))];

  console.log(`\n👀 Watching ${dirs.join(", ")} for changes...`);

  const watchers = dirs.map((dir) =>
    fs.watch(dir, (_event: string, filename: string | null) => {
      if (!filename || !filename.endsWith(".prisma")) return;
      console.log(`\n🔄 Detected change in ${filename}, regenerating...`);
      generate(options);
    }),
  );

  return () => {
    watchers.forEach((w) => w.close());
  };
};

export { watchGenerate };
