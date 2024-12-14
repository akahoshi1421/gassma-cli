import { Command } from "commander";

const program = new Command();

program
  .name("generate")
  .version("1.0.0")
  .description("A CLI for providing GASsma dynamic types from yaml files")
  .argument("<do>", "do type")
  .option("-f, --file", "yaml file");

program.parse();

console.log(program.args);
