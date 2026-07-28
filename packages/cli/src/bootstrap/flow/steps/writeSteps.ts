import path from "path";
import { mergeGitignore } from "../../generators/mergeGitignore";
import { mergePackageJson } from "../../generators/mergePackageJson";
import {
  patchPackageJson,
  renderPackageJson,
} from "../../generators/patchPackageJson";
import { sanitizePackageName } from "../../generators/sanitizePackageName";
import { init } from "../../../init/initCommand";
import type {
  BootstrapContext,
  BootstrapDeps,
  BootstrapStep,
} from "../context";

const writePackageJson = (context: BootstrapContext, deps: BootstrapDeps) => {
  const packageJsonPath = path.join(context.cwd, "package.json");
  const desired = patchPackageJson(deps.templates.packageJson, {
    name: sanitizePackageName(path.basename(context.cwd)),
    gassmaVersion: deps.gassmaVersion,
    style: context.style,
  });

  if (!deps.store.exists(packageJsonPath)) {
    deps.store.write(packageJsonPath, renderPackageJson(desired));
    deps.prompter.info("Created package.json");
    return;
  }

  try {
    const merged = mergePackageJson(deps.store.read(packageJsonPath), desired);
    deps.store.write(packageJsonPath, merged);
    deps.prompter.info("Merged bootstrap settings into existing package.json");
  } catch {
    deps.prompter.warn(
      "Existing package.json could not be parsed. Leaving it untouched.",
    );
  }
};

const writeIfMissing = (
  deps: BootstrapDeps,
  filePath: string,
  content: string,
  label: string,
) => {
  if (deps.store.exists(filePath)) {
    deps.prompter.info(`Found an existing ${label}. Skipping.`);
    return;
  }
  deps.store.write(filePath, content);
  deps.prompter.info(`Created ${label}`);
};

const writeGitignore = (context: BootstrapContext, deps: BootstrapDeps) => {
  const gitignorePath = path.join(context.cwd, ".gitignore");
  if (!deps.store.exists(gitignorePath)) {
    deps.store.write(gitignorePath, deps.templates.gitignore);
    deps.prompter.info("Created .gitignore");
    return;
  }

  const existing = deps.store.read(gitignorePath);
  const merged = mergeGitignore(deps.templates.gitignore, existing);
  if (merged === existing) return;

  deps.store.write(gitignorePath, merged);
  deps.prompter.info("Added missing entries to .gitignore");
};

const projectFilesStep: BootstrapStep = {
  id: "projectFiles",
  run: (context, deps) => {
    writePackageJson(context, deps);
    writeIfMissing(
      deps,
      path.join(context.cwd, "esbuild.mjs"),
      deps.templates.esbuild[context.style],
      "esbuild.mjs",
    );
    writeIfMissing(
      deps,
      path.join(context.cwd, "tsconfig.json"),
      deps.templates.tsconfig,
      "tsconfig.json",
    );
    writeGitignore(context, deps);
    writeIfMissing(
      deps,
      path.join(context.cwd, "AGENTS.md"),
      deps.templates.agentsMd,
      "AGENTS.md",
    );
    return Promise.resolve(context);
  },
};

const sampleIndexStep: BootstrapStep = {
  id: "sampleIndex",
  run: (context, deps) => {
    if (!context.wantSample) return Promise.resolve(context);

    const indexPath = path.join(context.cwd, "src", "index.ts");
    if (deps.store.exists(indexPath)) {
      deps.prompter.info(
        "Found an existing src/index.ts. Skipping sample generation.",
      );
      return Promise.resolve(context);
    }

    deps.store.write(indexPath, deps.templates.sampleIndex[context.style]);
    deps.prompter.info("Created src/index.ts");
    return Promise.resolve(context);
  },
};

const initStep: BootstrapStep = {
  id: "init",
  run: (context, deps) => {
    const schemaPath = path.join(context.cwd, "gassma", "schema.prisma");
    if (deps.store.exists(schemaPath)) {
      deps.prompter.info(
        "Found an existing gassma/schema.prisma. Skipping gassma init.",
      );
      return Promise.resolve(context);
    }

    if (deps.dryRun) {
      deps.plan(
        "run gassma init (create gassma/schema.prisma and gassma.config.ts)",
      );
      return Promise.resolve(context);
    }

    init({ withModel: true });
    return Promise.resolve(context);
  },
};

export { initStep, projectFilesStep, sampleIndexStep };
