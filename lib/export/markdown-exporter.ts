import type { NotebookRecord } from "@/lib/core/types"

// ============================================================
// Notebook Markdown Export
// ============================================================

/**
 * Formats a notebook and its records as a Markdown document.
 *
 * Structure:
 *   # Notebook Name
 *
 *   ## Record Title
 *
 *   Record content
 *
 *   ---
 *
 *   (repeated for each record)
 */
export function exportNotebookAsMarkdown(
  notebook: { readonly name: string; readonly description: string },
  records: readonly NotebookRecord[],
): string {
  const lines: string[] = [`# ${notebook.name}`]

  if (notebook.description.length > 0) {
    lines.push("", notebook.description)
  }

  for (const record of records) {
    lines.push("", `## ${record.title}`, "", record.content, "", "---")
  }

  return lines.join("\n")
}

// ============================================================
// Generic Content Markdown Export
// ============================================================

/**
 * Wraps arbitrary content in Markdown with an optional H1 title.
 *
 * With title:    # Title\n\ncontent
 * Without title: content
 */
export function exportContentAsMarkdown(content: string, title?: string): string {
  if (title === undefined || title.length === 0) {
    return content
  }

  return `# ${title}\n\n${content}`
}
