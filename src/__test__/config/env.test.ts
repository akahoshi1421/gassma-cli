import { env } from "../../config/env";

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

  it("should throw if the environment variable is not set", () => {
    delete process.env.MISSING_VAR;
    expect(() => env("MISSING_VAR")).toThrow(
      'Environment variable "MISSING_VAR" is not set',
    );
  });

  it("should throw if the environment variable is empty string", () => {
    process.env.EMPTY_VAR = "";
    expect(() => env("EMPTY_VAR")).toThrow(
      'Environment variable "EMPTY_VAR" is not set',
    );
  });
});
