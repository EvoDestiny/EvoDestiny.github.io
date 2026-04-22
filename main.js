(() => {
    const ease = 'cubic-bezier(0.23, 1, 0.32, 1)';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const manifestUrl = 'vault/records.json';
    const vaultMetaFile = '__vault.json';
    const textDecoder = new TextDecoder();
    const textEncoder = new TextEncoder();

    const phrases = [
        'Developer & Creator.',
        'Crafting elegant digital experiences.',
        'Passionate about clean code & design.'
    ];

    const mimeTypes = {
        '.css': 'text/css; charset=utf-8',
        '.gif': 'image/gif',
        '.html': 'text/html; charset=utf-8',
        '.ico': 'image/x-icon',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.mjs': 'text/javascript; charset=utf-8',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.otf': 'font/otf',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.ttf': 'font/ttf',
        '.txt': 'text/plain; charset=utf-8',
        '.webm': 'video/webm',
        '.webp': 'image/webp',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
    };

    const typedEl = document.getElementById('typed-text');
    const overlay = document.getElementById('project-overlay');
    const panel = overlay?.querySelector('.project-panel') || null;
    const trigger = document.getElementById('projects-trigger');
    const closeButton = document.getElementById('project-close');
    const projectList = document.getElementById('project-list');
    const tokenOverlay = document.getElementById('token-overlay');
    const tokenPanel = tokenOverlay?.querySelector('.token-panel') || null;
    const tokenForm = document.getElementById('token-form');
    const tokenMeta = document.getElementById('token-meta');
    const tokenTitle = document.getElementById('token-title');
    const tokenDescription = document.getElementById('token-description');
    const tokenInput = document.getElementById('token-input');
    const tokenStatus = document.getElementById('token-status');
    const tokenClose = document.getElementById('token-close');
    const tokenCancel = document.getElementById('token-cancel');
    const tokenSubmit = document.getElementById('token-submit');

    const state = {
        activeRecord: null,
        bundleCache: new Map(),
        closeTimer: 0,
        manifestError: '',
        manifestLoaded: false,
        projects: [],
        tokenTimer: 0,
        unlocking: false
    };

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let lastFocusedElement = null;
    let decryptWorker = null;
    let decryptMessageId = 0;

    const pendingDecryptions = new Map();

    function animateIn(el, duration, delay) {
        if (!el) return Promise.resolve();

        if (reduceMotion) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            setTimeout(() => {
                el.style.transition = `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}`;
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                setTimeout(resolve, duration);
            }, delay);
        });
    }

    function normalizeBundlePath(filePath) {
        const segments = filePath.replace(/\\/g, '/').split('/');
        const resolved = [];

        for (const segment of segments) {
            if (!segment || segment === '.') continue;
            if (segment === '..') {
                resolved.pop();
                continue;
            }

            resolved.push(segment);
        }

        return resolved.join('/');
    }

    function dirnamePosix(filePath) {
        const normalized = normalizeBundlePath(filePath);
        const index = normalized.lastIndexOf('/');
        return index === -1 ? '' : normalized.slice(0, index);
    }

    function isExternalReference(reference) {
        return /^(?:[a-z]+:|\/\/|#|data:|blob:|mailto:|tel:)/i.test(reference) || reference.startsWith('/');
    }

    function resolveBundleReference(currentFilePath, reference) {
        const trimmed = reference.trim();

        if (!trimmed || isExternalReference(trimmed)) {
            return null;
        }

        const withoutQuery = trimmed.split('#')[0].split('?')[0];
        if (!withoutQuery) {
            return null;
        }

        const currentDir = dirnamePosix(currentFilePath);
        return normalizeBundlePath(currentDir ? `${currentDir}/${withoutQuery}` : withoutQuery);
    }

    function getMimeType(filePath) {
        const extension = `.${filePath.split('.').pop().toLowerCase()}`;
        return mimeTypes[extension] || 'application/octet-stream';
    }

    function base64ToBytes(base64Value) {
        const binary = window.atob(base64Value);
        const bytes = new Uint8Array(binary.length);

        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }

        return bytes;
    }

    function handleDecryptWorkerMessage(event) {
        const payload = event.data || {};
        const pending = pendingDecryptions.get(payload.id);

        if (!pending) return;

        pendingDecryptions.delete(payload.id);

        if (!payload.ok) {
            pending.reject(new Error(payload.error || 'Unable to unlock this record.'));
            return;
        }

        pending.resolve(new Uint8Array(payload.archiveBytes));
    }

    function resetDecryptWorker(message = 'Decryptor unavailable in this browser.') {
        if (decryptWorker) {
            decryptWorker.removeEventListener('message', handleDecryptWorkerMessage);
            decryptWorker.terminate();
            decryptWorker = null;
        }

        for (const pending of pendingDecryptions.values()) {
            pending.reject(new Error(message));
        }

        pendingDecryptions.clear();
    }

    function handleDecryptWorkerFailure() {
        resetDecryptWorker('This browser could not start the archive decryptor.');
    }

    function getDecryptWorker() {
        if (decryptWorker) {
            return decryptWorker;
        }

        if (typeof window.Worker !== 'function') {
            throw new Error('This browser does not support the current archive format.');
        }

        decryptWorker = new Worker('vault-worker.js');
        decryptWorker.addEventListener('message', handleDecryptWorkerMessage);
        decryptWorker.addEventListener('error', handleDecryptWorkerFailure);
        decryptWorker.addEventListener('messageerror', handleDecryptWorkerFailure);

        return decryptWorker;
    }

    async function decryptBundle(bundlePayload, token) {
        if (!bundlePayload || bundlePayload.version !== 2 || !bundlePayload.kdf || bundlePayload.kdf.name !== 'Argon2id') {
            throw new Error('Archive format is outdated and must be resealed.');
        }

        try {
            const worker = getDecryptWorker();

            return await new Promise((resolve, reject) => {
                const id = decryptMessageId;
                decryptMessageId += 1;

                pendingDecryptions.set(id, { resolve, reject });

                try {
                    worker.postMessage({
                        id,
                        token,
                        bundlePayload
                    });
                } catch (error) {
                    pendingDecryptions.delete(id);
                    reject(new Error('Unable to start archive decryption.'));
                }
            });
        } catch (error) {
            throw error instanceof Error ? error : new Error('Unable to unlock this record.');
        }
    }

    function unpackArchive(archiveBytes) {
        if (!window.fflate || typeof window.fflate.unzipSync !== 'function') {
            throw new Error('Archive library unavailable.');
        }

        const unzipped = window.fflate.unzipSync(archiveBytes);
        const fileMap = new Map();

        Object.entries(unzipped).forEach(([filePath, bytes]) => {
            fileMap.set(normalizeBundlePath(filePath), bytes);
        });

        return fileMap;
    }

    function readVaultMeta(fileMap) {
        const metaBytes = fileMap.get(vaultMetaFile);

        if (!metaBytes) {
            throw new Error('Vault metadata missing from archive.');
        }

        try {
            return JSON.parse(textDecoder.decode(metaBytes));
        } catch (error) {
            throw new Error('Vault metadata is invalid.');
        }
    }

    function rewriteCssUrls(cssText, currentFilePath, createResourceUrl) {
        return cssText
            .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, quote, value) => {
                const resolved = resolveBundleReference(currentFilePath, value);
                if (!resolved) return match;

                const resourceUrl = createResourceUrl(resolved);
                return resourceUrl ? `url("${resourceUrl}")` : match;
            })
            .replace(/@import\s+(?:url\(\s*)?(['"])([^'"]+)\1\s*\)?/gi, (match, quote, value) => {
                const resolved = resolveBundleReference(currentFilePath, value);
                if (!resolved) return match;

                const resourceUrl = createResourceUrl(resolved);
                return resourceUrl ? `@import url("${resourceUrl}")` : match;
            });
    }

    function rewriteDocumentResources(doc, entryPath, createResourceUrl) {
        const selectors = [
            ['link[href]', 'href'],
            ['script[src]', 'src'],
            ['img[src]', 'src'],
            ['source[src]', 'src'],
            ['video[src]', 'src'],
            ['audio[src]', 'src'],
            ['iframe[src]', 'src']
        ];

        selectors.forEach(([selector, attribute]) => {
            doc.querySelectorAll(selector).forEach(element => {
                const reference = element.getAttribute(attribute);
                if (!reference) return;

                if (element.tagName === 'LINK') {
                    const relation = (element.getAttribute('rel') || '').toLowerCase();
                    if (relation && !relation.includes('stylesheet') && !relation.includes('icon')) {
                        return;
                    }
                }

                const resolved = resolveBundleReference(entryPath, reference);
                if (!resolved) return;

                const resourceUrl = createResourceUrl(resolved);
                if (resourceUrl) {
                    element.setAttribute(attribute, resourceUrl);
                }
            });
        });

        doc.querySelectorAll('style').forEach(styleTag => {
            styleTag.textContent = rewriteCssUrls(styleTag.textContent || '', entryPath, createResourceUrl);
        });

        doc.querySelectorAll('[style]').forEach(element => {
            const inlineStyle = element.getAttribute('style');
            if (!inlineStyle) return;

            element.setAttribute('style', rewriteCssUrls(inlineStyle, entryPath, createResourceUrl));
        });
    }

    function buildViewerUrl(record, fileMap) {
        const meta = readVaultMeta(fileMap);
        const entryPath = normalizeBundlePath(meta.entry);
        const entryBytes = fileMap.get(entryPath);

        if (!entryBytes) {
            throw new Error('Entry document missing from archive.');
        }

        const assetUrls = [];
        const urlCache = new Map();

        function createTrackedUrl(blob) {
            const url = URL.createObjectURL(blob);
            assetUrls.push(url);
            return url;
        }

        function createResourceUrl(filePath) {
            const normalizedPath = normalizeBundlePath(filePath);

            if (urlCache.has(normalizedPath)) {
                return urlCache.get(normalizedPath);
            }

            const bytes = fileMap.get(normalizedPath);
            if (!bytes || normalizedPath === vaultMetaFile) {
                return null;
            }

            let payload = bytes;
            const mimeType = getMimeType(normalizedPath);

            if (mimeType.startsWith('text/css')) {
                const rewrittenCss = rewriteCssUrls(textDecoder.decode(bytes), normalizedPath, createResourceUrl);
                payload = textEncoder.encode(rewrittenCss);
            }

            const resourceUrl = createTrackedUrl(new Blob([payload], { type: mimeType }));
            urlCache.set(normalizedPath, resourceUrl);
            return resourceUrl;
        }

        const doc = new DOMParser().parseFromString(textDecoder.decode(entryBytes), 'text/html');
        rewriteDocumentResources(doc, entryPath, createResourceUrl);

        if (!doc.querySelector('title')) {
            const title = doc.createElement('title');
            title.textContent = record.label;
            doc.head.appendChild(title);
        }

        const cleanupScript = doc.createElement('script');
        cleanupScript.textContent = `window.addEventListener('pagehide', function () {
    const urls = ${JSON.stringify(assetUrls)};
    for (const url of urls) {
        try { URL.revokeObjectURL(url); } catch (error) {}
    }
});`;
        doc.body.appendChild(cleanupScript);

        const viewerHtml = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
        return URL.createObjectURL(new Blob([viewerHtml], { type: 'text/html; charset=utf-8' }));
    }

    function writeViewerPlaceholder(viewerWindow, label) {
        viewerWindow.document.open();
        viewerWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unlocking ${label}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --card-bg: #faf9f5;
            --card-surface: #ffffff;
            --card-text: #171615;
            --card-muted: #6f6a63;
            --card-border: #d8d2c8;
            --card-border-strong: #cbc4ba;
            --card-shadow: 0 1px 0 rgba(255, 255, 255, 0.75), 0 20px 44px rgba(48, 38, 20, 0.08);
            --card-button: #171615;
        }
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 20px;
            font-family: Inter, sans-serif;
            background: var(--card-bg);
            color: var(--card-text);
        }
        main {
            width: min(640px, 100%);
            text-align: center;
        }
        h1 {
            margin: 0 auto;
            width: min(100%, 35rem);
            font-family: "Cormorant Garamond", "Times New Roman", serif;
            font-size: clamp(4rem, 9vw, 5.3rem);
            line-height: 0.93;
            font-weight: 500;
            letter-spacing: -0.04em;
            text-wrap: balance;
        }
        p {
            margin: 0;
            color: var(--card-muted);
        }
        .description {
            margin: 0.9rem auto 0;
            width: min(100%, 35rem);
            font-family: "Cormorant Garamond", "Times New Roman", serif;
            font-size: clamp(1.15rem, 2.8vw, 1.4rem);
            font-weight: 500;
            line-height: 1.1;
            color: var(--card-text);
            text-wrap: pretty;
        }
        .card {
            margin-top: 2rem;
            padding: clamp(1.15rem, 2.8vw, 1.55rem);
            border: 1px solid var(--card-border);
            border-radius: 2rem;
            background: var(--card-bg);
            box-shadow: var(--card-shadow);
        }
        .status {
            display: grid;
            gap: 0.9rem;
        }
        .status-badge {
            width: 100%;
            min-height: 3.45rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.9rem 1.2rem;
            border-radius: 0.95rem;
            background: var(--card-button);
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            box-sizing: border-box;
        }
        .status-note {
            max-width: 46ch;
            margin: 0 auto;
            font-size: 0.84rem;
            line-height: 1.5;
            color: var(--card-muted);
        }
        @media (max-width: 640px) {
            body {
                padding: 14px;
            }
            .card {
                border-radius: 1.65rem;
            }
        }
    </style>
</head>
<body>
    <main>
        <h1>${label}</h1>
        <p class="description">Your archive is being decrypted locally and prepared in a new browser tab.</p>
        <section class="card" aria-label="Archive status">
            <div class="status">
                <div class="status-badge">Opening archive</div>
                <p class="status-note">Please wait while the sealed bundle is unpacked and loaded from this browser session.</p>
            </div>
        </section>
    </main>
</body>
</html>`);
        viewerWindow.document.close();
    }

    async function fetchBundlePayload(record) {
        if (state.bundleCache.has(record.id)) {
            return state.bundleCache.get(record.id);
        }

        const pending = fetch(record.bundle, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Archive bundle is unavailable.');
                }

                return response.json();
            });

        state.bundleCache.set(record.id, pending);

        try {
            return await pending;
        } catch (error) {
            state.bundleCache.delete(record.id);
            throw error;
        }
    }

    function setTokenStatus(message, tone = '') {
        if (!tokenStatus) return;

        tokenStatus.textContent = message;
        if (tone) {
            tokenStatus.dataset.tone = tone;
        } else {
            delete tokenStatus.dataset.tone;
        }
    }

    function setUnlockBusy(isBusy) {
        state.unlocking = isBusy;

        if (tokenInput) tokenInput.disabled = isBusy;
        if (tokenSubmit) tokenSubmit.disabled = isBusy;
        if (tokenCancel) tokenCancel.disabled = isBusy;
        if (tokenClose) tokenClose.disabled = isBusy;
    }

    function restoreFocus() {
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus({ preventScroll: true });
        }
    }

    function getActiveDialogRoot() {
        if (tokenOverlay && !tokenOverlay.hidden) {
            return tokenPanel;
        }

        if (overlay && !overlay.hidden) {
            return panel;
        }

        return null;
    }

    function getDialogFocusables(root) {
        if (!root) return [];

        return [...root.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    }

    function closeTokenPrompt(options = {}) {
        const { restorePanelFocus = true } = options;

        if (!tokenOverlay || tokenOverlay.hidden) return;

        window.clearTimeout(state.tokenTimer);
        tokenOverlay.classList.remove('is-open');
        tokenOverlay.setAttribute('aria-hidden', 'true');

        const finishClose = () => {
            tokenOverlay.hidden = true;
            state.activeRecord = null;
            setTokenStatus('');
            if (tokenForm) tokenForm.reset();
            if (restorePanelFocus && panel && !overlay.hidden) {
                panel.focus({ preventScroll: true });
            }
        };

        if (reduceMotion) {
            finishClose();
            return;
        }

        state.tokenTimer = window.setTimeout(finishClose, 360);
    }

    function openTokenPrompt(recordId) {
        if (!tokenOverlay || !tokenPanel || !tokenTitle || !tokenInput) return;

        const record = state.projects.find(project => project.id === recordId);
        if (!record) return;

        state.activeRecord = record;
        tokenTitle.textContent = 'Enter your token';
        if (tokenMeta) {
            tokenMeta.textContent = `${record.label} · ${record.id.toUpperCase()}`;
        }
        if (tokenDescription) {
            tokenDescription.textContent = `Use the access token for ${record.label}. The archive is decrypted locally in your browser and opens in a new tab.`;
        }
        setTokenStatus('');
        if (tokenForm) tokenForm.reset();
        setUnlockBusy(false);

        tokenOverlay.hidden = false;
        tokenOverlay.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            tokenOverlay.classList.add('is-open');
        });

        if (reduceMotion) {
            tokenInput.focus({ preventScroll: true });
            return;
        }

        window.setTimeout(() => {
            tokenInput.focus({ preventScroll: true });
        }, 120);
    }

    function renderProjects() {
        if (!projectList) return;

        projectList.innerHTML = '';

        const appendRow = ({
            idText = '',
            label,
            meta = '',
            access,
            actionLabel,
            disabled = false,
            taskId = '',
            accessClass = ''
        }, index) => {
            const row = document.createElement('article');
            row.className = 'project-row';
            row.style.setProperty('--stagger', index);

            const record = document.createElement('div');
            record.className = 'project-record';

            const recordLabel = document.createElement('span');
            recordLabel.className = 'project-record-label';
            recordLabel.textContent = label;

            const recordMeta = document.createElement('span');
            recordMeta.className = 'project-record-meta';
            recordMeta.textContent = meta;

            if (idText) {
                const recordId = document.createElement('span');
                recordId.className = 'project-record-id';
                recordId.textContent = idText;
                record.append(recordId);
            }

            record.append(recordLabel, recordMeta);

            const accessNode = document.createElement('span');
            accessNode.className = `project-access${accessClass ? ` ${accessClass}` : ''}`;
            accessNode.textContent = access;

            const action = document.createElement('button');
            action.type = 'button';
            action.className = `project-action${disabled ? ' is-disabled' : ''}`;
            action.textContent = actionLabel;
            action.disabled = disabled;
            action.setAttribute('aria-label', `${actionLabel} ${label}`);
            if (taskId) {
                action.dataset.taskId = taskId;
            }

            row.append(record, accessNode, action);
            projectList.appendChild(row);
        };

        if (!state.manifestLoaded && !state.manifestError) {
            appendRow({
                label: 'Project archive',
                meta: 'Preparing sealed records',
                access: 'Loading',
                actionLabel: 'Wait',
                disabled: true,
                accessClass: 'is-unavailable'
            }, 0);
            return;
        }

        if (state.manifestError) {
            appendRow({
                label: 'Project archive',
                meta: 'Manifest could not be reached',
                access: 'Offline',
                actionLabel: 'Unavailable',
                disabled: true,
                accessClass: 'is-unavailable'
            }, 0);
            return;
        }

        if (!state.projects.length) {
            appendRow({
                label: 'Project archive',
                meta: 'No sealed records are published yet',
                access: 'Empty',
                actionLabel: 'Unavailable',
                disabled: true,
                accessClass: 'is-unavailable'
            }, 0);
            return;
        }

        state.projects.forEach((project, index) => {
            appendRow({
                label: project.label,
                meta: project.state === 'sealed' ? 'Access token required to unlock locally' : 'Published archive',
                access: project.state === 'sealed' ? 'Sealed' : 'Open',
                actionLabel: 'Continue',
                disabled: false,
                taskId: project.id
            }, index);
        });
    }

    async function loadProjectManifest() {
        renderProjects();

        try {
            const response = await fetch(manifestUrl, { cache: 'no-store' });

            if (!response.ok) {
                throw new Error('Project archive manifest is unavailable.');
            }

            const payload = await response.json();
            state.projects = Array.isArray(payload.tasks) ? payload.tasks : [];
            state.manifestError = '';
        } catch (error) {
            state.projects = [];
            state.manifestError = error instanceof Error ? error.message : 'Project archive manifest failed to load.';
        } finally {
            state.manifestLoaded = true;
            renderProjects();
        }
    }

    function openProjects() {
        if (!overlay || !panel || overlay.classList.contains('is-open')) return;

        window.clearTimeout(state.closeTimer);
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        overlay.hidden = false;
        overlay.setAttribute('aria-hidden', 'false');
        trigger?.setAttribute('aria-expanded', 'true');
        document.body.classList.add('modal-open');

        requestAnimationFrame(() => {
            overlay.classList.add('is-open');
        });

        if (reduceMotion) {
            panel.focus({ preventScroll: true });
            return;
        }

        window.setTimeout(() => {
            panel.focus({ preventScroll: true });
        }, 220);
    }

    function closeProjects(options = {}) {
        const { restorePageFocus = true } = options;

        if (!overlay || !overlay.classList.contains('is-open')) return;

        if (tokenOverlay && !tokenOverlay.hidden) {
            closeTokenPrompt({ restorePanelFocus: false });
        }

        window.clearTimeout(state.closeTimer);
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        trigger?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('modal-open');

        const finishClose = () => {
            overlay.hidden = true;
            if (restorePageFocus) {
                restoreFocus();
            }
        };

        if (reduceMotion) {
            finishClose();
            return;
        }

        state.closeTimer = window.setTimeout(finishClose, 540);
    }

    async function unlockActiveRecord(event) {
        event.preventDefault();

        if (!state.activeRecord || !tokenInput) return;

        const token = tokenInput.value.trim();
        if (!token) {
            setTokenStatus('Enter the token to unseal this record.', 'error');
            tokenInput.focus({ preventScroll: true });
            return;
        }

        const viewerWindow = window.open('', '_blank');
        if (!viewerWindow) {
            setTokenStatus('Popup blocked. Allow popups for this site first.', 'error');
            return;
        }

        writeViewerPlaceholder(viewerWindow, state.activeRecord.label);
        setUnlockBusy(true);
        setTokenStatus('Decrypting archive...', 'success');

        try {
            const bundlePayload = await fetchBundlePayload(state.activeRecord);
            const archiveBytes = await decryptBundle(bundlePayload, token);
            const fileMap = unpackArchive(archiveBytes);
            const viewerUrl = buildViewerUrl(state.activeRecord, fileMap);

            viewerWindow.location.replace(viewerUrl);
            setTokenStatus('Record unsealed. Opening in a new tab...', 'success');
            closeTokenPrompt({ restorePanelFocus: false });
            closeProjects({ restorePageFocus: false });
        } catch (error) {
            viewerWindow.close();
            setTokenStatus(error instanceof Error ? error.message : 'Unable to unlock this record.', 'error');
            tokenInput.focus({ preventScroll: true });
            tokenInput.select();
        } finally {
            setUnlockBusy(false);
        }
    }

    function handleGlobalKeydown(event) {
        if (tokenOverlay && !tokenOverlay.hidden) {
            if (event.key === 'Escape' && !state.unlocking) {
                closeTokenPrompt();
                return;
            }
        } else if (overlay && !overlay.hidden) {
            if (event.key === 'Escape') {
                closeProjects();
                return;
            }
        } else {
            return;
        }

        if (event.key !== 'Tab') return;

        const root = getActiveDialogRoot();
        const focusables = getDialogFocusables(root);

        if (!focusables.length) {
            event.preventDefault();
            root?.focus({ preventScroll: true });
            return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus({ preventScroll: true });
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus({ preventScroll: true });
        }
    }

    function setupProjectOverlay() {
        if (!overlay || !trigger || !closeButton || !projectList) return;

        renderProjects();

        trigger.addEventListener('click', openProjects);
        closeButton.addEventListener('click', () => closeProjects());

        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                closeProjects();
            }
        });

        projectList.addEventListener('click', event => {
            const action = event.target.closest('.project-action[data-task-id]');
            if (!action || action.disabled) return;

            openTokenPrompt(action.dataset.taskId);
        });

        tokenClose?.addEventListener('click', () => closeTokenPrompt());
        tokenCancel?.addEventListener('click', () => closeTokenPrompt());
        tokenOverlay?.addEventListener('click', event => {
            if (event.target === tokenOverlay && !state.unlocking) {
                closeTokenPrompt();
            }
        });
        tokenForm?.addEventListener('submit', unlockActiveRecord);

        document.addEventListener('keydown', handleGlobalKeydown);
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

        if (name) {
            name.style.animationPlayState = 'running';
        }

        if (divider) {
            if (reduceMotion) {
                divider.style.opacity = '1';
                divider.style.width = '120px';
            } else {
                await new Promise(resolve => {
                    setTimeout(() => {
                        divider.style.transition = `width 800ms ${ease}, opacity 600ms ease`;
                        divider.style.opacity = '1';
                        divider.style.width = '120px';
                        setTimeout(resolve, 800);
                    }, 200);
                });
            }
        }

        if (window.particleSystem) {
            window.particleSystem.startBackground();
            window.particleSystem.enableMouseSpawn();
        }

        if (studentId) {
            studentId.style.transition = reduceMotion ? 'none' : 'opacity 3s ease';
            studentId.style.opacity = '1';
        }

        if (tagline) {
            if (reduceMotion) {
                tagline.style.opacity = '1';
            } else {
                await new Promise(resolve => {
                    setTimeout(() => {
                        tagline.style.transition = 'opacity 700ms ease';
                        tagline.style.opacity = '1';
                        setTimeout(resolve, 700);
                    }, 100);
                });
            }
        }

        startTyping();

        if (links) {
            if (reduceMotion) {
                links.style.opacity = '1';
                links.style.transform = 'translateY(0)';
            } else {
                await new Promise(resolve => {
                    setTimeout(() => {
                        links.style.transition = `opacity 900ms ${ease}, transform 900ms ${ease}`;
                        links.style.opacity = '1';
                        links.style.transform = 'translateY(0)';
                        setTimeout(resolve, 900);
                    }, 600);
                });
            }
        }
    }

    function typeStep() {
        if (!typedEl) return;

        const current = phrases[phraseIdx];
        let delay;

        if (!deleting) {
            charIdx += 1;
            typedEl.textContent = current.substring(0, charIdx);

            if (charIdx === current.length) {
                deleting = true;
                delay = 2200;
            } else {
                delay = 65 + Math.random() * 45;
            }
        } else {
            charIdx -= 1;
            typedEl.textContent = current.substring(0, charIdx);

            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                delay = 500;
            } else {
                delay = 30;
            }
        }

        window.setTimeout(typeStep, delay);
    }

    function startTyping() {
        if (!typedEl) return;

        if (reduceMotion) {
            typedEl.textContent = phrases[0];
            return;
        }

        window.setTimeout(typeStep, 400);
    }

    setupProjectOverlay();
    loadProjectManifest();
    runEntrance();
})();
