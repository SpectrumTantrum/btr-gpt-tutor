import type { Classroom, Scene, SlideElement } from "@/lib/core/types"

// ============================================================
// Helpers
// ============================================================

const ESCAPE_MAP: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch)
}

function renderElement(el: SlideElement): string {
  const style = [
    `position:absolute`,
    `left:${el.x}px`,
    `top:${el.y}px`,
    `width:${el.width}px`,
    `height:${el.height}px`,
  ].join(";")

  if (el.type === "image") {
    return `<img src="${escapeHtml(el.content)}" style="${style};object-fit:contain" alt="" />`
  }

  return `<div style="${style}">${escapeHtml(el.content)}</div>`
}

function renderScene(scene: Scene, index: number, total: number): string {
  const isFirst = index === 0
  const displayStyle = isFirst ? "block" : "none"
  const elements = (scene.slide?.elements ?? []).map(renderElement).join("\n        ")

  const prevBtn =
    index > 0
      ? `<button onclick="navigate(${index - 1})">&#8592; Prev</button>`
      : `<button disabled>&#8592; Prev</button>`

  const nextBtn =
    index < total - 1
      ? `<button onclick="navigate(${index + 1})">Next &#8594;</button>`
      : `<button disabled>Next &#8594;</button>`

  return `
  <section id="slide-${index}" class="slide" style="display:${displayStyle}">
    <h2 class="slide-title">${escapeHtml(scene.title)}</h2>
    <div class="slide-canvas">
        ${elements}
    </div>
    <nav class="slide-nav">
      <span class="slide-counter">${index + 1} / ${total}</span>
      ${prevBtn}
      ${nextBtn}
    </nav>
  </section>`
}

// ============================================================
// Builder
// ============================================================

/**
 * Generates a self-contained HTML page from a Classroom.
 * Each scene with slide data becomes a navigable section.
 * Navigation is handled by embedded vanilla JS (prev/next).
 */
export function buildHtmlExport(classroom: Classroom): string {
  const scenes = classroom.scenes.filter((s) => s.slide !== undefined)
  const total = scenes.length

  const sectionsHtml = scenes
    .map((scene, i) => renderScene(scene, i, total))
    .join("\n")

  const noSlidesHtml =
    total === 0
      ? `<p class="empty-notice">No slides in this classroom.</p>`
      : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(classroom.title)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #222; }
  .classroom-title { text-align: center; padding: 1.5rem; font-size: 1.75rem; }
  .slide { max-width: 900px; margin: 2rem auto; background: #fff; border-radius: 8px;
           box-shadow: 0 2px 12px rgba(0,0,0,.1); padding: 2rem; }
  .slide-title { font-size: 1.4rem; margin-bottom: 1rem; border-bottom: 2px solid #e5e7eb;
                 padding-bottom: .5rem; }
  .slide-canvas { position: relative; min-height: 200px; border: 1px solid #e5e7eb;
                  border-radius: 4px; overflow: hidden; margin-bottom: 1rem; }
  .slide-nav { display: flex; align-items: center; gap: .75rem; }
  .slide-nav button { padding: .4rem .9rem; border: 1px solid #d1d5db; border-radius: 4px;
                      background: #fff; cursor: pointer; font-size: .9rem; }
  .slide-nav button:hover:not(:disabled) { background: #f3f4f6; }
  .slide-nav button:disabled { opacity: .4; cursor: default; }
  .slide-counter { margin-left: auto; font-size: .85rem; color: #6b7280; }
  .empty-notice { text-align: center; padding: 3rem; color: #9ca3af; }
</style>
</head>
<body>
<h1 class="classroom-title">${escapeHtml(classroom.title)}</h1>
${noSlidesHtml}
${sectionsHtml}
<script>
  var currentIndex = 0;
  function navigate(index) {
    var slides = document.querySelectorAll('.slide');
    if (index < 0 || index >= slides.length) return;
    slides[currentIndex].style.display = 'none';
    slides[index].style.display = 'block';
    currentIndex = index;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>
</body>
</html>`
}
