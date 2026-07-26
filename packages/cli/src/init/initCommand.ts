import fs from "fs";
import path from "path";
import { readTemplate } from "../util/readTemplate";
import { patchSchemaOutput } from "./patchSchemaOutput";

type InitOptions = {
  output?: string;
  withModel?: boolean;
};

const schemaTemplateName = (withModel: boolean): string =>
  withModel ? "schema.with-model.prisma.template" : "schema.prisma.template";

function init(options?: InitOptions) {
  const gassmaDir = "./gassma";
  const schemaPath = path.join(gassmaDir, "schema.prisma");
  const configPath = "./gassma.config.ts";

  if (fs.existsSync(schemaPath)) {
    throw new Error(
      `${schemaPath} already exists. To reinitialize, remove it first.`,
    );
  }

  if (!fs.existsSync(gassmaDir)) {
    fs.mkdirSync(gassmaDir, { recursive: true });
    console.log(`📁 Created ${gassmaDir}/ directory`);
  }

  const template = patchSchemaOutput(
    readTemplate(schemaTemplateName(options?.withModel === true)),
    options?.output,
  );

  fs.writeFileSync(schemaPath, template, "utf-8");
  console.log(`📄 Created ${schemaPath}`);

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      readTemplate("gassma.config.ts.template"),
      "utf-8",
    );
    console.log(`📄 Created ${configPath}`);
  }

  console.log(
    "\n✅ GASsma initialized. Edit gassma/schema.prisma to define your models.",
  );
}

export { init };
