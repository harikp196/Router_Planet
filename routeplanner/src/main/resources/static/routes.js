"use strict";

const savedTheme = localStorage.getItem("theme") || "nasa";
document.body.classList.add(savedTheme === "sim" ? "theme-sim" : "theme-nasa");

const goAnalyticsBtn = document.getElementById("goAnalyticsBtn");
if (goAnalyticsBtn) {
  goAnalyticsBtn.addEventListener("click", () => {
    window.location.href = "analytics.html";
  });
}

function setLoading(isLoading) {
  const box = document.getElementById("loadingBox");
  const bar = document.getElementById("progressBar");
  if (!box || !bar) return;

  if (isLoading) {
    box.style.display = "block";
    bar.style.width = "12%";
  } else {
    bar.style.width = "100%";
    setTimeout(() => {
      box.style.display = "none";
      bar.style.width = "0%";
    }, 250);
  }
}

async function fetchRoutes() {
  const payloadRaw = localStorage.getItem("missionPayload");
  if (!payloadRaw) {
    alert("No mission payload found. Returning to mission page.");
    window.location.href = "mission.html";
    return;
  }

  const payload = JSON.parse(payloadRaw);

  setLoading(true);
  let tick = 12;
  const timer = setInterval(() => {
    tick = Math.min(90, tick + 10);
    const bar = document.getElementById("progressBar");
    if (bar) bar.style.width = tick + "%";
  }, 200);

  const res = await fetch("/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  clearInterval(timer);
  setLoading(false);

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    alert(err?.message || `Request failed (${res.status})`);
    return;
  }

  const result = await res.json();
  localStorage.setItem("routesResult", JSON.stringify(result));
  renderRoutes(result);
}

function renderRoutes(result) {
  const routes = result.routes ?? [];

  document.getElementById("dashboard").style.display = "grid";
  document.getElementById("kpiTotal").textContent = routes.length;
  document.getElementById("kpiPref").textContent = result.preference ?? "-";

  if (routes.length > 0) {
    document.getElementById("kpiBestDays").textContent = routes[0].days;
    document.getElementById("kpiBestDv").textContent = Number(routes[0].deltaV).toFixed(2);
  } else {
    document.getElementById("kpiBestDays").textContent = "-";
    document.getElementById("kpiBestDv").textContent = "-";
  }

  const assistText = result.gravityAssist ? `Assist: ${result.assistType || "ON"}` : "Assist: OFF";
  document.getElementById("missionSummary").textContent =
    `${result.source} → ${result.destination} | ${routes.length} routes | ${assistText}`;

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
      <td><button class="btn">Use</button></td>
    `;

    tr.querySelector("button").addEventListener("click", () => {
      const selected = { ...r, mission: result };
      localStorage.setItem("selectedRoute", JSON.stringify(selected));
      window.location.href = "simulation.html";
    });

    tbody.appendChild(tr);
  });
}

fetchRoutes().catch((e) => {
  console.error(e);
  alert("Failed to fetch routes.");
});