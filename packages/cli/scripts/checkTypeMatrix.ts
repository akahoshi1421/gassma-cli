import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

// peerDependencies は typescript >=5.2 を宣言している。下限の 5.2、5.6、
// VS Code 同梱の 5.9、現行の 6.0、最新の 7.0 を対象にする。
// 同名パッケージのため devDependencies には同居できないので、
// バージョンごとに別プレフィックスへ install してキャッシュする。
const DEFAULT_VERSIONS = ["5.2.2", "5.6.3", "5.9.3", "6.0.3", "7.0.2"];

// strictNullChecks が off だと undefined / unknown が任意プロパティのみの型にも
// object にも代入可能になり、結果型の分岐が変わる。TypeScript 6 以降は strict が
// 既定で on になったため、off 側を回さないとこの差異を検出できない。
const PROJECTS = [
  { label: "on", config: "tsconfig.typetest.json" },
  { label: "off", config: "tsconfig.typetest.nostrict.json" },
];

const cliRoot = path.join(__dirname, "..");
const cacheRoot = path.join(cliRoot, ".tsmatrix");

const versions = process.argv.slice(2).length
  ? process.argv.slice(2)
  : DEFAULT_VERSIONS;

const tscPathFor = (version: string) =>
  path.join(cacheRoot, version, "node_modules", "typescript", "bin", "tsc");

const ensureTypeScript = (version: string) => {
  const tsc = tscPathFor(version);
  if (fs.existsSync(tsc)) return tsc;

  const dir = path.join(cacheRoot, version);
  fs.mkdirSync(dir, { recursive: true });
  console.log(`installing typescript@${version} -> ${dir}`);
  const installed = spawnSync(
    "npm",
    [
      "install",
      "--prefix",
      dir,
      `typescript@${version}`,
      "--no-save",
      "--no-package-lock",
      "--no-audit",
      "--no-fund",
    ],
    { encoding: "utf-8", stdio: "inherit" },
  );
  if (installed.status !== 0 || !fs.existsSync(tsc)) {
    throw new Error(`typescript@${version} の取得に失敗しました`);
  }
  return tsc;
};

const versionOf = (tsc: string) => {
  const out = spawnSync(process.execPath, [tsc, "--version"], {
    encoding: "utf-8",
  });
  return out.stdout.trim().replace(/^Version\s+/, "");
};

const runOne = (tsc: string, config: string) => {
  const out = spawnSync(
    process.execPath,
    [tsc, "--noEmit", "--pretty", "false", "-p", path.join(cliRoot, config)],
    { encoding: "utf-8", cwd: cliRoot },
  );
  const text = `${out.stdout ?? ""}${out.stderr ?? ""}`;
  const errors = text.split("\n").filter((line) => /error TS\d+:/.test(line));
  return { ok: out.status === 0, errors };
};

const results = versions.flatMap((requested) => {
  const tsc = ensureTypeScript(requested);
  const resolved = versionOf(tsc);
  return PROJECTS.map((project) => {
    const run = runOne(tsc, project.config);
    return { requested, resolved, strict: project.label, ...run };
  });
});

console.log("\n型テストマトリクス (tsc --noEmit)\n");
console.log(["TypeScript", "strict", "結果", "エラー数"].join("\t"));
results.forEach((r) => {
  const mark = r.ok ? "OK" : "NG";
  console.log([r.resolved, r.strict, mark, r.errors.length].join("\t"));
});

const failed = results.filter((r) => !r.ok);

failed.forEach((r) => {
  console.log(`\n--- TypeScript ${r.resolved} / strict=${r.strict} ---`);
  r.errors.slice(0, 30).forEach((line) => console.log(line));
  if (r.errors.length > 30) console.log(`... 他 ${r.errors.length - 30} 件`);
});

if (failed.length > 0) {
  const where = failed
    .map((r) => `TypeScript ${r.resolved} (strict=${r.strict})`)
    .join(", ");
  console.error(`\n型チェックに失敗しました: ${where}`);
  process.exit(1);
}

console.log("\nすべての組み合わせで型チェックに成功しました。");
