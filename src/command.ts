import { Command } from "commander";
import { ArgumentError } from "./error/mainError";
import { generate } from "./generate/generate";

const program = new Command();

program
  .name("gassma")
  .version("1.0.0")
  .description("A CLI for providing GASsma dynamic types from yaml files")
  .argument("<command>", "command to execute");

program.parse();

const [command] = program.args;

switch (command) {
  case "generate":
    generate();
    break;
  default:
    throw new ArgumentError();
}
