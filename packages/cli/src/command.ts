import { Command } from "commander";
import { bootstrap } from "./bootstrap/bootstrapCommand";
import { dbPush } from "./db/dbPushCommand";
import { debugCommand } from "./debug/debugCommand";
import { ArgumentError } from "./error/mainError";
import { format } from "./format/formatCommand";
import { generate } from "./generate/generate";
import { watchGenerate } from "./generate/watchGenerate";
import { init } from "./init/initCommand";
import { migrate } from "./migrate/migrateCommand";
import { studioCommand } from "./studio/studioCommand";
import { validate } from "./validate/validateCommand";
import { getVersion } from "./version/getVersion";
import { versionCommand } from "./version/versionCommand";

const program = new Command();

program
  .name("gassma")
  .version(getVersion())
  .description("A CLI for providing GASsma dynamic types from .prisma files");

program
  .command("generate")
  .description("Generate type definitions from .prisma files")
  .option("--schema <path>", "Path to a specific .prisma file to generate")
  .option("--config <path>", "Custom path to your GASsma config file")
  .option("--watch", "Watch for changes and regenerate automatically")
  .action((options) => {
    if (options.watch) {
      watchGenerate({ schema: options.schema, config: options.config });
    } else {
      generate({ schema: options.schema, config: options.config });
    }
  });

program
  .command("validate")
  .description("Validate .prisma files in the gassma directory")
  .option("--schema <path>", "Path to a specific .prisma file to validate")
  .option("--config <path>", "Custom path to your GASsma config file")
  .action((options) => {
    validate({ schema: options.schema, config: options.config });
  });

program
  .command("format")
  .description("Format .prisma files in the gassma directory")
  .option("--schema <path>", "Path to a specific .prisma file to format")
  .option("--config <path>", "Custom path to your GASsma config file")
  .option("--check", "Check if files are formatted without modifying them")
  .action(async (options) => {
    const result = await format({
      schema: options.schema,
      check: options.check,
      config: options.config,
    });
    if (options.check && !result) {
      console.error("Some files are not formatted.");
      process.exit(1);
    }
  });

program
  .command("migrate")
  .description(
    "Generate a GAS function that syncs spreadsheet sheets with your schema",
  )
  .option("--name <name>", "Name for the new migration")
  .option(
    "--output <dir>",
    "Directory to write gassma-migration.js (defaults to rootDir in .clasp.json)",
  )
  .option("--schema <path>", "Path to a specific .prisma file to migrate from")
  .option("--config <path>", "Custom path to your GASsma config file")
  .option(
    "--accept-data-loss",
    "Delete sheets and columns that are not in the schema",
  )
  .action((options) => {
    migrate({
      name: options.name,
      output: options.output,
      schema: options.schema,
      config: options.config,
      acceptDataLoss: options.acceptDataLoss,
    });
  });

const db = program
  .command("db")
  .description("Manage your spreadsheet sheets during development");

db.command("push")
  .description(
    "Generate a GAS function that syncs spreadsheet sheets with your schema, without recording a migration",
  )
  .option(
    "--output <dir>",
    "Directory to write gassma-migration.js (defaults to rootDir in .clasp.json)",
  )
  .option("--schema <path>", "Path to a specific .prisma file to push from")
  .option("--config <path>", "Custom path to your GASsma config file")
  .option(
    "--accept-data-loss",
    "Delete sheets and columns that are not in the schema",
  )
  .action((options) => {
    dbPush({
      output: options.output,
      schema: options.schema,
      config: options.config,
      acceptDataLoss: options.acceptDataLoss,
    });
  });

program
  .command("init")
  .description("Initialize a new GASsma project with a schema.prisma file")
  .option("--output <path>", "Custom output path for generated files")
  .option("--with-model", "Include a sample User model in the schema")
  .action((options) => {
    init({ output: options.output, withModel: options.withModel });
  });

program
  .command("bootstrap")
  .description(
    "Set up a local GAS development environment (clasp + esbuild + TypeScript + GASsma)",
  )
  .argument(
    "[directory]",
    'Directory to set up the project in ("." for the current directory)',
  )
  .option("--yes", "Answer all prompts with their default values")
  .option("--skip-install", "Skip dependency installation")
  .option(
    "--dry-run",
    "Show planned actions without writing files or running commands",
  )
  .action(async (directory, options) => {
    await bootstrap({
      directory,
      yes: options.yes,
      skipInstall: options.skipInstall,
      dryRun: options.dryRun,
    });
  });

program
  .command("studio")
  .description("Open the datasource spreadsheet in your default browser")
  .option("--config <path>", "Custom path to your GASsma config file")
  .action(async (options) => {
    await studioCommand({ config: options.config });
  });

program
  .command("debug")
  .description("Print information helpful for debugging and bug reports")
  .option("--schema <path>", "Path to a specific .prisma file to inspect")
  .option("--config <path>", "Custom path to your GASsma config file")
  .action(async (options) => {
    await debugCommand({ schema: options.schema, config: options.config });
  });

program
  .command("version")
  .description("Display the current version of GASsma CLI")
  .option("--json", "Output version information as JSON")
  .action((options) => {
    versionCommand({ json: options.json });
  });

program.parse();

if (program.args.length === 0) throw new ArgumentError();
