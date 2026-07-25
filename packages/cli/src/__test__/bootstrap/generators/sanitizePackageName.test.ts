import { describe, expect, it } from "vitest";
import { sanitizePackageName } from "../../../bootstrap/generators/sanitizePackageName";

describe("sanitizePackageName", () => {
  it("should lowercase the name", () => {
    expect(sanitizePackageName("MyProject")).toBe("myproject");
  });

  it("should replace spaces with hyphens", () => {
    expect(sanitizePackageName("My GAS App")).toBe("my-gas-app");
  });

  it("should keep an already valid name unchanged", () => {
    expect(sanitizePackageName("gassma-des")).toBe("gassma-des");
  });

  it("should keep underscores and dots inside the name", () => {
    expect(sanitizePackageName("Hello_World.js")).toBe("hello_world.js");
  });

  it("should remove invalid characters", () => {
    expect(sanitizePackageName("a!!b")).toBe("ab");
  });

  it("should collapse consecutive whitespace into one hyphen", () => {
    expect(sanitizePackageName("a   b")).toBe("a-b");
  });

  it("should collapse consecutive hyphens", () => {
    expect(sanitizePackageName("a - b")).toBe("a-b");
  });

  it("should strip leading dots and underscores", () => {
    expect(sanitizePackageName(".hidden")).toBe("hidden");
    expect(sanitizePackageName("_private")).toBe("private");
  });

  it("should strip leading and trailing hyphens", () => {
    expect(sanitizePackageName("-abc-")).toBe("abc");
  });

  it("should fall back when nothing valid remains", () => {
    expect(sanitizePackageName("テスト")).toBe("gassma-project");
    expect(sanitizePackageName("")).toBe("gassma-project");
    expect(sanitizePackageName("   ")).toBe("gassma-project");
  });

  it("should truncate names longer than 214 characters", () => {
    const longName = "a".repeat(300);
    expect(sanitizePackageName(longName)).toBe("a".repeat(214));
  });
});
