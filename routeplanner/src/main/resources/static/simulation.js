"use strict";

const savedTheme = localStorage.getItem("theme") || "nasa";
document.body.classList.add(savedTheme === "sim" ? "theme-sim" : "theme-nasa");

let simTimer = null;

function drawSimFrame(progress, srcName, dstName) {
  const canvas = document.getElementById("simCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // stars
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let i = 0; i < 120; i++) {
    const x = (i * 53) % canvas.width;
    const y = (i * 79) % canvas.height;
    ctx.globalAlpha = 0.22;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;

  const leftX = 90;
  const rightX = canvas.width - 90;
  const midY = canvas.height / 2;

  const p0 = { x: leftX, y: midY };
  const p2 = { x: rightX, y: midY };
  const p1 = { x: (leftX + rightX) / 2, y: midY - 90 };

  function bezierPoint(t) {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  }

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
  ctx.stroke();

  const steps = 160;
  const maxStep = Math.floor(progress * steps);

  ctx.strokeStyle = "rgba(255,60,60,0.18)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  for (let i = 0; i <= maxStep; i++) {
    const pt = bezierPoint(i / steps);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,60,60,0.95)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= maxStep; i++) {
    const pt = bezierPoint(i / steps);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // source
  ctx.fillStyle = "rgba(73,211,255,0.95)";
  ctx.beginPath();
  ctx.arc(p0.x, p0.y, 18, 0, Math.PI * 2);
  ctx.fill();

  // destination
  ctx.fillStyle = "rgba(44,255,138,0.95)";
  ctx.beginPath();
  ctx.arc(p2.x, p2.y, 18, 0, Math.PI * 2);
  ctx.fill();

  // labels
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px Arial";
  ctx.fillText(srcName, p0.x - 26, p0.y + 40);
  ctx.fillText(dstName, p2.x - 26, p2.y + 40);

  // ship
  const ship = bezierPoint(progress);
  ctx.fillStyle = "rgba(255,204,102,0.95)";
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function loadSimulation() {
  const raw = localStorage.getItem("selectedRoute");
  if (!raw) {
    alert("No selected route found.");
    window.location.href = "routes.html";
    return;
  }

  const selected = JSON.parse(raw);
  const route = selected;
  const mission = selected.mission;

  document.getElementById("routeDetails").innerHTML = `
    <div><b>Source:</b> ${mission.source}</div>
    <div><b>Destination:</b> ${mission.destination}</div>
    <div><b>Departure:</b> ${route.departureDate}</div>
    <div><b>Arrival:</b> ${route.arrivalDate}</div>
    <div><b>Days:</b> ${route.days}</div>
    <div><b>Delta-V:</b> ${Number(route.deltaV).toFixed(2)} km/s</div>
    <div><b>Preference:</b> ${mission.preference}</div>
  `;

  drawSimFrame(0.18, mission.source, mission.destination);

  document.getElementById("startSimBtn").addEventListener("click", () => {
    const label = document.getElementById("timelineLabel");
    const bar = document.getElementById("timelineInner");

    if (simTimer) clearInterval(simTimer);

    let t = 0;
    if (label) label.textContent = `Launching… ${mission.source} → ${mission.destination}`;
    if (bar) bar.style.width = "0%";

    simTimer = setInterval(() => {
      t += 0.015;
      const p = Math.min(1, t);
      drawSimFrame(p, mission.source, mission.destination);
      if (bar) bar.style.width = `${Math.round(p * 100)}%`;

      if (p >= 1) {
        clearInterval(simTimer);
        if (label) label.textContent = `Arrived at ${mission.destination}. Mission complete ✅`;
      }
    }, 60);
  });
}

loadSimulation();