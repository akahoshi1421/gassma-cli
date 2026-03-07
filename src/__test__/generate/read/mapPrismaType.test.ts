import { mapPrismaType } from "../../../generate/read/mapPrismaType";

describe("mapPrismaType", () => {
  it("should map Int to number", () => {
    expect(mapPrismaType("Int")).toBe("number");
  });

  it("should map Float to number", () => {
    expect(mapPrismaType("Float")).toBe("number");
  });

  it("should map Decimal to number", () => {
    expect(mapPrismaType("Decimal")).toBe("number");
  });

  it("should map BigInt to number", () => {
    expect(mapPrismaType("BigInt")).toBe("number");
  });

  it("should map String to string", () => {
    expect(mapPrismaType("String")).toBe("string");
  });

  it("should map Boolean to boolean", () => {
    expect(mapPrismaType("Boolean")).toBe("boolean");
  });

  it("should map DateTime to Date", () => {
    expect(mapPrismaType("DateTime")).toBe("Date");
  });

  it("should map Json to string", () => {
    expect(mapPrismaType("Json")).toBe("string");
  });

  it("should map Bytes to string", () => {
    expect(mapPrismaType("Bytes")).toBe("string");
  });

  it("should fallback to string for unknown types", () => {
    expect(mapPrismaType("UnknownType")).toBe("string");
  });
});
