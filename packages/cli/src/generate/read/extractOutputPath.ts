import {
  findArgument,
  asStringArgument,
  parsePrismaSchema,
} from "@loancrate/prisma-schema-parser";

const extractOutputPath = (schemaText: string): string | null => {
  const ast = parsePrismaSchema(schemaText);

  for (const decl of ast.declarations) {
    if (decl.kind !== "generator") continue;

    const outputConfig = decl.members.find(
      (m) => m.kind === "config" && m.name.value === "output",
    );

    if (outputConfig && outputConfig.kind === "config") {
      if (outputConfig.value.kind === "literal") {
        const value = outputConfig.value.value;
        if (typeof value === "string") return value;
      }
    }
  }

  return null;
};

export { extractOutputPath };
