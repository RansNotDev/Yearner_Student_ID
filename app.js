// Fixed rules (not changeable)
const SCHOOL_NAME = "ENCHONG DEE UNIVERSITY";
const POSITION = "STUDENT";
const DEFAULT_QUOTE = "“The right train arrives when you’re ready to board.”";

const els = {
  nameInput: document.getElementById("nameInput"),
  typeSelect: document.getElementById("typeSelect"),
  deptSelect: document.getElementById("deptSelect"),
  socialSelect: document.getElementById("socialSelect"),
  socialUserInput: document.getElementById("socialUserInput"),
  photoInput: document.getElementById("photoInput"),
  newIdBtn: document.getElementById("newIdBtn"),
  quoteBtn: document.getElementById("quoteBtn"),
  downloadBtn: document.getElementById("downloadBtn"),

  photoPreview: document.getElementById("photoPreview"),
  nameOut: document.getElementById("nameOut"),
  deptOut: document.getElementById("deptOut"),
  idOut: document.getElementById("idOut"),
  joinedOut: document.getElementById("joinedOut"),
  typeOut: document.getElementById("typeOut"),
  quoteOut: document.getElementById("quoteOut"),
  quoteLangSelect: document.getElementById("quoteLangSelect"),
  aiQuoteBtn: document.getElementById("aiQuoteBtn"),

  qr: document.getElementById("qr"),
  qrCenterBadge: document.getElementById("qrCenterBadge"),
  qrLabel: document.getElementById("qrLabel"),
  qrBadgeImg: document.getElementById("qrBadgeImg"),
  barcodeValue: document.getElementById("barcodeValue"),
  barcode: document.getElementById("barcode"),
};

let currentStudentId = "";
let qrInstance = null;

function currentYear() {
  return new Date().getFullYear();
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

// Random 001-999 using cryptographic RNG
function randomLast3() {
  const buf = new Uint16Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % 999) + 1;
}

function generateStudentId() {
  const year = currentYear();
  const last3 = pad3(randomLast3());
  return `EDU-${year}-${last3}`;
}

function sanitizeUsername(usernameRaw) {
  return String(usernameRaw || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .slice(0, 30);
}

function platformLogoSrc(platform) {
  switch (platform) {
    case "tiktok":
      return "./Image/tiktoklogo.png";
    case "instagram":
      return "./Image/instagramlogo.png";
    case "facebook":
      return "./Image/facebooklogo.jpg";
    case "threads":
      return "./Image/threadslogo.jpg";
    case "x":
      return "./Image/xlogo.jpg";
    default:
      return "";
  }
}

function platformLabel(platform) {
  switch (platform) {
    case "tiktok":
      return "TikTok QR";
    case "instagram":
      return "Instagram QR";
    case "facebook":
      return "Facebook QR";
    case "threads":
      return "Threads QR";
    case "x":
      return "X QR";
    default:
      return "Social QR";
  }
}

function buildProfileUrl(platform, usernameRaw) {
  const u = sanitizeUsername(usernameRaw);
  if (!u) {
    switch (platform) {
      case "tiktok":
        return "https://www.tiktok.com/";
      case "instagram":
        return "https://www.instagram.com/";
      case "facebook":
        return "https://www.facebook.com/";
      case "threads":
        return "https://www.threads.net/";
      case "x":
        return "https://x.com/";
      default:
        return "https://example.com/";
    }
  }

  switch (platform) {
    case "tiktok":
      return `https://www.tiktok.com/@${u}`;
    case "instagram":
      return `https://www.instagram.com/${u}`;
    case "facebook":
      return `https://www.facebook.com/${u}`;
    case "threads":
      return `https://www.threads.net/@${u}`;
    case "x":
      return `https://x.com/${u}`;
    default:
      return `https://example.com/${u}`;
  }
}

function setDefaults() {
  // Default image (simple placeholder SVG via data URL)
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="420">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e5e7eb"/>
          <stop offset="1" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="200" cy="170" r="70" fill="#94a3b8"/>
      <rect x="95" y="260" width="210" height="120" rx="60" fill="#94a3b8"/>
      <text x="200" y="405" font-size="20" text-anchor="middle" fill="#334155" font-family="Arial">Upload Photo</text>
    </svg>
  `);
  els.photoPreview.src = `data:image/svg+xml;charset=utf-8,${svg}`;

  els.nameOut.textContent = "—";
  els.deptOut.textContent = els.deptSelect.value;
  els.typeOut.textContent = els.typeSelect.value;

  els.joinedOut.textContent = String(currentYear());

  currentStudentId = generateStudentId();
  els.idOut.textContent = currentStudentId;
  if (els.barcodeValue) els.barcodeValue.textContent = currentStudentId;

  renderBarcode(currentStudentId);
  renderQrFromSocial();
}

function renderBarcode(studentId) {
  // JsBarcode uses the same value shown above
  JsBarcode(els.barcode, studentId, {
    format: "CODE128",
    lineColor: "#111827",
    width: 2.2,
    height: 254,
    displayValue: false,
    margin: 0,
  });
}

function renderQrFromSocial() {
  const platform = (els.socialSelect && els.socialSelect.value) || "tiktok";
  const username = (els.socialUserInput && els.socialUserInput.value) || "";
  const url = buildProfileUrl(platform, username);

  // Clear QR container and re-render
  els.qr.innerHTML = "";
  qrInstance = new QRCode(els.qr, {
    text: url,
    width: 116,
    height: 116,
    correctLevel: QRCode.CorrectLevel.H,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });

  if (els.qrCenterBadge) {
    els.qrCenterBadge.dataset.platform = platform;
    if (els.qrBadgeImg) {
      els.qrBadgeImg.src = platformLogoSrc(platform);
    }
  }
  if (els.qrLabel) {
    els.qrLabel.textContent = platformLabel(platform);
  }
}

function updateTextOutputs() {
  els.nameOut.textContent = els.nameInput.value.trim() || "—";
  els.deptOut.textContent = els.deptSelect.value;
  els.typeOut.textContent = els.typeSelect.value;
}

async function fetchAiQuote() {
  const lang = (els.quoteLangSelect && els.quoteLangSelect.value) || "en";

  const res = await fetch(`./api/quote?lang=${encodeURIComponent(lang)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Quote API failed: ${res.status}`);
  }

  const data = await res.json();
  if (!data || typeof data.quote !== "string" || !data.quote.trim()) {
    throw new Error("Quote API returned invalid payload");
  }

  return data.quote.trim();
}

function randomLocalYearningQuote(lang) {
  const chosen = String(lang || "en").toLowerCase() === "tl" ? "tl" : "en";

  const quotesEn = [
    "I don’t chase the train—I become the reason it stops.",
    "Yearning is proof my heart still believes in arrival.",
    "I’m learning to wait without shrinking my dreams.",
    "Some goodbyes are just promises wearing heavy coats.",
    "If it’s meant for me, it will find me—on time.",
  ];

  // Short, "pang-yearner" Tagalog lines; keep them UI-safe (single line).
  const quotesTl = [
    "Hindi kita hinahabol—hinihintay ko lang kung babalik ka pa.",
    "Ang tagal kong tumahimik, pero ikaw pa rin ang ingay ng puso ko.",
    "Kung hindi tayo ngayon, sana huwag mo akong kalimutan bukas.",
    "May mga yakap na hindi dumating, pero araw-araw kong naramdaman.",
    "Kung sa’yo talaga ako, bakit parang palagi kitang pinapaalam?",
  ];

  const list = chosen === "tl" ? quotesTl : quotesEn;
  if (!list.length) return "“…”";
  const i = Math.floor(Math.random() * list.length);
  return `“${list[i]}”`;
}

function wireEvents() {
  els.nameInput.addEventListener("input", updateTextOutputs);
  els.deptSelect.addEventListener("change", updateTextOutputs);
  els.typeSelect.addEventListener("change", updateTextOutputs);

  els.socialUserInput.addEventListener("input", renderQrFromSocial);
  els.socialSelect.addEventListener("change", renderQrFromSocial);

  els.photoInput.addEventListener("change", () => {
    const file = els.photoInput.files && els.photoInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    els.photoPreview.src = url;
  });

  els.newIdBtn.addEventListener("click", () => {
    // Reset all user-editable fields, then generate a fresh ID.
    els.nameInput.value = "";
    els.socialUserInput.value = "";
    els.photoInput.value = "";

    // Reset selects to their first option/defaults
    els.deptSelect.selectedIndex = 0;
    els.typeSelect.selectedIndex = 0;
    els.socialSelect.value = "tiktok";

    // Reset quote text
    els.quoteOut.textContent = DEFAULT_QUOTE;

    // Re-render all outputs from the reset state
    setDefaults();
    updateTextOutputs();
  });

  els.quoteBtn.addEventListener("click", async () => {
    // Backward-compatible: this older button still generates a quote
    els.quoteBtn.disabled = true;
    const old = els.quoteOut.textContent;
    els.quoteOut.textContent = "Generating quote...";
    try {
      const q = await fetchAiQuote();
      els.quoteOut.textContent = q.startsWith("“") ? q : `“${q}”`;
    } catch (e) {
      // Fallback to local quotes so the page still works offline/static.
      const lang = (els.quoteLangSelect && els.quoteLangSelect.value) || "en";
      const fallback = randomLocalYearningQuote(lang);
      els.quoteOut.textContent = fallback.startsWith("“") ? fallback : `“${fallback}”`;
    } finally {
      els.quoteBtn.disabled = false;
    }
  });

  if (els.aiQuoteBtn) {
    els.aiQuoteBtn.addEventListener("click", async () => {
      els.aiQuoteBtn.disabled = true;
      const old = els.quoteOut.textContent;
      els.quoteOut.textContent = "Generating quote...";
      try {
        const q = await fetchAiQuote();
        els.quoteOut.textContent = q.startsWith("“") ? q : `“${q}”`;
      } catch (e) {
        const lang = (els.quoteLangSelect && els.quoteLangSelect.value) || "en";
        const fallback = randomLocalYearningQuote(lang);
        els.quoteOut.textContent = fallback.startsWith("“") ? fallback : `“${fallback}”`;
      } finally {
        els.aiQuoteBtn.disabled = false;
      }
    });
  }

  els.downloadBtn.addEventListener("click", async () => {
    if (typeof html2canvas !== "function") {
      alert("Download library failed to load. Please refresh and try again.");
      return;
    }

    const card = document.getElementById("idCard");
    if (!card) return;

    els.downloadBtn.disabled = true;
    const oldText = els.downloadBtn.textContent;
    els.downloadBtn.textContent = "Preparing download...";

    try {
      const canvas = await html2canvas(card, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${currentStudentId || "EDU-ID"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Could not download. Try again.");
    } finally {
      els.downloadBtn.disabled = false;
      els.downloadBtn.textContent = oldText;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // lock-in fixed items by never rendering inputs for them
  wireEvents();
  setDefaults();
  updateTextOutputs();
});