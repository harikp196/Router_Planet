"use strict";

const savedTheme = localStorage.getItem("theme") || "nasa";
document.body.classList.add(savedTheme === "sim" ? "theme-sim" : "theme-nasa");

function loadAnalytics() {
  const raw = localStorage.getItem("routesResult");
  if (!raw) {
    alert("No route results found.");
    window.location.href = "routes.html";
    return;
  }

  const result = JSON.parse(raw);
  const routes = result.routes ?? [];

  document.getElementById("analyticsMission").textContent = `${result.source} → ${result.destination}`;
  document.getElementById("analyticsAssist").textContent =
    result.gravityAssist ? (result.assistType || "ON") : "OFF";

  const labels = routes.map((r, i) => `R${r.rank ?? (i + 1)}`);
  const days = routes.map(r => r.days);
  const dvs = routes.map(r => Number(r.deltaV));

  new Chart(document.getElementById("daysChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Days", data: days }]
    }
  });

  new Chart(document.getElementById("dvChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Delta-V", data: dvs }]
    }
  });

  new Chart(document.getElementById("scatterChart"), {
    type: "scatter",
    data: {
      datasets: [{
        label: "Days vs Delta-V",
        data: routes.map(r => ({ x: Number(r.deltaV), y: r.days }))
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Delta-V" } },
        y: { title: { display: true, text: "Days" } }
      }
    }
  });
}

loadAnalytics();