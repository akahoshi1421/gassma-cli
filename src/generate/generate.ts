import { generater } from "./generator";
import { yamlReader } from "./read/yamlReader";

function generate(fileName?: string) {
  const jsonConverted = yamlReader(fileName || "schema.yml");
  const resultString = generater(jsonConverted);
  console.log(resultString);
}

export { generate };
