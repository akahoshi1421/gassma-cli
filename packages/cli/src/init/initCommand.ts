import fs from "fs";
import path from "path";
import { generateTemplate } from "./generateTemplate";
import { generateConfigTemplate } from "./generateConfigTemplate";

type InitOptions = {
  output?: string;
  withModel?: boolean;
};

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

  const template = generateTemplate({
    output: options?.output,
    withModel: options?.withModel,
  });

  fs.writeFileSync(schemaPath, template, "utf-8");
  console.log(`📄 Created ${schemaPath}`);

  if (!fs.existsSync(configPath)) {
    const configTemplate = generateConfigTemplate({
      schemaPath: "gassma/schema.prisma",
    });
    fs.writeFileSync(configPath, configTemplate, "utf-8");
    console.log(`📄 Created ${configPath}`);
  }

  console.log(
    "\n✅ GASsma initialized. Edit gassma/schema.prisma to define your models.",
  );
}

export { init };
