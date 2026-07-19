import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";

const extractPreviewFeatures = (schemaText: string): string[] => {
  const ast = parsePrismaSchema(schemaText);

  return ast.declarations.reduce<string[]>((pre, decl) => {
    if (decl.kind !== "generator") return pre;

    const config = decl.members.find(
      (m) => m.kind === "config" && m.name.value === "previewFeatures",
    );
    if (!config || config.kind !== "config") return pre;
    if (config.value.kind !== "array") return pre;

    const features = config.value.items.reduce<string[]>((names, item) => {
      if (item.kind === "literal" && typeof item.value === "string") {
        return [...names, item.value];
      }
      return names;
    }, []);

    return [...pre, ...features];
  }, []);
};

export { extractPreviewFeatures };
