type TemplateOptions = {
  output?: string;
  withModel?: boolean;
};

const generateTemplate = (options: TemplateOptions): string => {
  const output = options.output ?? "./src/generated/gassma";

  let template = `generator client {
  provider = "prisma-client-js"
  output   = "${output}"
}
`;

  if (options.withModel) {
    template += `
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
}
`;
  }

  return template;
};

export { generateTemplate };
export type { TemplateOptions };
