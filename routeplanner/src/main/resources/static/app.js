"use strict";

// =====================
// THEME SWITCHER
// =====================
const themeSelect = document.getElementById("themeSelect");

function applyTheme(theme) {
  document.body.classList.remove("theme-nasa", "theme-sim");
  document.body.classList.add(theme === "sim" ? "theme-sim" : "theme-nasa");
}

if (themeSelect) themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));
applyTheme("nasa");

// =====================
// GLOBAL STATE
// =====================
let currentMission = null;
let selectedRoute = null;
let simTimer = null;

// =====================
// LOADING / PROGRESS
// =====================
function setLoading(isLoading) {
  const box = document.getElementById("loadingBox");
  const bar = document.getElementById("progressBar");
  const btn = document.querySelector("#missionForm button[type='submit']");
  if (!box || !bar || !btn) return;

  if (isLoading) {
    box.style.display = "block";
    bar.style.width = "12%";
    btn.disabled = true;
  } else {
    btn.disabled = false;
    bar.style.width = "100%";
    setTimeout(() => {
      box.style.display = "none";
      bar.style.width = "0%";
    }, 250);
  }
}

// =====================
// ASSIST RULES
// Outer planets: Jupiter assist
// Mercury: Venus assist
// =====================
function getAssistType(destination) {
  if (["Saturn", "Uranus", "Neptune"].includes(destination)) return "JUPITER";
  if (destination === "Mercury") return "VENUS";
  return "NONE";
}

function updateAssistUI() {
  const dst = document.getElementById("destination")?.value;
  const cb = document.getElementById("gravityAssist");
  const label = document.getElementById("assistLabel");
  if (!dst || !cb || !label) return;

  const assistType = getAssistType(dst);

  if (assistType === "NONE") {
    cb.checked = false;
    cb.disabled = true;
    label.textContent = "Gravity assist not applicable for this destination.";
  } else if (assistType === "JUPITER") {
    cb.disabled = false;
    label.textContent = "Assist will use: Jupiter gravity assist (outer planet mission).";
  } else if (assistType === "VENUS") {
    cb.disabled = false;
    label.textContent = "Assist will use: Venus gravity assist (Mercury mission).";
  }
}

// =====================
// PLANETS LOADER
// =====================
async function loadPlanets() {
  const res = await fetch("/api/planets");
  if (!res.ok) throw new Error(`Failed to load planets (${res.status})`);
  const planets = await res.json();

  const src = document.getElementById("source");
  const dst = document.getElementById("destination");
  src.innerHTML = "";
  dst.innerHTML = "";

  planets.forEach((p) => {
    const o1 = document.createElement("option");
    o1.value = p.name;
    o1.textContent = p.name;
    src.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = p.name;
    o2.textContent = p.name;
    dst.appendChild(o2);
  });

  // defaults
  src.value = "Earth";
  dst.value = "Jupiter";

  updateAssistUI();
}

document.getElementById("destination")?.addEventListener("change", updateAssistUI);

// =====================
// DATE PARSER
// =====================
function parseDateOnly(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// =====================
// SIMULATION (CANVAS) - ARC + RED TRACKING LINE
// =====================
function drawSimFrame(progress, srcName, dstName) {
  const canvas = document.getElementById("simCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // stars (deterministic)
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let i = 0; i < 70; i++) {
    const x = (i * 37) % canvas.width;
    const y = (i * 67) % canvas.height;
    ctx.globalAlpha = 0.22;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;

  const leftX = 70;
  const rightX = canvas.width - 70;
  const midY = canvas.height / 2;

  const p0 = { x: leftX, y: midY };
  const p2 = { x: rightX, y: midY };
  const arcHeight = 55;
  const p1 = { x: (leftX + rightX) / 2, y: midY - arcHeight };

  function bezierPoint(t) {
    const x =
      (1 - t) * (1 - t) * p0.x +
      2 * (1 - t) * t * p1.x +
      t * t * p2.x;

    const y =
      (1 - t) * (1 - t) * p0.y +
      2 * (1 - t) * t * p1.y +
      t * t * p2.y;

    return { x, y };
  }

  // base path
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
  ctx.stroke();

  const steps = 120;
  const maxStep = Math.floor(progress * steps);

  // glow red
  ctx.strokeStyle = "rgba(255,60,60,0.18)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  for (let i = 0; i <= maxStep; i++) {
    const t = i / steps;
    const pt = bezierPoint(t);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // main red path
  ctx.strokeStyle = "rgba(255,60,60,0.95)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= maxStep; i++) {
    const t = i / steps;
    const pt = bezierPoint(t);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // planets
  ctx.fillStyle = "rgba(73,211,255,0.95)";
  ctx.beginPath();
  ctx.arc(p0.x, p0.y, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(44,255,138,0.95)";
  ctx.beginPath();
  ctx.arc(p2.x, p2.y, 14, 0, Math.PI * 2);
  ctx.fill();

  // labels
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "12px Arial";
  ctx.fillText(srcName || "Source", p0.x - 26, p0.y + 34);
  ctx.fillText(dstName || "Dest", p2.x - 20, p2.y + 34);

  // spacecraft
  const ship = bezierPoint(progress);
  ctx.fillStyle = "rgba(255,204,102,0.95)";
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function stopSimulation() {
  if (simTimer) clearInterval(simTimer);
  simTimer = null;
}

function startSimulation() {
  if (!selectedRoute || !currentMission) return;

  const label = document.getElementById("timelineLabel");
  const bar = document.getElementById("timelineInner");

  stopSimulation();

  let t = 0;
  const totalDays = Number(selectedRoute.days);

  if (label) label.textContent = `Launching… ${currentMission.source} → ${currentMission.destination} (TOF: ${totalDays} days)`;
  if (bar) bar.style.width = "0%";

  simTimer = setInterval(() => {
    t += 0.02;
    const p = Math.min(1, t);

    if (bar) bar.style.width = `${Math.round(p * 100)}%`;
    drawSimFrame(p, currentMission.source, currentMission.destination);

    if (p >= 1) {
      stopSimulation();
      if (label) label.textContent = `Arrived at ${currentMission.destination}. Mission complete ✅`;
    }
  }, 60);
}

const simulateBtn = document.getElementById("simulateBtn");
if (simulateBtn) simulateBtn.addEventListener("click", startSimulation);

// =====================
// FORM SUBMIT (payload includes assist fields)
// =====================
document.getElementById("missionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const source = document.getElementById("source").value;
  const destination = document.getElementById("destination").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const preference = document.getElementById("preference").value;

  const assistType = getAssistType(destination);
  const assistCheckbox = document.getElementById("gravityAssist");
  const gravityAssist = (assistType !== "NONE") && !!assistCheckbox?.checked;

  // validation
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const diffDays = Math.round((end - start) / (24 * 60 * 60 * 1000));
  if (diffDays < 10) {
    alert("Please select an end date at least 10 days after the start date.");
    return;
  }

  const data = {
    source,
    destination,
    startDate,
    endDate,
    preference,
    gravityAssist,
    assistType
  };

  setLoading(true);

  // fake progress
  let tick = 12;
  const timer = setInterval(() => {
    tick = Math.min(90, tick + 10);
    const bar = document.getElementById("progressBar");
    if (bar) bar.style.width = tick + "%";
  }, 200);

  const res = await fetch("/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  clearInterval(timer);
  setLoading(false);

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    alert(err?.message || `Request failed (${res.status})`);
    return;
  }

  const result = await res.json();
  renderResult(result);
});

// =====================
// RENDER RESULTS
// =====================
function renderResult(result) {
  currentMission = result;

  const routes = result.routes ?? [];

  const dash = document.getElementById("dashboard");
  if (dash) dash.style.display = "grid";

  const simPanel = document.getElementById("simPanel");
  if (simPanel) simPanel.style.display = "grid";

  const missionSummary = document.getElementById("missionSummary");
  if (missionSummary) {
    missionSummary.textContent = `${result.source} → ${result.destination} | ${routes.length} route options found`;
  }

  // KPIs
  document.getElementById("kpiTotal").textContent = routes.length;
  document.getElementById("kpiPref").textContent = result.preference ?? "-";

  if (routes.length > 0) {
    document.getElementById("kpiBestDays").textContent = routes[0].days;
    document.getElementById("kpiBestDv").textContent = Number(routes[0].deltaV).toFixed(2);
  } else {
    document.getElementById("kpiBestDays").textContent = "-";
    document.getElementById("kpiBestDv").textContent = "-";
  }

  // reset selection
  selectedRoute = null;
  stopSimulation();
  if (simulateBtn) simulateBtn.disabled = true;

  const routeDetails = document.getElementById("routeDetails");
  if (routeDetails) routeDetails.innerHTML = `<div class="muted">No route selected</div>`;

  const timelineLabel = document.getElementById("timelineLabel");
  if (timelineLabel) timelineLabel.textContent = "Select a route to preview.";

  const timelineInner = document.getElementById("timelineInner");
  if (timelineInner) timelineInner.style.width = "0%";

  drawSimFrame(0.20, result.source, result.destination);

  // table
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  routes.forEach((r, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.rank ?? (idx + 1)}</td>
      <td>${r.departureDate}</td>
      <td>${r.arrivalDate}</td>
      <td>${r.days}</td>
      <td>${Number(r.deltaV).toFixed(2)}</td>
    `;

    tr.addEventListener("click", () => {
      document.querySelectorAll("#resultsTable tbody tr").forEach((x) => x.classList.remove("selectedRow"));
      tr.classList.add("selectedRow");

      selectedRoute = r;
      if (simulateBtn) simulateBtn.disabled = false;

      if (routeDetails) {
        routeDetails.innerHTML = `
          <div><b>Rank:</b> ${r.rank ?? (idx + 1)}</div>
          <div><b>Departure:</b> ${r.departureDate}</div>
          <div><b>Arrival:</b> ${r.arrivalDate}</div>
          <div><b>Time of Flight:</b> ${r.days} days</div>
          <div><b>ΔV:</b> ${Number(r.deltaV).toFixed(2)} km/s</div>
          <div class="muted" style="margin-top:8px;">Click “Simulate Selected Route” to animate transfer.</div>
        `;
      }

      if (timelineLabel) {
        timelineLabel.textContent = `Selected route ready. TOF ${r.days} days, ΔV ${Number(r.deltaV).toFixed(2)}.`;
      }

      drawSimFrame(0.35, result.source, result.destination);
    });

    tbody.appendChild(tr);
  });
}

// =====================
// INIT
// =====================
loadPlanets().catch((e) => {
  console.error(e);
  alert("Failed to load planets. Check /api/planets and backend logs.");
});