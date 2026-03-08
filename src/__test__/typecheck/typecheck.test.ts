import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { generater } from "../../generate/generator";
import { prismaReader } from "../../generate/read/prismaReader";
import { extractRelations } from "../../generate/read/extractRelations";

describe("generated .d.ts type check", () => {
  const prismaPath = path.join(__dirname, "fixture.prisma");
  const stubsSourcePath = path.join(__dirname, "gassma-stubs.d.ts");

  it("should pass tsc --noEmit without type errors", () => {
    const schemaText = fs.readFileSync(prismaPath, "utf-8");
    const parsed = prismaReader(schemaText);
    const relations = extractRelations(schemaText);
    const generated = generater(parsed, relations);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-typecheck-"));
    const generatedPath = path.join(tmpDir, "generated.d.ts");
    const stubsPath = path.join(tmpDir, "gassma-stubs.d.ts");
    const tsconfigPath = path.join(tmpDir, "tsconfig.json");

    try {
      fs.copyFileSync(stubsSourcePath, stubsPath);
      fs.writeFileSync(generatedPath, generated);
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            lib: ["ES2021"],
          },
          include: ["*.d.ts"],
        }),
      );

      const result = execSync(`npx tsc --project ${tsconfigPath} 2>&1`, {
        encoding: "utf-8",
        cwd: tmpDir,
      });

      expect(result).toBe("");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
