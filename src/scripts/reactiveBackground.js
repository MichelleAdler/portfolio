// Global canvas and simulation variables
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
let cw, ch;
let points = [];
let constraints = [];
let pointsX, pointsY, spacing;
const densityFactor = 0.02;
let damping = 0.97,
    stiffness = 0.12,
    iterations = 2;
let returnSpeed = 0.003,
    windForce = 0,
    windDirection = 0,
    time = 0;

// Mouse tracking variables
let mouseX, mouseY, prevMouseX, prevMouseY, mouseVelX, mouseVelY;
let mouseDown = false,
    mouseDragging = false;
let mouseInfluenceRadius = 180;

let mouseEffectStrength = 1;
let lastMouseMoveTime = Date.now();
const idleThreshold = 300;
const decayRate = 0.01;

let mouseOnCanvas = false;

function initMouse() {
    mouseX = cw / 2;
    mouseY = ch / 2;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseVelX = 0;
    mouseVelY = 0;
}

function initSimulation() {
    points = [];
    constraints = [];
    spacing = Math.min(cw / (pointsX - 1), ch / (pointsY - 1));

    for (let y = 0; y < pointsY; y++) {
        for (let x = 0; x < pointsX; x++) {
            const offsetY = Math.sin(x * 0.2) * 15 + Math.sin(y * 0.2) * 10;
            const posX = x * spacing;
            const posY = y * spacing + offsetY;
            points.push({
                x: posX,
                y: posY,
                prevX: posX,
                prevY: posY,
                origX: posX,
                origY: posY,
                pinned:
                    y === 0 && (x % 4 === 0 || x === 0 || x === pointsX - 1),
                thickness: 0.5 + Math.random() * 1.5,
                mass: 1 + Math.random() * 0.5,
                returnSpeed: returnSpeed * (0.8 + Math.random() * 0.4),
            });
        }
    }

    for (let i = 0; i < points.length; i++) {
        const x = i % pointsX;
        const y = Math.floor(i / pointsX);
        if (x < pointsX - 1) {
            constraints.push({
                p1: i,
                p2: i + 1,
                length: spacing,
                strength: 1,
                visible: true,
            });
        }
        if (y < pointsY - 1) {
            constraints.push({
                p1: i,
                p2: i + pointsX,
                length: spacing,
                strength: 1,
                visible: true,
            });
        }
        if (x < pointsX - 1 && y < pointsY - 1) {
            constraints.push({
                p1: i,
                p2: i + pointsX + 1,
                length: Math.sqrt(spacing * spacing * 2),
                strength: 0.8,
                visible: false,
            });
        }
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cw = canvas.width;
    ch = canvas.height;
    pointsX = Math.max(10, Math.floor(cw * densityFactor));
    pointsY = Math.max(10, Math.floor(ch * densityFactor));
    initMouse();
    initSimulation();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// MOUSE EVENTS
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = ((e.clientX - rect.left) / rect.width) * cw;
    mouseY = ((e.clientY - rect.top) / rect.height) * ch;
    mouseVelX = mouseX - prevMouseX;
    mouseVelY = mouseY - prevMouseY;
    lastMouseMoveTime = Date.now();
    mouseEffectStrength = 1;
});

canvas.addEventListener("mousedown", () => {
    mouseDown = true;
    mouseDragging = false;
    selectOrRipple(mouseX, mouseY);
});

canvas.addEventListener("mouseup", () => {
    mouseDown = false;
    mouseDragging = false;
});

canvas.addEventListener("mouseleave", () => {
    mouseDown = false;
    mouseDragging = false;
    mouseOnCanvas = false;
    mouseEffectStrength = 0;
});

canvas.addEventListener("mouseenter", () => {
    mouseOnCanvas = true;
    lastMouseMoveTime = Date.now();
    mouseEffectStrength = 1;
});

// TOUCH EVENTS (named handlers, passive: false)
function handleTouchStart(e) {
    e.preventDefault();
    mouseDown = true;
    mouseDragging = false;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseX = ((touch.clientX - rect.left) / rect.width) * cw;
    mouseY = ((touch.clientY - rect.top) / rect.height) * ch;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseVelX = 0;
    mouseVelY = 0;
    mouseOnCanvas = true;
    lastMouseMoveTime = Date.now();
    mouseEffectStrength = 1;

    selectOrRipple(mouseX, mouseY);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = ((touch.clientX - rect.left) / rect.width) * cw;
    mouseY = ((touch.clientY - rect.top) / rect.height) * ch;
    mouseVelX = mouseX - prevMouseX;
    mouseVelY = mouseY - prevMouseY;
    lastMouseMoveTime = Date.now();
    mouseEffectStrength = 1;
}

function handleTouchEnd(e) {
    e.preventDefault();
    mouseDown = false;
    mouseDragging = false;
    mouseEffectStrength = 0;
}

function handleTouchCancel(e) {
    e.preventDefault();
    mouseDown = false;
    mouseDragging = false;
    mouseEffectStrength = 0;
    mouseOnCanvas = false;
}

canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
canvas.addEventListener("touchcancel", handleTouchCancel, { passive: false });

function selectOrRipple(x, y) {
    let closestDist = mouseInfluenceRadius * 0.7;
    let selectedPoint = null;
    for (let i = 0; i < points.length; i++) {
        const d = Math.hypot(points[i].x - x, points[i].y - y);
        if (d < closestDist) {
            selectedPoint = i;
            closestDist = d;
        }
    }
    if (selectedPoint === null) {
        createRipple(x, y);
    }
}

function createRipple(x, y) {
    const maxDist = 300;
    for (let i = 0; i < points.length; i++) {
        const d = Math.hypot(points[i].x - x, points[i].y - y);
        if (d < maxDist && !points[i].pinned) {
            setTimeout(() => {
                const angle =
                    Math.atan2(points[i].y - y, points[i].x - x) + Math.PI / 2;
                const force = Math.pow(1 - d / maxDist, 2) * 15;
                points[i].prevX = points[i].x - Math.cos(angle) * force;
                points[i].prevY = points[i].y - Math.sin(angle) * force;
            }, d * 0.5);
        }
    }
}

function updateEnvironment() {
    time += 0.01;
    windForce = Math.sin(time * 0.2) * 0.2 + Math.sin(time * 0.5) * 0.1;
    windDirection = time * 0.1;
    if (Math.random() < 0.001) windForce *= -1;
}

function updatePoints() {
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.pinned) continue;
        const vx = (p.x - p.prevX) * damping;
        const vy = (p.y - p.prevY) * damping;
        p.prevX = p.x;
        p.prevY = p.y;
        p.x += vx;
        p.y += vy;
        p.y += 0.25 * p.mass;

        p.x += Math.cos(windDirection + (p.y / ch) * 2) * windForce;
        p.y += Math.sin(windDirection + (p.x / cw) * 2) * windForce * 0.5;
        p.x += Math.sin(time * 0.5 + p.origY / 50) * 0.2;
        p.y += Math.cos(time * 0.4 + p.origX / 50) * 0.2;

        const dx = p.origX - p.x;
        const dy = p.origY - p.y;
        const d0 = Math.hypot(dx, dy);
        const returnStrength = p.returnSpeed * (1 + Math.pow(d0 / 100, 1.5));
        if (d0 > 0.1) {
            p.x += dx * returnStrength;
            p.y += dy * returnStrength;
        }

        if (!mouseDown && mouseOnCanvas && mouseEffectStrength > 0) {
            const dmx = p.x - mouseX;
            const dmy = p.y - mouseY;
            const d = Math.hypot(dmx, dmy);
            if (d < mouseInfluenceRadius) {
                const strength =
                    (1 - d / mouseInfluenceRadius) * 2 * mouseEffectStrength;
                p.x += dmx * strength * 0.01;
                p.y += dmy * strength * 0.01;
                const velInfluence = strength * 0.2;
                p.x += mouseVelX * velInfluence;
                p.y += mouseVelY * velInfluence;
            }
        }
    }
}

function solveConstraints() {
    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < constraints.length; i++) {
            const con = constraints[i];
            const p1 = points[con.p1],
                p2 = points[con.p2];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const d = Math.hypot(dx, dy);
            if (d === 0) continue;
            const diff = (con.length - d) / d;
            const invMass1 = p1.pinned ? 0 : 1 / p1.mass;
            const invMass2 = p2.pinned ? 0 : 1 / p2.mass;
            const invMassSum = invMass1 + invMass2;
            if (invMassSum === 0) continue;
            const ratio1 = invMass1 / invMassSum;
            const ratio2 = invMass2 / invMassSum;
            const offsetX = dx * diff * stiffness * con.strength;
            const offsetY = dy * diff * stiffness * con.strength;
            if (!p1.pinned) {
                p1.x -= offsetX * ratio1;
                p1.y -= offsetY * ratio1;
            }
            if (!p2.pinned) {
                p2.x += offsetX * ratio2;
                p2.y += offsetY * ratio2;
            }
        }
    }
}

function updateMouseEffect() {
    if (Date.now() - lastMouseMoveTime > idleThreshold) {
        mouseEffectStrength = Math.max(0, mouseEffectStrength - decayRate);
    }
}

function drawWeb() {
    ctx.fillStyle = "rgba(247, 218, 231, 1)";
    ctx.fillRect(0, 0, cw, ch);

    for (let y = 0; y < pointsY; y++) {
        ctx.beginPath();
        for (let x = 0; x < pointsX; x++) {
            const idx = x + y * pointsX;
            const p = points[idx];
            if (x === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(211,140,167,1)"; // <-- updated
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    for (let x = 0; x < pointsX; x++) {
        ctx.beginPath();
        for (let y = 0; y < pointsY; y++) {
            const idx = x + y * pointsX;
            const p = points[idx];
            if (y === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(211,140,167,1)"; // <-- updated
        ctx.lineWidth = 1.2;
        ctx.stroke();
    }

    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const d = Math.hypot(p.x - mouseX, p.y - mouseY);
        let brightness = 50;
        if (mouseOnCanvas && d < mouseInfluenceRadius) {
            brightness = Math.floor(
                50 + mouseEffectStrength * (1 - d / mouseInfluenceRadius) * 150
            );
        }
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.beginPath();
        const radius = p.pinned ? 4 : 2;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    if (mouseDown && mouseOnCanvas) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, mouseInfluenceRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function render() {
    updateMouseEffect();
    updateEnvironment();
    updatePoints();
    solveConstraints();
    drawWeb();
    requestAnimationFrame(render);
}

function randomRipples() {
    if (Math.random() < 0.02 && !mouseDown) {
        createRipple(Math.random() * cw, Math.random() * ch);
    }
    setTimeout(randomRipples, 1000);
}

render();
randomRipples();
