(() => {
    // ── Background particle system ──
    const cvs = document.getElementById('bgCanvas');
    const ctx = cvs.getContext('2d');
    let W, H;
    const mouse = { x: -500, y: -500 };
    const MOUSE_RADIUS = 150;

    function resize() {
        W = cvs.width = window.innerWidth;
        H = cvs.height = window.innerHeight;
        mW = mCanvas.width = window.innerWidth;
        mH = mCanvas.height = window.innerHeight;
    }

    const symbols = ['{', '}', '<', '/>', '()', '=>', '[]', ';', '#', '&&', '||', '::', '**', '>>'];

    class Particle {
        constructor() { this.reset(true); }

        reset(init) {
            this.x = Math.random() * W;
            this.y = init ? Math.random() * H : H + 20;
            this.depth = 0.3 + Math.random() * 0.7;
            this.size = 8 + Math.random() * 6;
            this.baseAlpha = 0.04 + Math.random() * 0.08;
            this.alpha = this.baseAlpha;
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = -(0.12 + Math.random() * 0.2) * this.depth;
            this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.003;
        }

        update() {
            this.rotation += this.rotSpeed;
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
                const force = (1 - dist / MOUSE_RADIUS) * 0.8;
                this.x += dx / dist * force;
                this.y += dy / dist * force;
                this.alpha = this.baseAlpha + (0.25 - this.baseAlpha) * (1 - dist / MOUSE_RADIUS);
            } else {
                this.alpha += (this.baseAlpha - this.alpha) * 0.03;
            }

            this.x += this.vx;
            this.y += this.vy;

            if (this.y < -30 || this.x < -30 || this.x > W + 30) {
                this.reset(false);
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `${this.size * this.depth}px 'Inter', monospace`;
            ctx.fillStyle = `rgba(185, 148, 30, ${this.alpha})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }

    const particles = Array.from({ length: 55 }, () => new Particle());

    function drawConnections() {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * Math.min(a.alpha, b.alpha) * 2.5;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(201, 162, 39, ${opacity})`;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }
        }
    }

    function renderLoop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(renderLoop);
    }

    // ── Mouse interactive particles ──
    const mCanvas = document.createElement('canvas');
    mCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2';
    document.body.appendChild(mCanvas);
    const mCtx = mCanvas.getContext('2d');
    let mW, mH;

    const mMouse = { x: -200, y: -200, moving: false };
    let mIdleTimer = null;
    const dots = [];
    const M_MAX = 18;
    const M_LINE = 90;
    let lastSpawnX = 0, lastSpawnY = 0;
    let mSpawning = false;

    class Dot {
        constructor(x, y) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.0;
            this.x = x;
            this.y = y;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.radius = 1.5 + Math.random() * 1.5;
            this.alpha = 1;
            this.life = 1;
            this.decay = 0.006 + Math.random() * 0.004;
            this.orbitAngle = angle;
            this.orbitRadius = 25 + Math.random() * 45;
            this.orbitSpeed = (0.003 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1);
        }
        update() {
            if (!mMouse.moving) {
                this.orbitAngle += this.orbitSpeed;
                const tx = mMouse.x + Math.cos(this.orbitAngle) * this.orbitRadius;
                const ty = mMouse.y + Math.sin(this.orbitAngle) * this.orbitRadius;
                this.vx += (tx - this.x) * 0.0015;
                this.vy += (ty - this.y) * 0.0015;
                this.vx *= 0.97;
                this.vy *= 0.97;
                this.life -= this.decay * 0.3;
            } else {
                this.vx *= 0.995;
                this.vy *= 0.995;
                this.life -= this.decay;
            }
            this.x += this.vx;
            this.y += this.vy;
            this.alpha = Math.max(0, this.life);
        }
        draw() {
            mCtx.beginPath();
            mCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            mCtx.fillStyle = `rgba(201, 162, 39, ${this.alpha * 0.7})`;
            mCtx.fill();
        }
    }

    function mDrawLines() {
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < M_LINE) {
                    const op = (1 - dist / M_LINE) * Math.min(dots[i].alpha, dots[j].alpha) * 0.4;
                    mCtx.beginPath();
                    mCtx.moveTo(dots[i].x, dots[i].y);
                    mCtx.lineTo(dots[j].x, dots[j].y);
                    mCtx.strokeStyle = `rgba(201, 162, 39, ${op})`;
                    mCtx.lineWidth = 0.6;
                    mCtx.stroke();
                }
            }
        }
    }

    function mAnimate() {
        mCtx.clearRect(0, 0, mW, mH);
        for (let i = dots.length - 1; i >= 0; i--) {
            if (dots[i].life <= 0) dots.splice(i, 1);
        }
        dots.forEach(d => { d.update(); d.draw(); });
        mDrawLines();
        requestAnimationFrame(mAnimate);
    }

    // ── Event listeners ──
    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mMouse.x = e.clientX;
        mMouse.y = e.clientY;
        mMouse.moving = true;
        const dx = e.clientX - lastSpawnX;
        const dy = e.clientY - lastSpawnY;
        if (mSpawning && dx * dx + dy * dy > 625 && dots.length < M_MAX) {
            dots.push(new Dot(e.clientX, e.clientY));
            lastSpawnX = e.clientX;
            lastSpawnY = e.clientY;
        }
        clearTimeout(mIdleTimer);
        mIdleTimer = setTimeout(() => { mMouse.moving = false; }, 120);
    });

    resize();
    window.addEventListener('resize', resize);
    mAnimate();

    // ── Expose controls for entrance sequence ──
    window.particleSystem = {
        startBackground: renderLoop,
        enableMouseSpawn: () => { mSpawning = true; }
    };
})();
