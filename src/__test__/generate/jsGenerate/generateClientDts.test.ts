import { generateClientDts } from "../../../generate/jsGenerate/generateClientDts";

describe("generateClientDts", () => {
  it("should export GassmaClient class", () => {
    const result = generateClientDts("Hoge");

    expect(result).toContain("export declare class GassmaClient");
  });

  it("should have constructor with optional GassmaClientOptions", () => {
    const result = generateClientDts("Hoge");

    expect(result).toContain("options?: GassmaHogeClientOptions");
  });

  it("should have readonly sheets property with schema-specific type", () => {
    const result = generateClientDts("Hoge");

    expect(result).toContain("readonly sheets: GassmaHogeSheet");
  });

  it("should work with different schema names", () => {
    const result = generateClientDts("Fuga");

    expect(result).toContain("export declare class GassmaClient");
    expect(result).toContain("options?: GassmaFugaClientOptions");
    expect(result).toContain("readonly sheets: GassmaFugaSheet");
  });

  it("should export enum constants and types", () => {
    const enums = {
      Role: [
        { name: "ADMIN", value: "ADMIN" },
        { name: "USER", value: "USER" },
        { name: "MODERATOR", value: "MODERATOR" },
      ],
    };
    const result = generateClientDts("Test", enums);

    expect(result).toContain("export declare const Role: {");
    expect(result).toContain('  readonly ADMIN: "ADMIN";');
    expect(result).toContain('  readonly USER: "USER";');
    expect(result).toContain('  readonly MODERATOR: "MODERATOR";');
    expect(result).toContain(
      "export type Role = (typeof Role)[keyof typeof Role];",
    );
  });

  it("should export enum constants with @map values", () => {
    const enums = {
      Role: [
        { name: "admin", value: "ADMIN" },
        { name: "user", value: "USER" },
        { name: "moderator", value: "MODERATOR" },
      ],
    };
    const result = generateClientDts("Test", enums);

    expect(result).toContain("export declare const Role: {");
    expect(result).toContain('  readonly admin: "ADMIN";');
    expect(result).toContain('  readonly user: "USER";');
    expect(result).toContain('  readonly moderator: "MODERATOR";');
    expect(result).toContain(
      "export type Role = (typeof Role)[keyof typeof Role];",
    );
  });

  it("should export multiple enums", () => {
    const enums = {
      Role: [
        { name: "ADMIN", value: "ADMIN" },
        { name: "USER", value: "USER" },
      ],
      Status: [
        { name: "ACTIVE", value: "ACTIVE" },
        { name: "INACTIVE", value: "INACTIVE" },
      ],
    };
    const result = generateClientDts("Test", enums);

    expect(result).toContain("export declare const Role");
    expect(result).toContain("export type Role");
    expect(result).toContain("export declare const Status");
    expect(result).toContain("export type Status");
  });

  it("should not export enums when none exist", () => {
    const result = generateClientDts("Test", {});

    expect(result).not.toContain("export declare const");
    expect(result).not.toContain("export type");
  });
});
