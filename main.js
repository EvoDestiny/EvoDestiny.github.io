(() => {
    const ease = 'cubic-bezier(0.23, 1, 0.32, 1)';

    function animateIn(el, duration, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                el.style.transition = `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}`;
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                setTimeout(resolve, duration);
            }, delay);
        });
    }

    // ── Theme system ──
    let nightAmount = 0;
    let targetNight = 0;
    let animatingTheme = false;
    let starfieldReady = false;

    function lerpColor(a, b, t) {
        return a.map((v, i) => Math.round(v + (b[i] - v) * t));
    }
    function rgbStr(c) { return `rgb(${c[0]}, ${c[1]}, ${c[2]})`; }

    const dayGreeting = [44, 44, 44];
    const nightGreeting = [240, 230, 208];
    const dayTagline = [102, 102, 102];
    const nightTagline = [212, 200, 168];
    const dayLink = [170, 170, 170];
    const nightLink = [184, 168, 138];
    const dayLinkHover = [44, 44, 44];
    const nightLinkHover = [240, 230, 208];
    const dayBg = [250, 240, 215];
    const nightBg = [15, 12, 41];

    function applyColors(t) {
        const greeting = document.querySelector('.greeting');
        const tagline = document.querySelector('.tagline');
        const links = document.querySelectorAll('.links a');

        if (greeting) greeting.style.color = rgbStr(lerpColor(dayGreeting, nightGreeting, t));
        if (tagline) tagline.style.color = rgbStr(lerpColor(dayTagline, nightTagline, t));
        links.forEach(a => { a.style.color = rgbStr(lerpColor(dayLink, nightLink, t)); });

        document.body.style.setProperty('--link-hover-color', rgbStr(lerpColor(dayLinkHover, nightLinkHover, t)));
        document.body.style.setProperty('--link-underline-color', rgbStr(lerpColor([201, 162, 39], [245, 200, 66], t)));

        document.getElementById('cityDusk').style.opacity = t;
        const bg = lerpColor(dayBg, nightBg, t);
        document.body.style.background = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;

        // Toggle button adapts to theme
        const btn = document.getElementById('themeToggle');
        const icon = document.getElementById('toggleIcon');
        if (btn) {
            // Border: dark on light, light on dark
            const borderC = lerpColor([60, 60, 60], [200, 190, 160], t);
            const borderAlpha = 0.25 + t * 0.2;
            btn.style.borderColor = `rgba(${borderC[0]}, ${borderC[1]}, ${borderC[2]}, ${borderAlpha})`;
            btn.style.background = t > 0.5
                ? `rgba(255, 255, 255, ${0.04 + t * 0.06})`
                : `rgba(0, 0, 0, ${0.02 + (1 - t) * 0.03})`;
        }
        if (icon) {
            // Icon color: near-black on light, near-white on dark
            const iconC = lerpColor([50, 50, 50], [240, 235, 220], t);
            icon.style.color = rgbStr(iconC);
            // Subtle glow in dark mode
            if (t > 0.4) {
                const glowAlpha = (t - 0.4) * 0.5;
                icon.style.textShadow = `0 0 8px rgba(255, 240, 200, ${glowAlpha})`;
            } else {
                icon.style.textShadow = 'none';
            }
        }

        // ID badge adapts to theme
        const idBadge = document.getElementById('idBadge');
        if (idBadge) {
            const badgeC = lerpColor([26, 26, 26], [240, 240, 240], t);
            idBadge.style.color = rgbStr(badgeC);
            const glowBase = t > 0.5
                ? `0 0 8px rgba(240, 240, 255, ${t * 0.5}), 0 0 20px rgba(200, 200, 255, ${t * 0.3})`
                : `0 0 6px rgba(0, 0, 0, ${(1 - t) * 0.3}), 0 0 12px rgba(0, 0, 0, ${(1 - t) * 0.15})`;
            idBadge.style.textShadow = glowBase;
        }
    }

    function animateTheme(from, to, duration, cb) {
        if (animatingTheme) return;
        animatingTheme = true;
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const raw = Math.min(elapsed / duration, 1);
            const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
            nightAmount = from + (to - from) * t;
            applyColors(nightAmount);
            if (raw < 1) {
                requestAnimationFrame(tick);
            } else {
                nightAmount = to;
                animatingTheme = false;
                if (cb) cb();
            }
        }
        requestAnimationFrame(tick);
    }

    function initStarfield() {
        if (starfieldReady) return;
        starfieldReady = true;

        const starCvs = document.getElementById('duskStarsCanvas');
        const starCtx = starCvs.getContext('2d');
        let sW, sH;

        function resizeStars() {
            sW = starCvs.width = window.innerWidth;
            sH = starCvs.height = window.innerHeight;
        }
        resizeStars();
        window.addEventListener('resize', resizeStars);

        const stars = [];
        for (let i = 0; i < 120; i++) {
            stars.push({
                angle: Math.random() * Math.PI * 2,
                dist: Math.random() * Math.max(sW, sH) * 0.8,
                size: 0.5 + Math.random() * 2,
                twinkleSpeed: 0.005 + Math.random() * 0.015,
                twinklePhase: Math.random() * Math.PI * 2,
                brightness: 0.3 + Math.random() * 0.7
            });
        }

        const meteors = [];
        function spawnMeteor() {
            meteors.push({
                x: Math.random() * sW * 0.8 + sW * 0.1,
                y: Math.random() * sH * 0.3,
                vx: 4 + Math.random() * 6,
                vy: 2 + Math.random() * 4,
                len: 40 + Math.random() * 80,
                life: 1,
                decay: 0.012 + Math.random() * 0.01
            });
        }

        let rotAngle = 0, starTime = 0;

        function renderStars() {
            starCtx.clearRect(0, 0, sW, sH);
            const cx = sW / 2, cy = sH * 0.35;
            rotAngle += 0.00008;
            starTime += 1;
            const vis = nightAmount;

            for (const s of stars) {
                const a = s.angle + rotAngle;
                const x = cx + Math.cos(a) * s.dist;
                const y = cy + Math.sin(a) * s.dist;
                if (x < -10 || x > sW + 10 || y < -10 || y > sH + 10) continue;
                const twinkle = 0.4 + 0.6 * Math.sin(starTime * s.twinkleSpeed + s.twinklePhase);
                const alpha = s.brightness * twinkle * vis;
                if (alpha < 0.01) continue;
                starCtx.beginPath();
                starCtx.arc(x, y, s.size, 0, Math.PI * 2);
                starCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                starCtx.fill();
            }

            if (vis > 0.3 && Math.random() < 0.006) spawnMeteor();
            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];
                m.x += m.vx; m.y += m.vy; m.life -= m.decay;
                if (m.life <= 0) { meteors.splice(i, 1); continue; }
                const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
                const tailX = m.x - (m.vx / speed) * m.len * m.life;
                const tailY = m.y - (m.vy / speed) * m.len * m.life;
                const grad = starCtx.createLinearGradient(tailX, tailY, m.x, m.y);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                grad.addColorStop(1, `rgba(255, 255, 255, ${m.life * 0.9 * vis})`);
                starCtx.beginPath(); starCtx.moveTo(tailX, tailY); starCtx.lineTo(m.x, m.y);
                starCtx.strokeStyle = grad; starCtx.lineWidth = 1.5; starCtx.stroke();
                starCtx.beginPath(); starCtx.arc(m.x, m.y, 1.5, 0, Math.PI * 2);
                starCtx.fillStyle = `rgba(255, 250, 230, ${m.life * vis})`; starCtx.fill();
            }

            requestAnimationFrame(renderStars);
        }
        renderStars();
    }

    // ── Toggle logic ──
    let isDark = false;
    const toggleBtn = document.getElementById('themeToggle');
    const toggleIcon = document.getElementById('toggleIcon');

    function updateIcon() {
        toggleIcon.textContent = isDark ? '☽' : '☀';
    }

    function setTheme(dark, animate) {
        isDark = dark;
        targetNight = dark ? 1 : 0;
        updateIcon();
        initStarfield();

        if (animate) {
            animateTheme(nightAmount, targetNight, 1800);
        } else {
            nightAmount = targetNight;
            applyColors(nightAmount);
        }
    }

    toggleBtn.addEventListener('click', () => {
        if (animatingTheme) return;
        setTheme(!isDark, true);
    });

    // ── Daytime background ──
    function initDayBackground() {
        const cvs = document.getElementById('dayBgCanvas');
        const ctx = cvs.getContext('2d');
        let W, H;

        function resize() { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
        resize();
        window.addEventListener('resize', resize);

        const orbs = [];
        for (let i = 0; i < 8; i++) {
            orbs.push({
                x: Math.random() * W, y: Math.random() * H,
                r: 120 + Math.random() * 250,
                vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.15,
                hue: 35 + Math.random() * 15, sat: 30 + Math.random() * 30,
                light: 88 + Math.random() * 8, alpha: 0.04 + Math.random() * 0.06,
                phase: Math.random() * Math.PI * 2, breatheSpeed: 0.003 + Math.random() * 0.004
            });
        }

        const motes = [];
        for (let i = 0; i < 35; i++) {
            motes.push({
                x: Math.random() * W, y: Math.random() * H,
                r: 1 + Math.random() * 2,
                vx: (Math.random() - 0.5) * 0.3, vy: -(0.1 + Math.random() * 0.25),
                alpha: 0.08 + Math.random() * 0.15,
                phase: Math.random() * Math.PI * 2, wobbleSpeed: 0.01 + Math.random() * 0.02
            });
        }

        let t = 0;
        function render() {
            ctx.clearRect(0, 0, W, H);
            t += 1;
            const dayVis = 1 - nightAmount;

            for (const o of orbs) {
                o.x += o.vx; o.y += o.vy;
                if (o.x < -o.r) o.x = W + o.r; if (o.x > W + o.r) o.x = -o.r;
                if (o.y < -o.r) o.y = H + o.r; if (o.y > H + o.r) o.y = -o.r;
                const breathe = 1 + 0.15 * Math.sin(t * o.breatheSpeed + o.phase);
                const curR = o.r * breathe;
                const curAlpha = o.alpha * (0.7 + 0.3 * Math.sin(t * o.breatheSpeed * 0.7 + o.phase)) * dayVis;
                if (curAlpha < 0.005) continue;
                const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, curR);
                grad.addColorStop(0, `hsla(${o.hue}, ${o.sat}%, ${o.light}%, ${curAlpha})`);
                grad.addColorStop(0.6, `hsla(${o.hue}, ${o.sat}%, ${o.light}%, ${curAlpha * 0.3})`);
                grad.addColorStop(1, 'hsla(0, 0%, 100%, 0)');
                ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(o.x, o.y, curR, 0, Math.PI * 2); ctx.fill();
            }

            for (const m of motes) {
                m.x += m.vx + Math.sin(t * m.wobbleSpeed + m.phase) * 0.3; m.y += m.vy;
                if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
                if (m.x < -10) m.x = W + 10; if (m.x > W + 10) m.x = -10;
                const flicker = 0.6 + 0.4 * Math.sin(t * 0.02 + m.phase);
                const a = m.alpha * flicker * dayVis;
                if (a < 0.005) continue;
                ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201, 170, 80, ${a})`; ctx.fill();
            }

            requestAnimationFrame(render);
        }
        render();
    }

    // ── Entrance sequence ──
    async function runEntrance() {
        // Detect browser preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Start in the OPPOSITE theme (no animation)
        initDayBackground();
        setTheme(!prefersDark, false);

        const greeting = document.querySelector('.greeting');
        const name = document.querySelector('.name');
        const divider = document.querySelector('.divider');
        const tagline = document.querySelector('.tagline');
        const links = document.querySelector('.links');

        await animateIn(greeting, 1400, 300);
        await animateIn(name, 1600, 100);
        name.style.animationPlayState = 'running';

        await new Promise(resolve => {
            setTimeout(() => {
                divider.style.transition = `width 800ms ${ease}, opacity 600ms ease`;
                divider.style.opacity = '1';
                divider.style.width = '120px';
                setTimeout(resolve, 800);
            }, 200);
        });

        // After divider completes, animate to the user's actual preferred theme
        setTheme(prefersDark, true);

        window.particleSystem.startBackground();
        window.particleSystem.enableMouseSpawn();

        // Show toggle button after divider
        toggleBtn.classList.add('visible');

        await new Promise(resolve => {
            setTimeout(() => {
                tagline.style.transition = 'opacity 700ms ease';
                tagline.style.opacity = '1';
                setTimeout(resolve, 700);
            }, 800);
        });

        startTyping();

        await new Promise(resolve => {
            setTimeout(() => {
                links.style.transition = `opacity 900ms ${ease}, transform 900ms ${ease}`;
                links.style.opacity = '1';
                links.style.transform = 'translateY(0)';
                setTimeout(resolve, 900);
            }, 600);
        });
    }

    const phrases = [
        "Developer & Creator.",
        "Crafting elegant digital experiences.",
        "Passionate about clean code & design."
    ];
    const typedEl = document.getElementById('typed-text');
    let phraseIdx = 0, charIdx = 0, deleting = false;

    function typeStep() {
        const current = phrases[phraseIdx];
        let delay;

        if (!deleting) {
            charIdx++;
            typedEl.textContent = current.substring(0, charIdx);
            if (charIdx === current.length) {
                deleting = true;
                delay = 2200;
            } else {
                delay = 65 + Math.random() * 45;
            }
        } else {
            charIdx--;
            typedEl.textContent = current.substring(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                delay = 500;
            } else {
                delay = 30;
            }
        }
        setTimeout(typeStep, delay);
    }

    function startTyping() {
        setTimeout(typeStep, 400);
    }

    runEntrance();
})();
