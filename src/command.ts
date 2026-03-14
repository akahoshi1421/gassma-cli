import { Command } from "commander";
import { ArgumentError } from "./error/mainError";
import { generate } from "./generate/generate";
import { validate } from "./validate/validateCommand";
import { getVersion } from "./version/getVersion";

const program = new Command();

program
  .name("gassma")
  .version(getVersion())
  .description("A CLI for providing GASsma dynamic types from .prisma files");

program
  .command("generate")
  .description("Generate type definitions from .prisma files")
  .option("--schema <path>", "Path to a specific .prisma file to generate")
  .action((options) => {
    generate({ schema: options.schema });
  });

program
  .command("validate")
  .description("Validate .prisma files in the gassma directory")
  .option("--schema <path>", "Path to a specific .prisma file to validate")
  .action((options) => {
    validate({ schema: options.schema });
  });

program
  .command("version")
  .description("Display the current version of GASsma CLI")
  .action(() => {
    console.log(`gassma v${getVersion()}`);
  });

program.parse();

if (program.args.length === 0) throw new ArgumentError();
