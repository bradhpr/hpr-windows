import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Builds a downloadable PDF from the on-screen proposal so it matches the print layout.
// The proposal is cloned into an off-screen letter-width container, rendered to a canvas,
// then sliced into Letter pages. A page is only cut at a spot that does not slice through:
//   - a line of text or an image,
//   - a paragraph / list item / text label (so sentences are never split across pages),
//   - an element marked data-pdf-block (a whole window or door entry, scope text, small cards),
// and header bands (data-pdf-keep-next) stay with what follows them, totals (data-pdf-keep-prev)
// with what precedes them, and data-pdf-break-before forces a new page. Anything taller than a page falls back to line-level cuts.

const PAGE_W = 612;          // Letter, pt
const PAGE_H = 792;
const MARGIN = 29;           // ~0.4in, similar to the browser print margins
const RENDER_W = 760;        // px width the proposal is laid out at
const SCALE = 2;             // canvas resolution multiplier

export async function downloadProposalPdf(source: HTMLElement, filename: string): Promise<void> {
  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${RENDER_W}px;background:#fff;`;
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.cssText = 'max-width:none;width:100%;margin:0;padding:0;';
  // Match print styling: flat cards, no shadows / rounded corners
  clone.querySelectorAll<HTMLElement>('*').forEach((el) => {
    el.style.boxShadow = 'none';
    el.style.borderRadius = '0';
  });
  clone.querySelectorAll<HTMLElement>('.no-print').forEach((el) => el.remove());
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    // Make sure images (logos, slider photo) are loaded before rendering
    await Promise.all(
      Array.from(clone.querySelectorAll('img')).map((img) =>
        img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = () => r(null); }),
      ),
    );

    const ptPerPx = (PAGE_W - MARGIN * 2) / RENDER_W;
    const pagePx = (PAGE_H - MARGIN * 2) / ptPerPx;   // content height per page, in layout px

    type Span = { top: number; bottom: number };
    const top = clone.getBoundingClientRect().top;
    const rel = (r: DOMRect): Span => ({ top: r.top - top, bottom: r.bottom - top });

    // Every rendered line of text and every image: a page may never be cut through one.
    const lines: Span[] = [];
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent || !n.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      Array.from(range.getClientRects()).forEach((r) => {
        if (r.height > 0) lines.push(rel(r));
      });
    }
    clone.querySelectorAll('img').forEach((img) => {
      const r = img.getBoundingClientRect();
      if (r.height > 0) lines.push(rel(r));
    });

    // Units that should stay together on one page when they fit on one.
    const blocks: Span[] = [];
    const addBlock = (s: Span) => {
      if (s.bottom - s.top > 0 && s.bottom - s.top <= pagePx) blocks.push(s);
    };
    // Paragraphs, list items, labels: any element that directly holds text, so a sentence is never split.
    clone.querySelectorAll<HTMLElement>('*').forEach((el) => {
      const hasOwnText = Array.from(el.childNodes).some((c) => c.nodeType === Node.TEXT_NODE && c.textContent?.trim());
      if (hasOwnText) addBlock(rel(el.getBoundingClientRect()));
    });
    // Explicit blocks (window / door entries, scope text, small cards)
    clone.querySelectorAll<HTMLElement>('[data-pdf-block]').forEach((el) => addBlock(rel(el.getBoundingClientRect())));
    // A list container stands in for its first / last entry when a sibling is tied to it
    const edgeOf = (el: Element | null, edge: 'first' | 'last'): Element | null => {
      if (el && el.hasAttribute('data-pdf-list')) return edge === 'first' ? el.firstElementChild : el.lastElementChild;
      return el;
    };
    clone.querySelectorAll<HTMLElement>('[data-pdf-keep-next]').forEach((el) => {
      const next = edgeOf(el.nextElementSibling, 'first');
      if (next) addBlock({ top: rel(el.getBoundingClientRect()).top, bottom: rel(next.getBoundingClientRect()).bottom });
    });
    clone.querySelectorAll<HTMLElement>('[data-pdf-keep-prev]').forEach((el) => {
      const prev = edgeOf(el.previousElementSibling, 'last');
      if (prev) addBlock({ top: rel(prev.getBoundingClientRect()).top, bottom: rel(el.getBoundingClientRect()).bottom });
    });

    // Moves a proposed cut line up until it no longer slices through any span, or null if that
    // would shrink the page below min.
    function findCut(y: number, min: number, avoid: Span[]): number | null {
      let cut = y;
      for (let i = 0; i < 5000; i++) {
        const hit = avoid.find((sp) => sp.top < cut - 1 && sp.bottom > cut + 1);
        if (!hit) return cut;
        cut = hit.top - 1;
        if (cut <= min) return null;
      }
      return null;
    }
    // Elements marked data-pdf-break-before always start a new page.
    const breaks = Array.from(clone.querySelectorAll<HTMLElement>('[data-pdf-break-before]')).map((el) => rel(el.getBoundingClientRect()).top);

    // Prefer keeping whole units together; otherwise at least never cut through a line of text.
    function safeCut(y: number, min: number): number {
      return findCut(y, min, [...lines, ...blocks]) ?? findCut(y, min, lines) ?? y;
    }

    const canvas = await html2canvas(clone, { scale: SCALE, backgroundColor: '#ffffff', useCORS: true, logging: false });
    const totalPx = clone.getBoundingClientRect().height;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    let start = 0;
    let page = 0;
    while (start < totalPx - 1) {
      const limit = start + pagePx;
      const forced = breaks.find((b) => b > start + 1 && b < limit);
      const end = forced ?? (limit >= totalPx ? totalPx : safeCut(limit, start + pagePx * 0.25));

      const sy = Math.round(start * SCALE);
      const sh = Math.max(1, Math.min(canvas.height - sy, Math.round((end - start) * SCALE)));
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sh;
      slice.getContext('2d')!.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

      if (page > 0) doc.addPage();
      doc.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', MARGIN, MARGIN, PAGE_W - MARGIN * 2, (sh / SCALE) * ptPerPx);
      page++;
      start = end;
    }

    doc.save(filename);
  } finally {
    document.body.removeChild(host);
  }
}
