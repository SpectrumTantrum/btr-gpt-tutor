export interface ParsedDocument {
  readonly text: string;
  readonly metadata: {
    readonly name: string;
    readonly mimeType: string;
    readonly pageCount?: number;
  };
}

const SUPPORTED_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/pdf",
]);

export async function parseDocument(
  content: Blob,
  name: string,
  mimeType: string,
): Promise<ParsedDocument> {
  const normalizedType = mimeType.toLowerCase();

  if (!SUPPORTED_TYPES.has(normalizedType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  switch (normalizedType) {
    case "text/plain":
    case "text/markdown":
      return {
        text: await content.text(),
        metadata: { name, mimeType: normalizedType },
      };

    case "application/pdf": {
      const { extractText } = await import("unpdf");
      const buffer = await content.arrayBuffer();
      const { text, totalPages } = await extractText(new Uint8Array(buffer));
      return {
        text: Array.isArray(text) ? text.join("\n") : text,
        metadata: { name, mimeType: "application/pdf", pageCount: totalPages },
      };
    }

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
