import { getOneGassmaUpsertData } from "../../../generate/typeGenerate/gassmaUpsertData/oneGassmaUpsertData";

describe("getOneGassmaUpsertData", () => {
  it("should generate UpsertData type", () => {
    const result = getOneGassmaUpsertData("", "User");

    expect(result).toContain("declare type GassmaUserUpsertData");
  });

  it("should include where property", () => {
    const result = getOneGassmaUpsertData("", "User");

    expect(result).toContain("where: GassmaUserWhereUse;");
  });

  it("should include data (create) as required fields", () => {
    const result = getOneGassmaUpsertData("", "User");

    expect(result).toContain("data: GassmaUserUse;");
  });

  it("should include update with Partial NumberOperation", () => {
    const result = getOneGassmaUpsertData("", "User");

    expect(result).toContain("Partial<");
    expect(result).toContain(
      "[K in keyof GassmaUserUse]: GassmaUserUse[K] | Gassma.NumberOperation",
    );
  });
});
