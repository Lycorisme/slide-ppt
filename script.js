// =============================================
// ANIMATED BACKGROUND — CANVAS PARTICLES + CONNECTIONS
// =============================================
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = -1000, mouseY = -1000;
let animFrame;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.15;
        const hues = [210, 250, 190, 170];
        this.hue = hues[Math.floor(Math.random() * hues.length)];
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
                const alpha = (1 - dist / 140) * 0.12;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(79, 142, 255, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
        // Mouse connection
        const mdx = particles[i].x - mouseX;
        const mdy = particles[i].y - mouseY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 180) {
            const alpha = (1 - mDist / 180) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
    }
}

function animateBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animFrame = requestAnimationFrame(animateBackground);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
document.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

resizeCanvas();
initParticles();
animateBackground();

// =============================================
// SLIDE ENGINE
// =============================================
const totalSlides = 7;
let currentSlide = 1;
let isTransitioning = false;

const progressFill = document.getElementById('progressFill');
const slideCounter = document.getElementById('slideCounter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function goToSlide(n) {
    if (isTransitioning || n < 1 || n > totalSlides || n === currentSlide) return;
    isTransitioning = true;

    const currentEl = document.getElementById(`slide-${currentSlide}`);
    const nextEl = document.getElementById(`slide-${n}`);
    const dir = n > currentSlide ? 1 : -1;

    // Exit
    currentEl.style.transform = `translateX(${dir > 0 ? '-50px' : '50px'})`;
    currentEl.style.opacity = '0';

    // Prepare enter
    nextEl.style.transition = 'none';
    nextEl.style.transform = `translateX(${dir > 0 ? '50px' : '-50px'})`;
    nextEl.style.opacity = '0';
    nextEl.classList.add('active');

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            nextEl.style.transition = '';
            nextEl.style.transform = 'translateX(0)';
            nextEl.style.opacity = '1';
        });
    });

    currentSlide = n;
    updateUI();

    setTimeout(() => {
        currentEl.classList.remove('active');
        currentEl.style.transform = '';
        currentEl.style.opacity = '';
        isTransitioning = false;
    }, 600);
}

function nextSlide() { if (currentSlide < totalSlides) goToSlide(currentSlide + 1); }
function prevSlide() { if (currentSlide > 1) goToSlide(currentSlide - 1); }

function updateUI() {
    progressFill.style.width = `${(currentSlide / totalSlides) * 100}%`;
    slideCounter.textContent = `${currentSlide} / ${totalSlides}`;
    prevBtn.style.opacity = currentSlide === 1 ? '0.15' : '';
    prevBtn.style.pointerEvents = currentSlide === 1 ? 'none' : '';
    nextBtn.style.opacity = currentSlide === totalSlides ? '0.15' : '';
    nextBtn.style.pointerEvents = currentSlide === totalSlides ? 'none' : '';
}

// Keyboard
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
            e.preventDefault(); nextSlide(); break;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
            e.preventDefault(); prevSlide(); break;
        case 'Home': e.preventDefault(); goToSlide(1); break;
        case 'End': e.preventDefault(); goToSlide(totalSlides); break;
    }
});

// Touch
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? nextSlide() : prevSlide(); }
}, { passive: true });

// Wheel
let wheelLock = null;
document.addEventListener('wheel', e => {
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = setTimeout(() => { wheelLock = null; }, 900);
    e.deltaY > 0 ? nextSlide() : prevSlide();
}, { passive: false });

// =============================================
// FULLSCREEN TOGGLE
// =============================================
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function updateFullscreenIcon() {
    const fsIcon = document.getElementById('fsIcon');
    if (document.fullscreenElement) {
        // Exit Fullscreen Icon
        fsIcon.innerHTML = '<path d="M4 14h3a2 2 0 0 1 2 2v3m0-10V5a2 2 0 0 0-2-2H4m16 11h-3a2 2 0 0 0-2 2v3m0-10V5a2 2 0 0 1 2-2h3" />';
    } else {
        // Enter Fullscreen Icon 
        fsIcon.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />';
    }
}

document.addEventListener('fullscreenchange', updateFullscreenIcon);

// Init
updateUI();
