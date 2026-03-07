const PRISMA_TYPE_MAP: Record<string, string> = {
  Int: "number",
  Float: "number",
  Decimal: "number",
  BigInt: "number",
  String: "string",
  Boolean: "boolean",
  DateTime: "Date",
  Json: "string",
  Bytes: "string",
};

const mapPrismaType = (prismaType: string): string => {
  return PRISMA_TYPE_MAP[prismaType] ?? "string";
};

export { mapPrismaType };
