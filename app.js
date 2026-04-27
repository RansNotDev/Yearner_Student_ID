// Fixed rules (not changeable)
const SCHOOL_NAME = "ENCHONG DEE UNIVERSITY";
const DEFAULT_QUOTE = "“The right train arrives when you’re ready to board.”";

const els = {
  nameInput: document.getElementById("nameInput"),
  typeSelect: document.getElementById("typeSelect"),
  deptSelect: document.getElementById("deptSelect"),
  courseSelect: document.getElementById("courseSelect"),
  socialSelect: document.getElementById("socialSelect"),
  socialUserInput: document.getElementById("socialUserInput"),
  photoInput: document.getElementById("photoInput"),
  newIdBtn: document.getElementById("newIdBtn"),
  quoteBtn: document.getElementById("quoteBtn"),
  downloadBtn: document.getElementById("downloadBtn"),

  photoPreview: document.getElementById("photoPreview"),
  nameOut: document.getElementById("nameOut"),
  deptOut: document.getElementById("deptOut"),
  courseOut: document.getElementById("courseOut"),
  roleBadge: document.getElementById("roleBadge"),
  idOut: document.getElementById("idOut"),
  quoteOut: document.getElementById("quoteOut"),
  quoteLangSelect: document.getElementById("quoteLangSelect"),

  qr: document.getElementById("qr"),
  qrCenterBadge: document.getElementById("qrCenterBadge"),
  qrBadgeImg: document.getElementById("qrBadgeImg"),
  barcodeValue: document.getElementById("barcodeValue"),
  barcode: document.getElementById("barcode"),
};

let currentStudentId = "";
let qrInstance = null;

async function fileToCroppedDataUrl(file) {
  // Match the ID frame ratio (photoFrame is 1 / 1.22).
  const targetW = 400;
  const targetH = Math.round(400 * 1.22); // 488

  // Prefer createImageBitmap to respect EXIF orientation on mobile (when supported).
  let srcW = 0;
  let srcH = 0;
  let drawSource = null;

  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    srcW = bmp.width;
    srcH = bmp.height;
    drawSource = bmp;
  } else {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      srcW = img.naturalWidth || img.width;
      srcH = img.naturalHeight || img.height;
      drawSource = img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // "Cover" crop to fill frame, centered.
  const scale = Math.max(targetW / srcW, targetH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const dx = (targetW - drawW) / 2;
  const dy = (targetH - drawH) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(drawSource, dx, dy, drawW, drawH);

  // Release bitmap memory if used
  if (drawSource && typeof drawSource.close === "function") {
    drawSource.close();
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

const DEPARTMENTS = [
  {
    name: "College of Relapse Engineering (BS Relapse Engineering)",
    courses: [
      "RLP-101: Structural Integrity of a Breakdown",
      "RLP-1000: 10 PM Relapse: Peak Performance Pining",
      "RLP-303: Excavation & Restoration of Archived Memories",
    ],
  },
  {
    name: "School of Yearning Architecture (BS EngiYearning)",
    courses: [
      "EY-111: Foundations of Eternal Longing",
      "EY-222: Bridge Building to \"What Could Have Been\"",
      "EY-333: Load-Bearing Analysis of a Heavy Heart",
    ],
  },
  {
    name: "Department of Information Heart-Technology (BS Heart-IT)",
    courses: [
      "HIT-404: Page Not Found: Handling Sudden Ghosting Errors",
      "HIT-505: Cloud Storage for Unsent Screenshots",
      "HIT-606: Algorithm Manipulation: Forcing Yourself onto Their \"For You\" Page",
    ],
  },
  {
    name: "School of Rebound Logistics (BS Rebound Management)",
    courses: [
      "RM-101: Principles of Immediate Replacement",
      "RM-202: Distraction Dynamics & Fast-Track Recovery",
      "RM-303: Inventory Management of Temporary Feelings",
    ],
  },
  {
    name: "Institute of Back-Burner Science (BS Back-Burner Studies)",
    courses: [
      "BBS-101: Low-Heat Maintenance of \"The Option\"",
      "BBS-202: Micro-Interaction Theory: The Power of a \"Like\"",
      "BBS-303: Advanced Bench-Warming & Patience Tactics",
    ],
  },
  {
    name: "School of Delusional Science (BS Delulu Manifestation)",
    courses: [
      "DS-101: Scenario Modeling: From \"Seen\" to \"I Do\"",
      "DS-202: Narrative Construction & Reality Distortion",
      "DS-303: Quantum Mechanics: Being Both Single and Taken",
    ],
  },
  {
    name: "College of Situationship Arts (BA Situationship Dynamics)",
    courses: [
      "SD-101: Label Avoidance & Boundary Deflection",
      "SD-202: Applied Linguistics: The \"We're Just Vibing\" Theory",
      "SD-303: Intermediate Exit-Strategy Evasion",
    ],
  },
  {
    name: "Department of Digital Ghosting (BS Ghosting & Evasion)",
    courses: [
      "GHO-111: Introduction to the Digital Vanishing Act",
      "GHO-222: Ethics of the Unexplained Radio Silence",
      "GHO-333: Frequency Attenuation: The Masterclass of the Slow Fade",
    ],
  },
  {
    name: "Faculty of Bitter-Sweetness (BA Revenge Studies)",
    courses: [
      "BSR-101: Aesthetics of the \"I’m Doing Better\" Facade",
      "BSR-202: Cryptic Captioning & Social Media Warfare",
      "BSR-303: Applied Indifference: Advanced Acting Principles",
    ],
  },
  {
    name: "School of Platonic Engineering (BS Friendzone Management)",
    courses: [
      "PZ-101: Structural Analysis of the \"Bestie\" Zone",
      "PZ-202: Third-Wheeling Ethics and Camera Operations",
      "PZ-303: Support System Endurance: Smiling Through the Pain",
    ],
  },
  {
    name: "Institute of Signal Cryptography (BS Mixed Signal Analysis)",
    courses: [
      "MSC-101: Deciphering \"K\": Tone and Intent Analysis",
      "MSC-202: Emoji Semantics: Determining Friendly vs. Flirty",
      "MSC-303: Drunk-Text Linguistics & Post-Sent Regret",
    ],
  },
];

const STUDENT_TYPES = {
  "Student Yearner": {
    department: "School of Yearning Architecture (BS EngiYearning)",
    signature: {
      tl: "Sana sa susunod na buhay, tayo naman.",
      en: "I hope in the next life, it's our turn.",
    },
  },
  "Student Back-Burner": {
    department: "Institute of Back-Burner Science (BS Back-Burner Studies)",
    signature: {
      tl: "Dito lang ako, 'wag ka mag-alala.",
      en: "I'm just here, don't worry.",
    },
  },
  "Student Relapser": {
    department: "College of Relapse Engineering (BS Relapse Engineering)",
    signature: {
      tl: "Isang check lang sa profile, promise, 'di ko icha-chat.",
      en: "Just one profile check, I promise I won't message.",
    },
  },
};

function chosenLang() {
  const lang = (els.quoteLangSelect && els.quoteLangSelect.value) || "en";
  return String(lang).toLowerCase() === "tl" ? "tl" : "en";
}

function selectedStudentType() {
  return (els.typeSelect && els.typeSelect.value) || "Student Yearner";
}

function syncDepartmentForStudentType() {
  const type = selectedStudentType();
  const meta = STUDENT_TYPES[type];
  if (!meta || !els.deptSelect) return;

  // Only set if the department exists in the dropdown; otherwise leave user's choice.
  const deptOptionExists = Array.from(els.deptSelect.options || []).some(
    (o) => o && o.value === meta.department
  );
  if (!deptOptionExists) return;

  els.deptSelect.value = meta.department;
  syncCoursesForSelectedDepartment();
}

function updateRoleBadge() {
  if (!els.roleBadge) return;
  els.roleBadge.textContent = String(selectedStudentType() || "Student").toUpperCase();
}

function getDepartmentByName(name) {
  return DEPARTMENTS.find((d) => d.name === name) || null;
}

function setSelectOptions(selectEl, options, selectedValue) {
  if (!selectEl) return;
  selectEl.innerHTML = "";

  for (const opt of options) {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    selectEl.appendChild(o);
  }

  if (selectedValue && options.includes(selectedValue)) {
    selectEl.value = selectedValue;
  } else if (options.length) {
    selectEl.selectedIndex = 0;
  }
}

function syncCoursesForSelectedDepartment(keepCourseValue) {
  const deptName = (els.deptSelect && els.deptSelect.value) || "";
  const dept = getDepartmentByName(deptName);
  const courses = (dept && dept.courses) || [];

  setSelectOptions(els.courseSelect, courses, keepCourseValue);

  if (els.courseOut) {
    els.courseOut.textContent =
      (els.courseSelect && els.courseSelect.value) || "—";
  }
}

function currentYear() {
  return new Date().getFullYear();
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

function pad7(n) {
  return String(n).padStart(7, "0");
}

// Random 7-digit suffix (0000000-9999999) using cryptographic RNG.
// Prohibited generated value: 0000001.
function randomLast7() {
  const buf = new Uint32Array(1);
  let n = 1;
  while (n === 1) {
    crypto.getRandomValues(buf);
    n = buf[0] % 10000000; // 0..9,999,999
  }
  return n;
}

function generateStudentId() {
  const year = currentYear();
  const last7 = pad7(randomLast7());
  return `EDU-${year}-${last7}`;
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
  syncCoursesForSelectedDepartment();
  updateRoleBadge();

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
  // Intentionally no visible QR label under the QR code.
}

function updateTextOutputs() {
  els.nameOut.textContent = els.nameInput.value.trim() || "—";
  els.deptOut.textContent = els.deptSelect.value;
  if (els.courseOut) {
    els.courseOut.textContent = (els.courseSelect && els.courseSelect.value) || "—";
  }
  updateRoleBadge();
}

async function fetchAiQuote() {
  const lang = chosenLang();
  const type = selectedStudentType();

  const res = await fetch(
    `./api/quote?lang=${encodeURIComponent(lang)}&type=${encodeURIComponent(type)}`,
    {
    method: "GET",
    headers: { Accept: "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error(`Quote API failed: ${res.status}`);
  }

  const data = await res.json();
  if (!data || typeof data.quote !== "string" || !data.quote.trim()) {
    throw new Error("Quote API returned invalid payload");
  }

  return data.quote.trim();
}

let lastShownQuote = "";

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
  // Try a few times to avoid immediate repeats.
  for (let tries = 0; tries < 6; tries++) {
    const i = Math.floor(Math.random() * list.length);
    const q = `“${list[i]}”`;
    if (q !== lastShownQuote) return q;
  }
  return `“${list[Math.floor(Math.random() * list.length)]}”`;
}

function wireEvents() {
  els.nameInput.addEventListener("input", updateTextOutputs);
  els.deptSelect.addEventListener("change", () => {
    syncCoursesForSelectedDepartment();
    updateTextOutputs();
  });
  els.typeSelect.addEventListener("change", () => {
    syncDepartmentForStudentType();
    updateTextOutputs();
  });
  if (els.courseSelect) {
    els.courseSelect.addEventListener("change", updateTextOutputs);
  }

  els.socialUserInput.addEventListener("input", renderQrFromSocial);
  els.socialSelect.addEventListener("change", renderQrFromSocial);

  els.photoInput.addEventListener("change", async () => {
    const file = els.photoInput.files && els.photoInput.files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCroppedDataUrl(file);
      els.photoPreview.src = dataUrl;
    } catch (e) {
      // Fallback: show raw image if crop fails for any reason
      const url = URL.createObjectURL(file);
      els.photoPreview.src = url;
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    }
  });

  els.newIdBtn.addEventListener("click", () => {
    // Reset all user-editable fields, then generate a fresh ID.
    els.nameInput.value = "";
    els.socialUserInput.value = "";
    els.photoInput.value = "";

    // Reset selects to their first option/defaults
    els.deptSelect.selectedIndex = 0;
    syncCoursesForSelectedDepartment();
    els.typeSelect.selectedIndex = 0;
    syncDepartmentForStudentType();
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
      const shown = q.startsWith("“") ? q : `“${q}”`;
      els.quoteOut.textContent = shown;
      lastShownQuote = shown;
    } catch (e) {
      // Fallback to local quotes so the page still works offline/static.
      const lang = (els.quoteLangSelect && els.quoteLangSelect.value) || "en";
      const fallback = randomLocalYearningQuote(lang);
      els.quoteOut.textContent = fallback.startsWith("“") ? fallback : `“${fallback}”`;
      lastShownQuote = els.quoteOut.textContent;
    } finally {
      els.quoteBtn.disabled = false;
    }
  });

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
      // Force a consistent "desktop" layout for the exported PNG (independent of screen size).
      card.classList.add("capture");
      // Let layout settle before capture.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

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
      card.classList.remove("capture");
      els.downloadBtn.disabled = false;
      els.downloadBtn.textContent = oldText;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // lock-in fixed items by never rendering inputs for them
  wireEvents();
  syncDepartmentForStudentType();
  setDefaults();
  updateTextOutputs();
});