import { describe, it, expect } from "vitest";
import { parseDocument } from "@/lib/core/knowledge/parser";

describe("parseDocument", () => {
  it("parses plain text content", async () => {
    const content = new Blob(["Hello world\n\nThis is a test."], { type: "text/plain" });
    const result = await parseDocument(content, "test.txt", "text/plain");
    expect(result.text).toBe("Hello world\n\nThis is a test.");
    expect(result.metadata.name).toBe("test.txt");
  });

  it("parses markdown content preserving structure", async () => {
    const md = "# Title\n\nParagraph one.\n\n## Section\n\nParagraph two.";
    const content = new Blob([md], { type: "text/markdown" });
    const result = await parseDocument(content, "doc.md", "text/markdown");
    expect(result.text).toContain("# Title");
    expect(result.text).toContain("## Section");
  });

  it("throws on unsupported mime type", async () => {
    const content = new Blob(["data"], { type: "application/zip" });
    await expect(parseDocument(content, "file.zip", "application/zip")).rejects.toThrow("Unsupported");
  });
});
