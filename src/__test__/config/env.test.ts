import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { env } from "../../config/env";
import * as configEntry from "../../config/defineConfig";
import { GassmaConfigEnvError } from "../../error/mainError";

describe("GassmaConfigEnvError", () => {
  it("should have a Prisma-style message", () => {
    const error = new GassmaConfigEnvError("DATABASE_URL");
    expect(error.message).toBe(
      "Cannot resolve environment variable: DATABASE_URL.",
    );
  });

  it("should have the class name as error.name", () => {
    const error = new GassmaConfigEnvError("DATABASE_URL");
    expect(error.name).toBe("GassmaConfigEnvError");
  });

  it("should be an instance of Error", () => {
    const error = new GassmaConfigEnvError("DATABASE_URL");
    expect(error).toBeInstanceOf(Error);
  });

  it("should be exported from the gassma/config entry", () => {
    expect(configEntry.GassmaConfigEnvError).toBe(GassmaConfigEnvError);
  });
});

describe("env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return the value of an existing environment variable", () => {
    process.env.TEST_URL = "https://example.com";
    expect(env("TEST_URL")).toBe("https://example.com");
  });

  it("should throw GassmaConfigEnvError if the environment variable is not set", () => {
    delete process.env.MISSING_VAR;
    expect(() => env("MISSING_VAR")).toThrow(GassmaConfigEnvError);
    expect(() => env("MISSING_VAR")).toThrow(
      "Cannot resolve environment variable: MISSING_VAR.",
    );
  });

  it("should throw GassmaConfigEnvError if the environment variable is empty string", () => {
    process.env.EMPTY_VAR = "";
    expect(() => env("EMPTY_VAR")).toThrow(GassmaConfigEnvError);
    expect(() => env("EMPTY_VAR")).toThrow(
      "Cannot resolve environment variable: EMPTY_VAR.",
    );
  });
});
