import { Command } from "commander";
import { ArgumentError } from "./error";
import { generate } from "./generate/generate";

const program = new Command();

program
  .name("generate")
  .version("1.0.0")
  .description("A CLI for providing GASsma dynamic types from yaml files")
  .argument("<do>", "do type")
  .option("-f, --file", "yaml file");

program.parse();

const [doing, fileName] = program.args;

switch (doing) {
  case "generate":
    generate(fileName);
    break;
  default:
    throw new ArgumentError();
}
