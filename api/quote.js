function clampQuote(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  // Single-line, clean output (safe for UI)
  return t.replace(/\s+/g, " ").slice(0, 220);
}

// Best-effort anti-repeat memory (per serverless instance).
// Note: On Vercel, serverless functions may run on multiple instances / cold-start,
// so this reduces repeats but cannot guarantee global uniqueness.
const RECENT_BY_LANG = { en: [], tl: [] };
const RECENT_LIMIT = 16;

function rememberQuote(lang, quote) {
  const l = lang === "tl" ? "tl" : "en";
  const q = clampQuote(quote);
  if (!q) return;
  const arr = RECENT_BY_LANG[l];
  const idx = arr.indexOf(q);
  if (idx !== -1) arr.splice(idx, 1);
  arr.unshift(q);
  if (arr.length > RECENT_LIMIT) arr.length = RECENT_LIMIT;
}

function recentQuotesBlock(lang) {
  const l = lang === "tl" ? "tl" : "en";
  const arr = RECENT_BY_LANG[l];
  if (!arr.length) return "";
  const items = arr.slice(0, 8).map((q) => `- ${q}`);
  return ["Do NOT repeat any of these recent outputs:", ...items].join("\n");
}

function safeJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function buildPrompt(lang) {
  const languageInstruction =
    lang === "tl"
      ? "Write in Tagalog."
      : "Write in English.";

  // "Lived yearner" = heartfelt, grounded, not generic motivational, not fictional worldbuilding.
  // Also enforce output shape: a single quote line only, no extra text.
  return [
    "You generate one short 'yearner' quote (pang-yearner).",
    languageInstruction,
    "Tone: lived, intimate, raw, gentle; romantic yearning; modern and relatable.",
    "Avoid: clichés, generic motivation, hashtags, emojis, song lyrics, named people, and any mention of AI.",
    "Avoid repeating phrasing and structure from your recent outputs; be meaningfully different.",
    "Format rules:",
    "- Output ONLY the quote text (one paragraph).",
    "- No title. No bullet points. No explanations.",
    "- Keep it 10–22 words.",
    recentQuotesBlock(lang),
  ].join("\n");
}

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return safeJson(res, 500, {
        error:
          "Missing GEMINI_API_KEY env var. Add it in Vercel Project Settings → Environment Variables.",
      });
    }

    const lang = String((req.query && req.query.lang) || "en").toLowerCase();
    const chosen = lang === "tl" ? "tl" : "en";

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(chosen) }],
        },
      ],
      generationConfig: {
        temperature: 0.95,
        topP: 0.9,
        maxOutputTokens: 80,
      },
    };

    const r = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      return safeJson(res, 502, {
        error: "Gemini request failed",
        status: r.status,
        details: clampQuote(errText),
      });
    }

    const data = await r.json();
    const raw =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    const quote = clampQuote(raw);
    if (!quote) {
      return safeJson(res, 502, { error: "Gemini returned empty quote" });
    }

    rememberQuote(chosen, quote);
    return safeJson(res, 200, { quote });
  } catch (e) {
    return safeJson(res, 500, { error: "Server error", details: String(e && e.message ? e.message : e) });
  }
}

