// ===== THREE.JS STARFIELD BACKGROUND =====

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.z = 1000;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = 0;
renderer.domElement.style.left = 0;
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.pointerEvents = "none";
document.body.appendChild(renderer.domElement);

// Star Geometry
const starsGeometry = new THREE.BufferGeometry();
const starCount = 6000;

const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 2000;
}

starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    transparent: true
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Animation
function animate() {
    requestAnimationFrame(animate);

    stars.rotation.y += 0.0003;
    stars.rotation.x += 0.0001;

    renderer.render(scene, camera);
}

animate();

// Resize Handling
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});