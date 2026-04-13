export interface ChunkOptions {
  maxChunkSize: number;
  overlap: number;
}

export interface TextChunk {
  content: string;
  headings: string[];
  index: number;
}

// Markdown heading pattern: captures level (# count) and heading text
const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/m;

interface Section {
  content: string;
  headings: string[];
}

/**
 * Parses raw text into sections split on markdown headings.
 * Each section carries the heading hierarchy active at that point.
 */
function parseSections(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];

  // Current heading hierarchy indexed by heading level (1–6)
  const currentHeadings: (string | null)[] = new Array(7).fill(null);
  let currentLines: string[] = [];

  const flushSection = (): void => {
    const content = currentLines.join("\n").trim();
    if (content.length === 0) return;
    const headings = currentHeadings.filter((h): h is string => h !== null);
    sections.push({ content, headings });
  };

  for (const line of lines) {
    const match = HEADING_PATTERN.exec(line);
    if (match) {
      flushSection();
      currentLines = [];

      const level = match[1].length;
      const title = match[2].trim();

      // Update hierarchy: set this level, clear all deeper levels
      currentHeadings[level] = title;
      for (let i = level + 1; i <= 6; i++) {
        currentHeadings[i] = null;
      }
    }

    currentLines.push(line);
  }

  flushSection();
  return sections;
}

/**
 * Splits text into sentences on period/question mark/exclamation
 * followed by whitespace or end-of-string.
 */
function splitSentences(text: string): string[] {
  const raw = text.split(/(?<=[.?!])\s+/);
  return raw.filter((s) => s.trim().length > 0);
}

/**
 * Splits a section's content into overlapping chunks bounded by maxChunkSize.
 */
function splitSectionIntoChunks(
  content: string,
  headings: string[],
  options: ChunkOptions,
  startIndex: number
): TextChunk[] {
  const { maxChunkSize, overlap } = options;

  if (content.length <= maxChunkSize) {
    return [{ content, headings, index: startIndex }];
  }

  const sentences = splitSentences(content);
  const chunks: TextChunk[] = [];
  let current = "";
  let chunkIndex = startIndex;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const separator = current.length > 0 ? " " : "";
    const candidate = current + separator + sentence;

    if (candidate.length > maxChunkSize && current.length > 0) {
      chunks.push({ content: current.trim(), headings, index: chunkIndex++ });

      // Build overlap tail from the end of the current chunk
      const overlapText = buildOverlapText(current, overlap);
      current = overlapText.length > 0 ? overlapText + " " + sentence : sentence;
    } else {
      current = candidate;
    }
  }

  if (current.trim().length > 0) {
    chunks.push({ content: current.trim(), headings, index: chunkIndex });
  }

  return chunks;
}

/**
 * Returns a suffix of `text` of approximately `overlapSize` characters,
 * aligned to a word boundary (does not cut mid-word).
 */
function buildOverlapText(text: string, overlapSize: number): string {
  if (overlapSize <= 0 || text.length <= overlapSize) return "";
  const suffix = text.slice(-overlapSize);
  const firstSpace = suffix.indexOf(" ");
  return firstSpace === -1 ? suffix : suffix.slice(firstSpace + 1);
}

/**
 * Chunks plain or markdown text into semantically meaningful pieces.
 *
 * - Splits on markdown headings (# through ######), tracking hierarchy
 * - Sections smaller than maxChunkSize become a single chunk
 * - Larger sections are split by sentence with `overlap` character overlap
 * - Each chunk receives the active heading hierarchy at that point
 */
export function chunkText(text: string, options: ChunkOptions): TextChunk[] {
  const sections = parseSections(text);
  const allChunks: TextChunk[] = [];
  let globalIndex = 0;

  for (const section of sections) {
    const sectionChunks = splitSectionIntoChunks(
      section.content,
      section.headings,
      options,
      globalIndex
    );
    allChunks.push(...sectionChunks);
    globalIndex += sectionChunks.length;
  }

  // Re-assign sequential indexes over the final flat list
  return allChunks.map((chunk, i) => ({ ...chunk, index: i }));
}
