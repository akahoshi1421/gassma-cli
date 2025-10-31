import { Command } from "commander";
import { ArgumentError } from "./error/mainError";
import { generate } from "./generate/generate";

const program = new Command();

program
  .name("gassma")
  .version("1.0.0")
  .description("A CLI for providing GASsma dynamic types from yaml files");

program
  .command("generate [directory]")
  .description("Generate type definitions from YAML files")
  .action((directory) => {
    generate(directory);
  });

program.parse();

if (program.args.length === 0) throw new ArgumentError();
// test3
