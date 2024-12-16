import { generater } from "./generator";
import { yamlReader } from "./read/yamlReader";
import { writer } from "./writer";

function generate(fileName?: string) {
  const openFileName = fileName || "schema.yml";
  const jsonConverted = yamlReader(openFileName);
  const resultString = generater(jsonConverted);
  writer(resultString);
}

export { generate };
