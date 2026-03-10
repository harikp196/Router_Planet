"use strict";

const themeSelect = document.getElementById("themeSelect");

function applyTheme(theme) {
  document.body.classList.remove("theme-nasa", "theme-sim");
  document.body.classList.add(theme === "sim" ? "theme-sim" : "theme-nasa");
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "nasa";
applyTheme(savedTheme);
if (themeSelect) {
  themeSelect.value = savedTheme;
  themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));
}

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

  src.value = "Earth";
  dst.value = "Jupiter";
  updateAssistUI();
}

document.getElementById("destination")?.addEventListener("change", updateAssistUI);

function parseDateOnly(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

document.getElementById("missionForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const source = document.getElementById("source").value;
  const destination = document.getElementById("destination").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const preference = document.getElementById("preference").value;

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const diffDays = Math.round((end - start) / (24 * 60 * 60 * 1000));

  if (diffDays < 10) {
    alert("Please select an end date at least 10 days after the start date.");
    return;
  }

  const assistType = getAssistType(destination);
  const gravityAssist = (assistType !== "NONE") && document.getElementById("gravityAssist").checked;

  const mission = {
    source,
    destination,
    startDate,
    endDate,
    preference,
    gravityAssist,
    assistType
  };

  localStorage.setItem("missionPayload", JSON.stringify(mission));
  window.location.href = "routes.html";
});

loadPlanets().catch((e) => {
  console.error(e);
  alert("Failed to load planets.");
});