import { extractSpreadsheetId } from "../../config/extractSpreadsheetId";

describe("extractSpreadsheetId", () => {
  it("should extract id from full URL", () => {
    const url =
      "https://docs.google.com/spreadsheets/d/1CiagfKt_56T3j0EcGXm45pK9dmXH-r1FsHc3mjmtBpI/edit";
    expect(extractSpreadsheetId(url)).toBe(
      "1CiagfKt_56T3j0EcGXm45pK9dmXH-r1FsHc3mjmtBpI",
    );
  });

  it("should extract id from URL without trailing path", () => {
    const url =
      "https://docs.google.com/spreadsheets/d/14yKHbIKdclxxYKkpvB9V04Ovpe8V7I_nHBnfbPmOqyU";
    expect(extractSpreadsheetId(url)).toBe(
      "14yKHbIKdclxxYKkpvB9V04Ovpe8V7I_nHBnfbPmOqyU",
    );
  });

  it("should extract id from URL with trailing slash", () => {
    const url =
      "https://docs.google.com/spreadsheets/d/1CiagfKt_56T3j0EcGXm45pK9dmXH-r1FsHc3mjmtBpI/";
    expect(extractSpreadsheetId(url)).toBe(
      "1CiagfKt_56T3j0EcGXm45pK9dmXH-r1FsHc3mjmtBpI",
    );
  });

  it("should return the value as-is if it is already just an id", () => {
    const id = "1CiagfKt_56T3j0EcGXm45pK9dmXH-r1FsHc3mjmtBpI";
    expect(extractSpreadsheetId(id)).toBe(id);
  });

  it("should return undefined for undefined input", () => {
    expect(extractSpreadsheetId(undefined)).toBeUndefined();
  });
});
