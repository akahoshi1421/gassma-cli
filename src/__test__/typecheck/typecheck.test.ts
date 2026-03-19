import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { generater } from "../../generate/generator";
import { generateClientDts } from "../../generate/jsGenerate/generateClientDts";
import { prismaReader } from "../../generate/read/prismaReader";
import { extractRelations } from "../../generate/read/extractRelations";

const tscPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "node_modules",
  ".bin",
  "tsc",
);

const runTsc = (tmpDir: string, tsconfigPath: string): string => {
  let result = "";
  try {
    result = execSync(`${tscPath} --project ${tsconfigPath} 2>&1`, {
      encoding: "utf-8",
      cwd: tmpDir,
    });
  } catch (e) {
    const error = e as { stdout?: string; stderr?: string };
    result = error.stdout ?? error.stderr ?? "unknown error";
  }
  return result;
};

const writeTsconfig = (tsconfigPath: string) => {
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
};

const generateFromPrisma = (
  prismaPath: string,
  schemaName?: string,
  includeCommon?: boolean,
): string => {
  const schemaText = fs.readFileSync(prismaPath, "utf-8");
  const parsed = prismaReader(schemaText);
  const relations = extractRelations(schemaText);
  return generater(parsed, relations, schemaName, includeCommon);
};

const writeTsconfigWithTs = (tsconfigPath: string) => {
  fs.writeFileSync(
    tsconfigPath,
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        lib: ["ES2021"],
        module: "ES2020",
        moduleResolution: "node",
      },
      include: ["*.d.ts", "*.ts"],
    }),
  );
};

describe("generated .d.ts type check", () => {
  it("should pass tsc --noEmit without type errors", () => {
    const prismaPath = path.join(__dirname, "fixture.prisma");
    const generated = generateFromPrisma(prismaPath);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-typecheck-"));
    const tsconfigPath = path.join(tmpDir, "tsconfig.json");

    try {
      fs.writeFileSync(path.join(tmpDir, "generated.d.ts"), generated);
      writeTsconfig(tsconfigPath);

      const result = runTsc(tmpDir, tsconfigPath);
      expect(result).toBe("");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("should reflect global omit in return types", () => {
    const prismaPath = path.join(__dirname, "fixture.prisma");
    const generated = generateFromPrisma(prismaPath);
    const clientDts = generateClientDts("");
    const mergedDts = generated + "\n" + clientDts;

    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "gassma-typecheck-omit-"),
    );
    const tsconfigPath = path.join(tmpDir, "tsconfig.json");

    const usageTs = `
import { GassmaClient } from "./client";

// グローバルomitなし: 全フィールドアクセス可能
declare const client: GassmaClient;
const r1 = client.sheets.User.findFirst({ where: { id: 1 } });
if (r1) {
  const email: string = r1.email;
  const name: string | null = r1.name;
}

// グローバルomitあり: email が返り値から除外される
declare const clientOmit: GassmaClient<{ User: { email: true } }>;
const r2 = clientOmit.sheets.User.findFirst({ where: { id: 1 } });
if (r2) {
  const name: string | null = r2.name;
  // @ts-expect-error email はグローバルomitで除外
  r2.email;
}

// omit: { email: false } でグローバルomitを解除
const r3 = clientOmit.sheets.User.findFirst({ where: { id: 1 }, omit: { email: false } });
if (r3) {
  const email: string = r3.email;
}

// select はグローバルomitを上書き
const r4 = clientOmit.sheets.User.findFirst({ where: { id: 1 }, select: { email: true } });
if (r4) {
  const email: string = r4.email;
}

// クエリomitも返り値に反映
const r5 = client.sheets.User.findFirst({ where: { id: 1 }, omit: { name: true } });
if (r5) {
  const email: string = r5.email;
  // @ts-expect-error name はクエリomitで除外
  r5.name;
}

// findMany でも同様
const r6 = clientOmit.sheets.User.findMany({ where: {} });
// @ts-expect-error email はグローバルomitで除外
r6[0]?.email;
`;

    try {
      fs.writeFileSync(path.join(tmpDir, "client.d.ts"), mergedDts);
      fs.writeFileSync(path.join(tmpDir, "usage.ts"), usageTs);
      writeTsconfigWithTs(tsconfigPath);

      const result = runTsc(tmpDir, tsconfigPath);
      expect(result).toBe("");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("should not collide when multiple schemas have the same model name", () => {
    const hogePath = path.join(__dirname, "fixture-hoge.prisma");
    const fugaPath = path.join(__dirname, "fixture-fuga.prisma");
    const hogeGenerated = generateFromPrisma(hogePath, "Hoge");
    const fugaGenerated = generateFromPrisma(fugaPath, "Fuga");
    const hogeMerged = hogeGenerated + "\n" + generateClientDts("Hoge");
    const fugaMerged = fugaGenerated + "\n" + generateClientDts("Fuga");

    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "gassma-typecheck-multi-"),
    );
    const tsconfigPath = path.join(tmpDir, "tsconfig.json");

    try {
      fs.writeFileSync(path.join(tmpDir, "hogeClient.d.ts"), hogeMerged);
      fs.writeFileSync(path.join(tmpDir, "fugaClient.d.ts"), fugaMerged);
      writeTsconfig(tsconfigPath);

      const result = runTsc(tmpDir, tsconfigPath);
      expect(result).toBe("");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
