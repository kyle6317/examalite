/**
 * docx-parser.js
 * Module chuyển DOCX → HTML (SuperDoc) → exam.json
 * Không phụ thuộc vào UI, có thể import vào bất kỳ file nào.
 *
 * Export:
 *   convertDocxToHtml(file)       → Promise<{ html, mediaMap }>
 *   parseHtmlToExam(html)         → examJson object
 *   parseDocx(file)               → Promise<examJson>  (all-in-one)
 */

// ─── SuperDoc loader ───────────────────────────────────────────────────────────
let _SuperDoc = null;

async function loadSuperDoc() {
  if (_SuperDoc) return _SuperDoc;
  const mod = await import('https://esm.sh/superdoc');
  _SuperDoc = mod.SuperDoc;
  return _SuperDoc;
}

// ─── Hidden render container ──────────────────────────────────────────────────
function getOrCreateContainer() {
  let el = document.getElementById('__docx_parser_container__');
  if (!el) {
    el = document.createElement('div');
    el.id = '__docx_parser_container__';
    el.style.cssText = 'position:absolute;left:-9999px;width:800px;height:1000px;overflow:hidden;';
    document.body.appendChild(el);
  }
  el.innerHTML = '';
  return el;
}

// ─── Step 1: DOCX → HTML via SuperDoc ────────────────────────────────────────
export async function convertDocxToHtml(file) {
  const SuperDoc = await loadSuperDoc();
  const container = getOrCreateContainer();

  return new Promise((resolve, reject) => {
    let instance = null;
    let settled = false;

    function finish(html) {
      if (settled) return;
      settled = true;
      try { instance?.destroy?.(); } catch (_) {}
      // Extract media (base64 images) from html
      const mediaMap = extractMedia(html);
      resolve({ html, mediaMap });
    }

    instance = new SuperDoc({
      selector: `#${container.id}`,
      document: file,
      documentMode: 'viewing',
    });

    // Poll for ready
    const poll = setInterval(() => {
      if (instance?.activeEditor) {
        clearInterval(poll);
        setTimeout(() => {
          try {
            const html = instance.activeEditor.getHTML();
            finish(html);
          } catch (e) {
            reject(e);
          }
        }, 500);
      }
    }, 100);

    // Fallback timeout
    setTimeout(() => {
      clearInterval(poll);
      if (!settled) reject(new Error('SuperDoc timeout'));
    }, 30000);

    try {
      instance.on('ready', () => {
        clearInterval(poll);
        setTimeout(() => {
          try { finish(instance.activeEditor.getHTML()); } catch (e) { reject(e); }
        }, 300);
      });
    } catch (_) {}
  });
}

// ─── Media extraction ─────────────────────────────────────────────────────────
function extractMedia(html) {
  const map = new Map(); // filename → objectURL
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let counter = 1;
  doc.querySelectorAll('img[src^="data:"]').forEach(img => {
    const src = img.getAttribute('src');
    const mimeMatch = src.match(/^data:([^;]+);base64,/);
    if (!mimeMatch) return;
    const mime = mimeMatch[1];
    const ext = mime.split('/')[1]?.split(';')[0] || 'png';
    const name = `img_${String(counter++).padStart(3, '0')}.${ext}`;
    // Convert base64 → Blob → objectURL
    try {
      const b64 = src.split(',')[1];
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      map.set(name, { url, blob, mime });
    } catch (_) {}
  });
  return map;
}

// ─── Step 2: HTML → exam.json ─────────────────────────────────────────────────
export function parseHtmlToExam(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Replace base64 img src with placeholder name for later reference
  let imgCounter = 1;
  doc.querySelectorAll('img[src^="data:"]').forEach(img => {
    const mimeMatch = (img.getAttribute('src') || '').match(/^data:([^;]+);base64,/);
    const ext = mimeMatch ? (mimeMatch[1].split('/')[1] || 'png') : 'png';
    const name = `img_${String(imgCounter++).padStart(3, '0')}.${ext}`;
    img.setAttribute('data-media-name', name);
    img.removeAttribute('src');
  });

  const blocks = Array.from(doc.body.querySelectorAll('p[data-sd-block-id]'));

  // ── Detect question start ──────────────────────────────────────────────────
  // "Câu 1.", "Câu 1:", "Câu1.", numbered like "1.", "1)"
  const Q_START = /^\s*(câu\s*\d+[:.)]?\s*|\d+[.)]\s*)/i;

  const questionStarts = [];
  blocks.forEach((block, idx) => {
    const text = block.textContent.trim();
    if (Q_START.test(text)) questionStarts.push(idx);
  });

  const groups = [];
  let gCounter = 1;
  let qCounter = 1;

  for (let qi = 0; qi < questionStarts.length; qi++) {
    const start = questionStarts[qi];
    const end = qi + 1 < questionStarts.length ? questionStarts[qi + 1] : blocks.length;
    const qBlocks = blocks.slice(start, end);

    const result = parseQuestionBlocks(qBlocks, qCounter, gCounter);
    if (!result) continue; // skip unrecognized (tự luận, etc.)

    qCounter += result.questions.length;
    gCounter++;
    groups.push(result.group);
  }

  return { groups };
}

// ─── Parse a slice of blocks into a group ────────────────────────────────────
function parseQuestionBlocks(blocks, qCounterStart, gIdx) {
  // ── Detect choice layout ───────────────────────────────────────────────────
  // Layout A: list items — <p data-marker-type="A." data-list-numbering-type="upperLetter">
  // Layout B: inline — choices embedded in text within same <p>
  // Layout C: separate paragraphs starting with "A.", "B.", etc. (plain text)

  const layout = detectLayout(blocks);

  if (layout === 'single_choice') return parseSingleChoice(blocks, qCounterStart, gIdx);
  if (layout === 'true_false_group') return parseTrueFalseGroup(blocks, qCounterStart, gIdx);

  return null; // skip
}

// ─── Layout detection ─────────────────────────────────────────────────────────
function detectLayout(blocks) {
  // Check for list-based ABCD
  const listABCD = blocks.filter(b =>
    b.hasAttribute('data-marker-type') &&
    /^[A-D]\.$/.test((b.getAttribute('data-marker-type') || '').trim()) &&
    b.getAttribute('data-list-numbering-type') === 'upperLetter'
  );

  // Check for list-based abcd (true_false)
  const listAbcd = blocks.filter(b =>
    b.hasAttribute('data-marker-type') &&
    /^[a-d][.)]$/.test((b.getAttribute('data-marker-type') || '').trim())
  );

  // Check for paragraph-based ABCD (text starts with A. B. C. D.)
  const paraABCD = blocks.filter(b => /^\s*[A-D]\s*[.)]\s*\S/.test(b.textContent));

  // Check for paragraph-based abcd
  const paraAbcd = blocks.filter(b => /^\s*[a-d]\s*[.)]\s*\S/.test(b.textContent));

  // Check for inline ABCD (all in one paragraph)
  const inlineABCD = blocks.some(b => {
    const t = b.textContent;
    return /A\s*[.)]/i.test(t) && /B\s*[.)]/i.test(t) && /C\s*[.)]/i.test(t) && /D\s*[.)]/i.test(t);
  });

  const hasUpperABCD = listABCD.length >= 2 || paraABCD.length >= 2 || inlineABCD;
  const hasLowerAbcd = listAbcd.length >= 2 || paraAbcd.length >= 2;

  if (hasLowerAbcd) return 'true_false_group';
  if (hasUpperABCD) return 'single_choice';
  return null;
}

// ─── Parse single_choice question ────────────────────────────────────────────
function parseSingleChoice(blocks, qIdx, gIdx) {
  const choices = extractChoicesABCD(blocks);
  if (choices.length < 2) return null;

  const promptBlocks = getPromptBlocks(blocks, choices);
  const prompt = extractText(promptBlocks).replace(/^\s*(câu\s*\d+[:.)]?\s*|\d+[.)]\s*)/i, '').trim();
  const promptMedia = extractMediaRefs(promptBlocks);

  // Detect correct answer
  const answer = detectCorrectChoice(choices);

  const choiceObjs = choices.map((c, i) => ({
    id: `c${i + 1}`,
    text: c.text.trim(),
    media: c.media,
  }));

  // Map letter (A/B/C/D) → choice id
  const letterToId = {};
  choices.forEach((c, i) => { letterToId[c.letter] = `c${i + 1}`; });

  const question = {
    id: `q${qIdx}`,
    type: 'single_choice',
    prompt,
    prompt_media: promptMedia,
    choices: choiceObjs,
    answer: answer ? (letterToId[answer] || '') : '',
  };

  return {
    group: {
      id: `g${gIdx}`,
      label: '',
      context: '',
      context_media: [],
      questions: [question],
    },
    questions: [question],
  };
}

// ─── Parse true_false_group ───────────────────────────────────────────────────
function parseTrueFalseGroup(blocks, qIdx, gIdx) {
  const items = extractChoicesAbcd(blocks);
  if (items.length < 2) return null;

  const promptBlocks = getPromptBlocksLower(blocks, items);
  const prompt = extractText(promptBlocks).replace(/^\s*(câu\s*\d+[:.)]?\s*|\d+[.)]\s*)/i, '').trim();
  const promptMedia = extractMediaRefs(promptBlocks);

  const questions = items.map((item, i) => {
    const answer = detectTrueFalseAnswer(item);
    // Strip answer marker from text
    const cleanText = stripTrueFalseMarker(item.text);
    return {
      id: `q${qIdx + i}`,
      type: 'true_false',
      prompt: cleanText.trim(),
      prompt_media: item.media,
      choices: [
        { id: 'true', text: 'Đúng', media: [] },
        { id: 'false', text: 'Sai', media: [] },
      ],
      answer: answer !== null ? String(answer) : '',
    };
  });

  return {
    group: {
      id: `g${gIdx}`,
      label: '',
      context: prompt,
      context_media: promptMedia,
      questions,
    },
    questions,
  };
}

// ─── Extract ABCD choices (all 3 layouts) ────────────────────────────────────
function extractChoicesABCD(blocks) {
  // Layout 1: list items
  const listItems = blocks.filter(b =>
    b.hasAttribute('data-marker-type') &&
    /^[A-D]\.$/.test((b.getAttribute('data-marker-type') || '').trim()) &&
    b.getAttribute('data-list-numbering-type') === 'upperLetter'
  );
  if (listItems.length >= 2) {
    return listItems.map(b => ({
      letter: b.getAttribute('data-marker-type').replace('.', '').trim(),
      text: b.textContent.trim(),
      media: extractMediaRefs([b]),
      formatting: getFormatting(b),
      block: b,
    }));
  }

  // Layout 2: separate paragraphs starting with A. B. C. D.
  const paraItems = blocks.filter(b => /^\s*[A-D]\s*[.)]\s*\S/.test(b.textContent));
  if (paraItems.length >= 2) {
    return paraItems.map(b => {
      const m = b.textContent.match(/^\s*([A-D])\s*[.)]\s*(.*)/s);
      return {
        letter: m ? m[1] : '?',
        text: m ? m[2].trim() : b.textContent.trim(),
        media: extractMediaRefs([b]),
        formatting: getFormatting(b),
        block: b,
      };
    });
  }

  // Layout 3: inline — split from the paragraph
  const inlineBlock = blocks.find(b => {
    const t = b.textContent;
    return /A\s*[.)]/i.test(t) && /B\s*[.)]/i.test(t);
  });
  if (inlineBlock) {
    return parseInlineChoices(inlineBlock);
  }

  return [];
}

// ─── Parse inline choices (A. text B. text ...) ──────────────────────────────
function parseInlineChoices(block) {
  const runs = Array.from(block.querySelectorAll('[data-run]'));
  const fullText = block.textContent;

  // Split by A. B. C. D. markers
  const parts = [];
  const regex = /([A-D])\s*[.)]\s*/g;
  let match;
  const positions = [];
  while ((match = regex.exec(fullText)) !== null) {
    positions.push({ letter: match[1], index: match.index, end: match.index + match[0].length });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].end;
    const end = i + 1 < positions.length ? positions[i + 1].index : fullText.length;
    const text = fullText.slice(start, end).trim();
    // For inline, collect formatting from relevant runs
    parts.push({
      letter: positions[i].letter,
      text,
      media: [],
      formatting: getFormattingFromText(runs, positions[i].index, end),
      block,
    });
  }
  return parts;
}

// ─── Extract abcd choices (true_false) ────────────────────────────────────────
function extractChoicesAbcd(blocks) {
  // Layout 1: list items
  const listItems = blocks.filter(b =>
    b.hasAttribute('data-marker-type') &&
    /^[a-d][.)]$/.test((b.getAttribute('data-marker-type') || '').trim())
  );
  if (listItems.length >= 2) {
    return listItems.map(b => ({
      letter: b.getAttribute('data-marker-type')[0],
      text: b.textContent.trim(),
      media: extractMediaRefs([b]),
      formatting: getFormatting(b),
      block: b,
    }));
  }

  // Layout 2: separate paragraphs starting with a. b. c. d.
  const paraItems = blocks.filter(b => /^\s*[a-d]\s*[.)]\s*\S/.test(b.textContent));
  if (paraItems.length >= 2) {
    return paraItems.map(b => {
      const m = b.textContent.match(/^\s*([a-d])\s*[.)]\s*(.*)/s);
      return {
        letter: m ? m[1] : '?',
        text: m ? m[2].trim() : b.textContent.trim(),
        media: extractMediaRefs([b]),
        formatting: getFormatting(b),
        block: b,
      };
    });
  }

  return [];
}

// ─── Identify prompt blocks ────────────────────────────────────────────────────
function getPromptBlocks(blocks, choices) {
  if (!choices.length) return blocks;
  const firstChoiceBlock = choices[0].block;
  if (!firstChoiceBlock) return blocks;
  const idx = blocks.indexOf(firstChoiceBlock);
  return idx > 0 ? blocks.slice(0, idx) : [blocks[0]];
}

function getPromptBlocksLower(blocks, items) {
  if (!items.length) return blocks;
  const firstBlock = items[0].block;
  if (!firstBlock) return blocks;
  const idx = blocks.indexOf(firstBlock);
  return idx > 0 ? blocks.slice(0, idx) : [blocks[0]];
}

// ─── Extract plain text from block list ───────────────────────────────────────
function extractText(blocks) {
  return blocks.map(b => b.textContent).join(' ').replace(/\s+/g, ' ').trim();
}

// ─── Extract media refs from blocks ───────────────────────────────────────────
function extractMediaRefs(blocks) {
  const refs = [];
  blocks.forEach(b => {
    b.querySelectorAll('img[data-media-name]').forEach(img => {
      refs.push({
        type: 'image',
        src: img.getAttribute('data-media-name'),
        alt: img.getAttribute('alt') || '',
      });
    });
  });
  return refs;
}

// ─── Get formatting signals from a block ─────────────────────────────────────
function getFormatting(block) {
  const runs = Array.from(block.querySelectorAll('[data-run]'));
  const spans = Array.from(block.querySelectorAll('span[style]'));

  let bold = false, italic = false, underline = false;
  let color = null, highlight = null;

  // Check for <strong>
  if (block.querySelector('strong')) bold = true;

  runs.forEach(r => {
    if (r.querySelector('strong') || r.closest('strong')) bold = true;
    if (r.querySelector('em') || r.closest('em')) italic = true;
    if (r.querySelector('u') || r.closest('u')) underline = true;
  });

  spans.forEach(s => {
    const style = s.getAttribute('style') || '';
    if (/font-weight\s*:\s*(bold|[6-9]\d{2})/.test(style)) bold = true;
    if (/font-style\s*:\s*italic/.test(style)) italic = true;
    if (/text-decoration[^;]*underline/.test(style)) underline = true;
    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/);
    if (colorMatch) color = colorMatch[1].trim();
  });

  // Highlight via <mark>
  const mark = block.querySelector('mark[data-color]');
  if (mark) {
    const bg = mark.getAttribute('data-color') || mark.style?.backgroundColor;
    if (bg && bg !== '#ffffff' && bg !== 'rgb(255, 255, 255)') highlight = bg;
  }

  return { bold, italic, underline, color, highlight };
}

// ─── Get formatting from inline run positions ─────────────────────────────────
function getFormattingFromText(runs, startIdx, endIdx) {
  // Approximate: return formatting of runs near position
  // For inline layout, collect formatting from all runs
  let bold = false, italic = false, underline = false, color = null, highlight = null;
  runs.forEach(r => {
    if (r.querySelector('strong') || r.closest('strong')) bold = true;
    const style = r.getAttribute('style') || '';
    if (/font-weight\s*:\s*(bold|[6-9]\d{2})/.test(style)) bold = true;
  });
  return { bold, italic, underline, color, highlight };
}

// ─── Detect correct choice from ABCD ─────────────────────────────────────────
/*
  Strategy:
  1. Score each choice's formatting signals
  2. The "outlier" (different from majority) is the answer
  3. Signals: bold, italic, underline, non-black color, highlight
*/
function detectCorrectChoice(choices) {
  if (choices.length < 2) return null;

  // Count formatting presence
  const signals = choices.map(c => {
    const f = c.formatting;
    let score = 0;
    if (f.bold) score++;
    if (f.italic) score++;
    if (f.underline) score++;
    if (f.highlight && f.highlight !== 'transparent') score++;
    if (f.color && !isNeutralColor(f.color)) score++;
    return { letter: c.letter, score, f };
  });

  const totalBold = signals.filter(s => s.f.bold).length;
  const totalItalic = signals.filter(s => s.f.italic).length;
  const totalUnderline = signals.filter(s => s.f.underline).length;
  const totalColored = signals.filter(s => s.f.color && !isNeutralColor(s.f.color)).length;
  const totalHighlight = signals.filter(s => s.f.highlight && s.f.highlight !== 'transparent').length;

  const n = choices.length;

  // Pattern: exactly 1 has a signal not shared by others → it's the answer
  for (const s of signals) {
    const uniqueSignals = [];
    if (s.f.bold && totalBold === 1) uniqueSignals.push('bold');
    if (s.f.italic && totalItalic === 1) uniqueSignals.push('italic');
    if (s.f.underline && totalUnderline === 1) uniqueSignals.push('underline');
    if (s.f.color && !isNeutralColor(s.f.color) && totalColored === 1) uniqueSignals.push('color');
    if (s.f.highlight && s.f.highlight !== 'transparent' && totalHighlight === 1) uniqueSignals.push('highlight');
    if (uniqueSignals.length > 0) return s.letter;
  }

  // Pattern: n-1 bold, 1 not bold → the 1 without bold is... no, usually answer is marked
  // Pattern: all bold, 1 has extra (underline/color/italic) → extra is answer
  if (totalBold === n) {
    for (const s of signals) {
      if (s.f.underline || s.f.italic || (s.f.color && !isNeutralColor(s.f.color)) || s.f.highlight) {
        return s.letter;
      }
    }
  }

  // Pattern: 1 bold among n → bold is answer (most common teacher style)
  if (totalBold === 1) return signals.find(s => s.f.bold)?.letter || null;

  return null;
}

// ─── Detect true/false answer from item text/formatting ──────────────────────
function detectTrueFalseAnswer(item) {
  const text = item.text.trim();

  // Check last character(s) for explicit marker
  const last = text.slice(-10).toLowerCase().trim();

  // Markers for TRUE: Đ, đ, Đúng, đúng, D, d (in context)
  if (/[\sĐđ]\s*(đúng|đ)\s*$/.test(text.toLowerCase()) || /[^a-zđ]đ\s*$/i.test(text)) return true;
  if (/\s+d\s*$/.test(text.toLowerCase()) && !/\w\w/.test(text.slice(-3))) return true;

  // Markers for FALSE: S, s, Sai, sai
  if (/\s*(sai|s)\s*$/.test(text.toLowerCase())) return false;

  // Check formatting: colored/highlighted/bold outlier among siblings
  // (handled by parent if needed, here return null)
  return null;
}

function stripTrueFalseMarker(text) {
  return text
    .replace(/\s+(đúng|đ|d)\s*$/i, '')
    .replace(/\s+(sai|s)\s*$/i, '')
    .trim();
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function isNeutralColor(color) {
  if (!color) return true;
  const c = color.toLowerCase().replace(/\s/g, '');
  return (
    c === 'rgb(0,0,0)' || c === '#000' || c === '#000000' ||
    c === 'black' ||
    c === 'rgb(255,255,255)' || c === '#fff' || c === '#ffffff' ||
    c === 'white' ||
    c === 'inherit' || c === 'initial' || c === 'unset'
  );
}

// ─── All-in-one ───────────────────────────────────────────────────────────────
export async function parseDocx(file) {
  const { html, mediaMap } = await convertDocxToHtml(file);
  const exam = parseHtmlToExam(html);
  return { exam, mediaMap };
}