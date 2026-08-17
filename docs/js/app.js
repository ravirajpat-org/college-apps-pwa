// Wiring layer for the College Apps PWA: password gate + tab switching.
//
// All content is static (baked into index.html) — no data fetch/decrypt
// step like school-tracker-pwa. The gate compares a SHA-256 hash client-side
// (the plaintext password is never committed) — same "deterrent, not real
// security" caveat as school-tracker-pwa's gate: a determined reader of this
// file could brute-force the hash offline. Acceptable for this app's
// threat model (personal family research notes, not sensitive data).

const PASSWORD_HASH =
  "39638cc8a247d7eac7883636b4e42259edc0d489b0738b2b1dd33250013295f5";

const gateForm = document.getElementById("password-gate-form");
const gateInput = document.getElementById("password-input");
const gateError = document.getElementById("gate-error");
const gateSection = document.getElementById("password-gate");
const dashboardSection = document.getElementById("dashboard");

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function showGateError(message) {
  gateError.textContent = message;
  gateError.hidden = false;
}

function clearGateError() {
  gateError.textContent = "";
  gateError.hidden = true;
}

async function handleGateSubmit(event) {
  event.preventDefault();
  clearGateError();

  const password = gateInput.value;
  if (!password) {
    showGateError("Enter the shared password.");
    return;
  }

  const hash = await sha256Hex(password);
  if (hash !== PASSWORD_HASH) {
    showGateError("Wrong password.");
    return;
  }

  gateSection.hidden = true;
  dashboardSection.hidden = false;
}

function wireTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.hidden = panel.id !== btn.dataset.panel;
      });
    });
  });
}

// Reach/Target/Safety filter pills. Any element carrying data-rts (school
// cards, and table rows in the ranking/cross-reference tables) is a
// filterable unit; elements without data-rts (Quick Comparison card
// wrappers, the Combined Plan intro card, landscape-scan tables with no
// per-school rating) are intentionally left alone and always stay visible.
//
// The pill count is meant to answer "how many schools will I see?", not
// "how many DOM elements have this attribute?" — those aren't the same
// number. A school with its own card ALSO appears as a row in that tab's
// Quick Comparison table, and a divider heading isn't a school at all
// (though the Master LAC layout's divider stands in for a whole table of
// schools, one row each). countableRts() resolves each data-rts element
// to how many real schools it represents for counting purposes, while
// applyFilter() still uses every data-rts element for visibility — an
// element that's excluded from the count can still be legitimately
// shown/hidden by the filter.
function countableRts(el) {
  if (el.tagName === "H3") {
    // A divider isn't a school by itself. If it's paired with a plain
    // table (the Master LAC layout), it stands in for one row per school
    // in that table; otherwise (card-group dividers) it contributes 0.
    const next = el.nextElementSibling;
    if (next && next.classList.contains("table-scroll")) {
      return next.querySelectorAll("tbody tr").length;
    }
    return 0;
  }
  if (el.tagName === "TR") {
    // Rows inside a "Quick Comparison" summary card duplicate a school
    // that already has its own detail card below — don't count them
    // twice.
    const heading = el.closest("section.card")?.querySelector("h2")?.textContent || "";
    if (heading.includes("Quick Comparison")) return 0;
  }
  return 1;
}

function updateFilterCounts(panel) {
  const rtsEls = Array.from(panel.querySelectorAll("[data-rts]"));
  const countFor = (filter) =>
    rtsEls
      .filter((el) => filter === "all" || el.dataset.rts === filter)
      .reduce((sum, el) => sum + countableRts(el), 0);

  panel.querySelectorAll(".filter-pill").forEach((btn) => {
    const filter = btn.dataset.filter;
    const label = filter.charAt(0).toUpperCase() + filter.slice(1);
    btn.textContent = `${label} (${countFor(filter)})`;
  });
}

function applyFilter(panel, filter) {
  panel.querySelectorAll("[data-rts]").forEach((el) => {
    const matches = filter === "all" || el.dataset.rts === filter;
    el.hidden = !matches;
    // The Master LAC cross-reference lists three plain tables (one per
    // R/T/S group) directly after their divider, rather than as separate
    // cards — toggle the table along with its divider.
    const next = el.nextElementSibling;
    if (next && next.classList.contains("table-scroll")) {
      next.hidden = !matches;
    }
  });
}

function wireFilterBars() {
  document.querySelectorAll(".filter-bar").forEach((bar) => {
    const panel = bar.closest(".tab-panel");
    updateFilterCounts(panel);
    bar.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        bar
          .querySelectorAll(".filter-pill")
          .forEach((b) => b.classList.toggle("active", b === btn));
        applyFilter(panel, btn.dataset.filter);
      });
    });
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").catch(() => {
    // Non-fatal: app still works without offline caching.
  });
}

gateForm.addEventListener("submit", handleGateSubmit);
wireTabs();
wireFilterBars();
registerServiceWorker();
