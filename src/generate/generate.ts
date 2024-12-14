import { yamlReader } from "./read/yamlReader";

function generate(fileName?: string) {
  const jsonConverted = yamlReader(fileName || "schema.yml");

  console.log(jsonConverted);
}

export { generate };
