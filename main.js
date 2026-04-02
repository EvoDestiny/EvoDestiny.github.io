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

    async function runEntrance() {
        const greeting = document.querySelector('.greeting');
        const name = document.querySelector('.name');
        const divider = document.querySelector('.divider');
        const tagline = document.querySelector('.tagline');
        const links = document.querySelector('.links');
        const studentId = document.querySelector('.student-id');

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

        window.particleSystem.startBackground();
        window.particleSystem.enableMouseSpawn();

        // Student ID fades in quietly alongside particles
        if (studentId) {
            studentId.style.transition = 'opacity 3s ease';
            studentId.style.opacity = '1';
        }

        await new Promise(resolve => {
            setTimeout(() => {
                tagline.style.transition = 'opacity 700ms ease';
                tagline.style.opacity = '1';
                setTimeout(resolve, 700);
            }, 100);
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
