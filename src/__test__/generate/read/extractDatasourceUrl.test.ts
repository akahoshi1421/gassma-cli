import { extractDatasourceUrl } from "../../../generate/read/extractDatasourceUrl";

describe("extractDatasourceUrl", () => {
  it("should extract url from datasource block", () => {
    const schema = `
datasource db {
  provider = "google-spreadsheet"
  url      = "https://docs.google.com/spreadsheets/d/1CiagfKt_56T3j0EcGXm45pK9dmXH-r1FsHc3mjmtBpI"
}

model Item {
  id   Int    @id
  name String
}`;
    expect(extractDatasourceUrl(schema)).toBe(
      "https://docs.google.com/spreadsheets/d/1CiagfKt_56T3j0EcGXm45pK9dmXH-r1FsHc3mjmtBpI",
    );
  });

  it("should return null when no datasource block exists", () => {
    const schema = `
model Item {
  id   Int    @id
  name String
}`;
    expect(extractDatasourceUrl(schema)).toBeNull();
  });

  it("should return null when datasource has no url", () => {
    const schema = `
datasource db {
  provider = "google-spreadsheet"
}

model Item {
  id Int @id
}`;
    expect(extractDatasourceUrl(schema)).toBeNull();
  });
});
