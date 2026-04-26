(() => {
    const ease = 'cubic-bezier(0.23, 1, 0.32, 1)';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const manifestUrl = 'vault/records.json';
    const vaultMetaFile = '__vault.json';
    const devicePassDbName = 'evo-vault-device-passes';
    const devicePassStoreName = 'tickets';
    const devicePassKeyStoreName = 'keys';
    const devicePassLocalStorageKey = 'evo-vault-device-tickets-v1';
    const devicePassCredentialStorageKey = 'evo-vault-passkey-credential-v1';
    const devicePassMaxUses = 5;
    const devicePassTtlMs = 24 * 60 * 60 * 1000;
    const devicePassClockSkewMs = 90 * 1000;
    const devicePassTicketPrefix = 'EVT3';
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
    const savedPasskeyOption = document.getElementById('saved-passkey-option');
    const savedPasskeyButton = document.getElementById('saved-passkey-button');
    const savedPasskeyDetail = document.getElementById('saved-passkey-detail');
    const tokenField = tokenForm?.querySelector('.token-field') || null;
    const tokenLabel = tokenForm?.querySelector('.token-label') || null;
    const tokenNote = tokenForm?.querySelector('.token-note') || null;
    const devicePassInput = document.getElementById('device-pass-input');
    const devicePassOption = document.getElementById('device-pass-option');
    const devicePassDetail = devicePassOption?.querySelector('.device-pass-detail') || null;
    const defaultTokenNote = tokenNote ? tokenNote.textContent : '';

    const state = {
        activeRecord: null,
        bundleCache: new Map(),
        closeTimer: 0,
        devicePassDb: null,
        devicePassDbReady: null,
        deviceTickets: new Map(),
        manifestError: '',
        manifestLoaded: false,
        pendingUnlock: null,
        pendingSavedAccess: null,
        projects: [],
        sessionVaultKeys: new Map(),
        tokenTimer: 0,
        unlocking: false
    };

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let lastFocusedElement = null;
    let decryptWorker = null;
    let decryptMessageId = 0;
    let passkeyClientCapabilitiesReady = null;

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

    function bytesToBase64url(bytes) {
        let binary = '';

        for (let index = 0; index < bytes.length; index += 1) {
            binary += String.fromCharCode(bytes[index]);
        }

        return window.btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
    }

    function base64urlToBytes(base64urlValue) {
        const base64Value = base64urlValue
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(Math.ceil(base64urlValue.length / 4) * 4, '=');

        return base64ToBytes(base64Value);
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    function getRandomBytes(length) {
        const bytes = new Uint8Array(length);
        window.crypto.getRandomValues(bytes);
        return bytes;
    }

    function getBundleId(bundlePayload) {
        if (bundlePayload && bundlePayload.bundleId) {
            return bundlePayload.bundleId;
        }

        return bundlePayload && bundlePayload.taskId
            ? `legacy:${bundlePayload.version}:${bundlePayload.taskId}`
            : 'legacy:unknown';
    }

    function getSessionVaultKey(record, bundlePayload) {
        const cached = state.sessionVaultKeys.get(record.id);
        const now = Date.now();

        if (!cached || cached.bundleId !== getBundleId(bundlePayload)) {
            return null;
        }

        if (cached.usesRemaining <= 0 || now > cached.expiresAt || now + devicePassClockSkewMs < cached.lastUsedAt) {
            state.sessionVaultKeys.delete(record.id);
            renderProjects();
            return null;
        }

        cached.usesRemaining -= 1;
        cached.lastUsedAt = now;

        if (cached.usesRemaining <= 0) {
            state.sessionVaultKeys.delete(record.id);
        }

        renderProjects();
        return cached.vaultKey;
    }

    function setSessionVaultKey(record, bundlePayload, vaultKey) {
        if (!vaultKey || !bundlePayload || bundlePayload.version !== 3) {
            return;
        }

        const now = Date.now();

        state.sessionVaultKeys.set(record.id, {
            bundleId: getBundleId(bundlePayload),
            vaultKey,
            usesRemaining: devicePassMaxUses,
            expiresAt: now + devicePassTtlMs,
            lastUsedAt: now
        });

        renderProjects();
    }

    function deleteSessionVaultKey(record) {
        if (record && state.sessionVaultKeys.delete(record.id)) {
            renderProjects();
        }
    }

    function isIpHostname(hostname) {
        return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':');
    }

    function getPasskeyRpId() {
        const hostname = window.location.hostname;

        if (!hostname || isIpHostname(hostname)) {
            return '';
        }

        return hostname;
    }

    async function getPasskeyClientCapabilities() {
        if (!window.PublicKeyCredential || typeof window.PublicKeyCredential.getClientCapabilities !== 'function') {
            return null;
        }

        if (!passkeyClientCapabilitiesReady) {
            passkeyClientCapabilitiesReady = window.PublicKeyCredential.getClientCapabilities()
                .catch(error => {
                    console.warn('WebAuthn client capability detection failed:', error);
                    return null;
                });
        }

        return passkeyClientCapabilitiesReady;
    }

    async function isPasskeyPrfExplicitlyUnavailable() {
        const capabilities = await getPasskeyClientCapabilities();

        return Boolean(
            capabilities &&
            Object.prototype.hasOwnProperty.call(capabilities, 'prf') &&
            capabilities.prf === false
        );
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

        pending.resolve({
            archiveBytes: new Uint8Array(payload.archiveBytes),
            vaultKey: payload.vaultKey ? new Uint8Array(payload.vaultKey) : null
        });
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

    async function runDecryptWorker(message) {
        if (!message.bundlePayload || ![2, 3].includes(message.bundlePayload.version)) {
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
                        ...message
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

    async function decryptBundleWithToken(bundlePayload, token) {
        return runDecryptWorker({
            mode: 'token',
            token,
            bundlePayload
        });
    }

    async function decryptBundleWithVaultKey(bundlePayload, vaultKey) {
        return runDecryptWorker({
            mode: 'vaultKey',
            vaultKey,
            bundlePayload
        });
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

    function removeDocumentIcons(doc) {
        doc.querySelectorAll('link[rel]').forEach(link => {
            const relation = (link.getAttribute('rel') || '').toLowerCase();
            if (relation.includes('icon')) {
                link.remove();
            }
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
        removeDocumentIcons(doc);

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
        const escapedLabel = escapeHtml(label);

        viewerWindow.document.open();
        viewerWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unlocking ${escapedLabel}</title>
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
        <h1>${escapedLabel}</h1>
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

    function openViewerWindow() {
        const viewerWindow = window.open('', '_blank');

        if (viewerWindow) {
            try {
                viewerWindow.opener = null;
            } catch (error) {
                // Some browsers restrict opener writes; the viewer still opens normally.
            }
        }

        return viewerWindow;
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

    function canAttemptPersistentDevicePass() {
        return Boolean(
            window.isSecureContext &&
            window.crypto &&
            window.crypto.subtle &&
            window.indexedDB
        );
    }

    function canAttemptPasskeyPrf() {
        return Boolean(
            window.isSecureContext &&
            getPasskeyRpId() &&
            window.PublicKeyCredential &&
            navigator.credentials &&
            typeof navigator.credentials.create === 'function' &&
            typeof navigator.credentials.get === 'function' &&
            window.crypto &&
            window.crypto.subtle
        );
    }

    function configureDevicePassOption(bundlePayload = null, options = {}) {
        if (!devicePassInput || !devicePassOption) return;

        const { resetChoice = true } = options;
        const isV3Bundle = !bundlePayload || bundlePayload.version === 3;
        const isAvailable = canAttemptPersistentDevicePass() && isV3Bundle;
        const hasPasskeyPrfAttempt = canAttemptPasskeyPrf();
        const rpId = getPasskeyRpId();

        devicePassInput.disabled = !isAvailable;
        if (resetChoice || !isAvailable) {
            devicePassInput.checked = isAvailable;
        }
        devicePassOption.classList.toggle('is-disabled', !isAvailable);
        devicePassOption.title = isAvailable
            ? 'Bind this vault to an encrypted local device ticket after the token unlock succeeds.'
            : rpId
                ? 'Persistent device tickets require a secure context, IndexedDB, and Web Crypto.'
                : 'Persistent Passkey tickets require a domain origin. Use localhost or the GitHub Pages HTTPS domain instead of 127.0.0.1.';

        if (devicePassDetail) {
            devicePassDetail.textContent = isAvailable
                ? hasPasskeyPrfAttempt
                    ? 'Passkey unlock stays saved on this device; fallback local tickets last 5 uses or 24 hours.'
                    : 'Local fallback unlock lasts up to 5 times or 24 hours.'
                : rpId
                    ? 'This browser will fall back to session-only access if persistent local storage is unavailable.'
                    : 'Use localhost or the GitHub Pages HTTPS domain; IP origins only get session access.';
        }
    }

    function getDeviceTicketSlot(protection) {
        if (protection === 'passkey-prf') return 'passkeyPrf';
        if (protection === 'local-crypto-key') return 'localCryptoKey';
        return '';
    }

    function getDeviceTicketFromGroup(group, protection) {
        const slot = getDeviceTicketSlot(protection);
        if (!group || !slot) return null;

        if (group.tickets && typeof group.tickets === 'object') {
            return group.tickets[slot] || null;
        }

        return group.protection === protection ? group : null;
    }

    function getSavedPasskeyTicket(record) {
        const group = record ? state.deviceTickets.get(record.id) : null;
        return getDeviceTicketFromGroup(group, 'passkey-prf');
    }

    function getSavedLocalFallbackTicket(record) {
        const group = record ? state.deviceTickets.get(record.id) : null;
        return getDeviceTicketFromGroup(group, 'local-crypto-key');
    }

    function getSavedDeviceTicket(record) {
        return getSavedLocalFallbackTicket(record) || getSavedPasskeyTicket(record);
    }

    function canUseSavedDeviceTicket(ticketRecord) {
        if (!ticketRecord) return false;
        if (ticketRecord.protection === 'passkey-prf') return true;
        return ticketRecord.protection === 'local-crypto-key' && ticketRecord.rememberDeviceRequested === true;
    }

    function configureSavedPasskeyOption(record = state.activeRecord, mode = 'token') {
        if (!savedPasskeyOption) return;

        const ticketRecord = getSavedPasskeyTicket(record);
        const isVisible = mode === 'token' && Boolean(ticketRecord);

        savedPasskeyOption.hidden = !isVisible;

        if (savedPasskeyButton) {
            savedPasskeyButton.disabled = state.unlocking || !isVisible;
        }

        if (savedPasskeyDetail && isVisible) {
            savedPasskeyDetail.textContent = 'Saved Passkey unlock is available. Windows Security opens only after you choose Use saved Passkey.';
        }
    }

    function openDevicePassDb() {
        if (state.devicePassDb) {
            return Promise.resolve(state.devicePassDb);
        }

        if (state.devicePassDbReady) {
            return state.devicePassDbReady;
        }

        if (!window.indexedDB) {
            return Promise.reject(new Error('IndexedDB is unavailable.'));
        }

        const ready = new Promise((resolve, reject) => {
            const request = window.indexedDB.open(devicePassDbName, 2);
            const rejectOpen = error => {
                state.devicePassDbReady = null;
                reject(error);
            };

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(devicePassStoreName)) {
                    db.createObjectStore(devicePassStoreName, { keyPath: 'taskId' });
                }
                if (!db.objectStoreNames.contains(devicePassKeyStoreName)) {
                    db.createObjectStore(devicePassKeyStoreName, { keyPath: 'keyId' });
                }
            };

            request.onsuccess = () => {
                state.devicePassDb = request.result;
                state.devicePassDb.addEventListener('versionchange', () => {
                    state.devicePassDb.close();
                    state.devicePassDb = null;
                    state.devicePassDbReady = null;
                });
                state.devicePassDb.addEventListener('close', () => {
                    state.devicePassDb = null;
                    state.devicePassDbReady = null;
                });
                resolve(state.devicePassDb);
            };

            request.onerror = () => {
                rejectOpen(request.error || new Error('Device ticket storage failed to open.'));
            };

            request.onblocked = () => {
                rejectOpen(new Error('Device ticket storage is blocked by another open tab.'));
            };
        });

        state.devicePassDbReady = ready;
        return state.devicePassDbReady;
    }

    async function runDevicePassTransaction(mode, callback) {
        const db = await openDevicePassDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(devicePassStoreName, mode);
            const store = transaction.objectStore(devicePassStoreName);
            const result = callback(store);

            transaction.oncomplete = () => resolve(result);
            transaction.onerror = () => reject(transaction.error || new Error('Device ticket storage failed.'));
            transaction.onabort = () => reject(transaction.error || new Error('Device ticket storage was aborted.'));
        });
    }

    function readLocalDeviceTickets() {
        try {
            const payload = JSON.parse(window.localStorage.getItem(devicePassLocalStorageKey) || '[]');
            return Array.isArray(payload) ? payload : [];
        } catch (error) {
            return [];
        }
    }

    function writeLocalDeviceTickets(records) {
        try {
            window.localStorage.setItem(devicePassLocalStorageKey, JSON.stringify(records));
        } catch (error) {
            // IndexedDB remains the primary store.
        }
    }

    function upsertLocalDeviceTicketGroup(ticketGroup) {
        const records = readLocalDeviceTickets().filter(record => record && record.taskId !== ticketGroup.taskId);
        records.push(ticketGroup);
        writeLocalDeviceTickets(records);
    }

    function deleteLocalDeviceTicket(taskId, protection = '') {
        if (!protection) {
            writeLocalDeviceTickets(readLocalDeviceTickets().filter(record => record && record.taskId !== taskId));
            return;
        }

        const records = [];
        for (const record of readLocalDeviceTickets()) {
            const group = normalizeDeviceTicketGroup(record);
            if (!group || group.taskId !== taskId) {
                if (record) records.push(record);
                continue;
            }

            const slot = getDeviceTicketSlot(protection);
            if (slot && group.tickets) {
                delete group.tickets[slot];
            }
            if (hasDeviceTicketGroupTickets(group)) {
                records.push(group);
            }
        }
        writeLocalDeviceTickets(records);
    }

    function readPasskeyCredentialRecord() {
        try {
            const record = JSON.parse(window.localStorage.getItem(devicePassCredentialStorageKey) || 'null');
            return record && record.credentialId ? record : null;
        } catch (error) {
            return null;
        }
    }

    function writePasskeyCredentialRecord(credentialId) {
        try {
            window.localStorage.setItem(devicePassCredentialStorageKey, JSON.stringify({
                credentialId,
                scope: 'origin',
                updatedAt: Date.now()
            }));
        } catch (error) {
            // Task tickets still carry the credential id as a fallback source.
        }
    }

    function getSavedPasskeyCredentialId() {
        const storedCredential = readPasskeyCredentialRecord();
        if (storedCredential?.credentialId) {
            return storedCredential.credentialId;
        }

        for (const ticketGroup of state.deviceTickets.values()) {
            const ticketRecord = getDeviceTicketFromGroup(ticketGroup, 'passkey-prf');
            if (ticketRecord?.credentialId) {
                return ticketRecord.credentialId;
            }
        }

        return '';
    }

    function getDeviceTicketTimestamp(record) {
        return record && Number.isFinite(record.updatedAt || record.createdAt)
            ? record.updatedAt || record.createdAt
            : 0;
    }

    function createDeviceTicketGroup(taskId) {
        return {
            version: 2,
            taskId,
            tickets: {},
            updatedAt: 0
        };
    }

    function hasDeviceTicketGroupTickets(group) {
        return Boolean(
            getDeviceTicketFromGroup(group, 'passkey-prf') ||
            getDeviceTicketFromGroup(group, 'local-crypto-key')
        );
    }

    function normalizeDeviceTicketForGroup(ticketRecord, taskId) {
        if (!ticketRecord || !ticketRecord.ticket || !ticketRecord.protection) return null;

        const slot = getDeviceTicketSlot(ticketRecord.protection);
        if (!slot) return null;

        return {
            ...ticketRecord,
            taskId
        };
    }

    function normalizeDeviceTicketGroup(record) {
        if (!record || !record.taskId) return null;

        const group = createDeviceTicketGroup(record.taskId);
        const candidates = record.tickets && typeof record.tickets === 'object'
            ? [record.tickets.passkeyPrf, record.tickets.localCryptoKey]
            : [record];

        for (const candidate of candidates) {
            const ticketRecord = normalizeDeviceTicketForGroup(candidate, record.taskId);
            if (!ticketRecord) continue;

            const slot = getDeviceTicketSlot(ticketRecord.protection);
            const current = group.tickets[slot];
            if (!current || getDeviceTicketTimestamp(ticketRecord) >= getDeviceTicketTimestamp(current)) {
                group.tickets[slot] = ticketRecord;
            }
            group.updatedAt = Math.max(group.updatedAt, getDeviceTicketTimestamp(ticketRecord));
        }

        return hasDeviceTicketGroupTickets(group) ? group : null;
    }

    function mergeDeviceTicketGroups(current, incoming) {
        const currentGroup = normalizeDeviceTicketGroup(current);
        const incomingGroup = normalizeDeviceTicketGroup(incoming);
        const taskId = incomingGroup?.taskId || currentGroup?.taskId;
        if (!taskId) return null;

        const group = createDeviceTicketGroup(taskId);

        for (const protection of ['passkey-prf', 'local-crypto-key']) {
            const slot = getDeviceTicketSlot(protection);
            const currentTicket = getDeviceTicketFromGroup(currentGroup, protection);
            const incomingTicket = getDeviceTicketFromGroup(incomingGroup, protection);
            const selectedTicket = !currentTicket || (
                incomingTicket &&
                getDeviceTicketTimestamp(incomingTicket) >= getDeviceTicketTimestamp(currentTicket)
            )
                ? incomingTicket
                : currentTicket;

            if (selectedTicket) {
                group.tickets[slot] = selectedTicket;
                group.updatedAt = Math.max(group.updatedAt, getDeviceTicketTimestamp(selectedTicket));
            }
        }

        return hasDeviceTicketGroupTickets(group) ? group : null;
    }

    function mergeLoadedDeviceTicket(record) {
        const incomingGroup = normalizeDeviceTicketGroup(record);
        if (!incomingGroup) return;

        const current = state.deviceTickets.get(incomingGroup.taskId);
        const mergedGroup = mergeDeviceTicketGroups(current, incomingGroup);
        if (mergedGroup) {
            state.deviceTickets.set(incomingGroup.taskId, mergedGroup);
        }
    }

    async function persistLoadedTicketsToIndexedDb() {
        if (!window.indexedDB || !state.deviceTickets.size) return;

        try {
            await runDevicePassTransaction('readwrite', store => {
                for (const record of state.deviceTickets.values()) {
                    store.put(record);
                }
            });
        } catch (error) {
            // LocalStorage mirror remains available.
        }
    }

    async function loadDeviceTickets() {
        state.deviceTickets.clear();

        for (const record of readLocalDeviceTickets()) {
            mergeLoadedDeviceTicket(record);
        }

        if (!window.indexedDB) return;

        try {
            await runDevicePassTransaction('readonly', store => {
                const request = store.getAll();

                request.onsuccess = () => {
                    for (const record of request.result || []) {
                        mergeLoadedDeviceTicket(record);
                    }
                };
            });
            writeLocalDeviceTickets([...state.deviceTickets.values()]);
        } catch (error) {
            await persistLoadedTicketsToIndexedDb();
        }
    }

    async function saveDeviceTicket(ticketRecord) {
        const slot = getDeviceTicketSlot(ticketRecord?.protection);
        if (!ticketRecord || !ticketRecord.taskId || !slot) {
            throw new Error('Device ticket is invalid.');
        }

        const currentGroup = normalizeDeviceTicketGroup(state.deviceTickets.get(ticketRecord.taskId)) || createDeviceTicketGroup(ticketRecord.taskId);
        const previousTicket = getDeviceTicketFromGroup(currentGroup, ticketRecord.protection);
        const nextGroup = {
            ...currentGroup,
            tickets: {
                ...currentGroup.tickets,
                [slot]: ticketRecord
            },
            updatedAt: Math.max(Date.now(), getDeviceTicketTimestamp(ticketRecord))
        };

        state.deviceTickets.set(ticketRecord.taskId, nextGroup);
        upsertLocalDeviceTicketGroup(nextGroup);

        let indexedDbWriteSucceeded = false;

        try {
            await runDevicePassTransaction('readwrite', store => {
                store.put(nextGroup);
            });
            indexedDbWriteSucceeded = true;
        } catch (error) {
            console.warn('IndexedDB device ticket write failed; localStorage mirror is still available:', error);
        }

        if (
            indexedDbWriteSucceeded &&
            previousTicket &&
            previousTicket.keyId &&
            previousTicket.keyId !== ticketRecord.keyId
        ) {
            await deleteLocalDeviceKey(previousTicket.keyId);
        }

        renderProjects();
    }

    async function deleteDeviceTicket(taskId, protection = '') {
        const currentGroup = normalizeDeviceTicketGroup(state.deviceTickets.get(taskId));
        if (!currentGroup) {
            renderProjects();
            return;
        }

        const removedTickets = protection
            ? [getDeviceTicketFromGroup(currentGroup, protection)].filter(Boolean)
            : [
                getDeviceTicketFromGroup(currentGroup, 'passkey-prf'),
                getDeviceTicketFromGroup(currentGroup, 'local-crypto-key')
            ].filter(Boolean);
        const slot = getDeviceTicketSlot(protection);
        const nextGroup = protection
            ? {
                ...currentGroup,
                tickets: {
                    ...currentGroup.tickets
                },
                updatedAt: Date.now()
            }
            : null;

        if (nextGroup && slot) {
            delete nextGroup.tickets[slot];
        }

        if (nextGroup && hasDeviceTicketGroupTickets(nextGroup)) {
            state.deviceTickets.set(taskId, nextGroup);
        } else {
            state.deviceTickets.delete(taskId);
        }
        deleteLocalDeviceTicket(taskId, protection);

        if (!window.indexedDB) {
            renderProjects();
            return;
        }

        try {
            await runDevicePassTransaction('readwrite', store => {
                if (nextGroup && hasDeviceTicketGroupTickets(nextGroup)) {
                    store.put(nextGroup);
                } else {
                    store.delete(taskId);
                }
            });
            for (const ticketRecord of removedTickets) {
                if (!ticketRecord.keyId) continue;
                await deleteLocalDeviceKey(ticketRecord.keyId);
            }
        } catch (error) {
            // The in-memory ticket state was already updated.
        }

        renderProjects();
    }

    async function deleteLocalFallbackTicket(record) {
        const ticketRecord = getSavedLocalFallbackTicket(record);
        if (ticketRecord?.protection === 'local-crypto-key') {
            await deleteDeviceTicket(record.id, 'local-crypto-key');
        }
    }

    async function getLocalDeviceKey(keyId) {
        if (!window.indexedDB) {
            return null;
        }

        const db = await openDevicePassDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(devicePassKeyStoreName, 'readonly');
            const request = transaction.objectStore(devicePassKeyStoreName).get(keyId);

            request.onsuccess = () => {
                const record = request.result;
                resolve(record && record.key ? record.key : null);
            };
            request.onerror = () => reject(request.error || new Error('Local device key could not be read.'));
            transaction.onerror = () => reject(transaction.error || new Error('Local device key transaction failed.'));
        });
    }

    async function saveLocalDeviceKey(keyId, key) {
        const db = await openDevicePassDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(devicePassKeyStoreName, 'readwrite');
            transaction.objectStore(devicePassKeyStoreName).put({
                keyId,
                key,
                createdAt: Date.now()
            });
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error || new Error('Local device key could not be saved.'));
        });
    }

    async function deleteLocalDeviceKey(keyId) {
        if (!window.indexedDB) return;

        try {
            const db = await openDevicePassDb();
            await new Promise((resolve, reject) => {
                const transaction = db.transaction(devicePassKeyStoreName, 'readwrite');
                transaction.objectStore(devicePassKeyStoreName).delete(keyId);
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error || new Error('Local device key could not be deleted.'));
            });
        } catch (error) {
            // Stale keys only matter if the encrypted ticket still exists.
        }
    }

    async function createLocalDeviceKey(keyId) {
        const key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );

        await saveLocalDeviceKey(keyId, key);
        return key;
    }

    function getTicketProtectorId(context) {
        return context.credentialId || context.keyId || context.protectorId || 'unknown';
    }

    function getTicketAad(context) {
        return textEncoder.encode([
            'evo-vault-device-ticket-v1',
            window.location.origin,
            context.taskId,
            context.bundleId,
            context.protection || 'passkey-prf',
            getTicketProtectorId(context)
        ].join('|'));
    }

    function parseDeviceTicket(ticket) {
        const parts = String(ticket || '').split('.');

        if (parts.length !== 4 || parts[0] !== devicePassTicketPrefix) {
            throw new Error('Device ticket is invalid.');
        }

        return {
            salt: base64urlToBytes(parts[1]),
            iv: base64urlToBytes(parts[2]),
            ciphertext: base64urlToBytes(parts[3])
        };
    }

    function encodeDeviceTicket({ salt, iv, ciphertext }) {
        return [
            devicePassTicketPrefix,
            bytesToBase64url(salt),
            bytesToBase64url(iv),
            bytesToBase64url(ciphertext)
        ].join('.');
    }

    async function deriveTicketKey(prfOutput, { taskId, bundleId, credentialId }) {
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            prfOutput,
            'HKDF',
            false,
            ['deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: textEncoder.encode(`${window.location.origin}|${taskId}|${bundleId}`),
                info: textEncoder.encode(`evo-vault-device-ticket-key|${credentialId}`)
            },
            baseKey,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function encryptDeviceTicketPayloadWithKey(payload, context, salt, key) {
        const iv = getRandomBytes(12);
        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
                additionalData: getTicketAad(context)
            },
            key,
            textEncoder.encode(JSON.stringify(payload))
        );

        return encodeDeviceTicket({
            salt,
            iv,
            ciphertext: new Uint8Array(ciphertext)
        });
    }

    async function encryptDeviceTicketPayload(payload, context, salt, prfOutput) {
        const key = await deriveTicketKey(prfOutput, context);
        return encryptDeviceTicketPayloadWithKey(payload, context, salt, key);
    }

    async function decryptDeviceTicketPayloadWithKey(ticketRecord, bundlePayload, key) {
        const context = {
            taskId: ticketRecord.taskId,
            bundleId: getBundleId(bundlePayload),
            credentialId: ticketRecord.credentialId,
            keyId: ticketRecord.keyId,
            protection: ticketRecord.protection || 'passkey-prf'
        };
        const ticket = parseDeviceTicket(ticketRecord.ticket);
        const plaintext = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: ticket.iv,
                additionalData: getTicketAad(context)
            },
            key,
            ticket.ciphertext
        );

        return JSON.parse(textDecoder.decode(plaintext));
    }

    async function decryptDeviceTicketPayload(ticketRecord, bundlePayload, prfOutput) {
        const context = {
            taskId: ticketRecord.taskId,
            bundleId: getBundleId(bundlePayload),
            credentialId: ticketRecord.credentialId,
            protection: ticketRecord.protection || 'passkey-prf'
        };
        const key = await deriveTicketKey(prfOutput, context);

        return decryptDeviceTicketPayloadWithKey(ticketRecord, bundlePayload, key);
    }

    function getPublicKeyPrfResults(credential) {
        const extensionResults = typeof credential.getClientExtensionResults === 'function'
            ? credential.getClientExtensionResults()
            : {};
        const prf = extensionResults && extensionResults.prf;
        const results = prf && prf.results;

        return {
            enabled: Boolean(prf && prf.enabled),
            first: results && results.first ? new Uint8Array(results.first) : null,
            second: results && results.second ? new Uint8Array(results.second) : null
        };
    }

    function getErrorMessage(error) {
        if (error instanceof Error) {
            return error.name && error.name !== 'Error'
                ? `${error.name}: ${error.message}`
                : error.message;
        }

        return String(error || 'Unknown error.');
    }

    function getPasskeyPrfUnavailableReason() {
        const reasons = [];

        if (!window.isSecureContext) {
            reasons.push('current page is not a secure context');
        }
        if (!getPasskeyRpId()) {
            reasons.push('current host cannot be used as a Passkey RP ID');
        }
        if (!window.PublicKeyCredential) {
            reasons.push('PublicKeyCredential is unavailable');
        }
        if (!navigator.credentials) {
            reasons.push('navigator.credentials is unavailable');
        } else {
            if (typeof navigator.credentials.create !== 'function') {
                reasons.push('navigator.credentials.create is unavailable');
            }
            if (typeof navigator.credentials.get !== 'function') {
                reasons.push('navigator.credentials.get is unavailable');
            }
        }
        if (!window.crypto || !window.crypto.subtle) {
            reasons.push('Web Crypto SubtleCrypto is unavailable');
        }

        return reasons.length
            ? reasons.join('; ')
            : 'Passkey PRF preflight returned unavailable for an unknown reason';
    }

    async function getPasskeyPrfOutputs(credentialId, firstSalt, secondSalt = null) {
        const rpId = getPasskeyRpId();
        if (!rpId) {
            throw new Error('Persistent Passkey tickets require localhost or an HTTPS domain, not an IP address.');
        }

        const evalRequest = { first: firstSalt };
        if (secondSalt) {
            evalRequest.second = secondSalt;
        }

        const credential = await navigator.credentials.get({
            publicKey: {
                challenge: getRandomBytes(32),
                rpId,
                allowCredentials: [
                    {
                        id: base64urlToBytes(credentialId),
                        type: 'public-key'
                    }
                ],
                userVerification: 'required',
                extensions: {
                    prf: {
                        evalByCredential: {
                            [credentialId]: evalRequest
                        }
                    }
                },
                timeout: 60000
            }
        });

        if (!credential) {
            throw new Error('Passkey verification was cancelled.');
        }

        const prfResults = getPublicKeyPrfResults(credential);
        if (!prfResults.first) {
            throw new Error('This Passkey does not expose PRF output.');
        }

        return prfResults;
    }

    async function createPasskeyPrfCredential(firstSalt) {
        const rpId = getPasskeyRpId();
        if (!rpId) {
            throw new Error('Persistent Passkey tickets require localhost or an HTTPS domain, not an IP address.');
        }

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: getRandomBytes(32),
                rp: {
                    id: rpId,
                    name: 'EvoVault'
                },
                user: {
                    id: getRandomBytes(16),
                    name: `evo-vault-${Date.now()}`,
                    displayName: 'EvoVault Device Pass'
                },
                pubKeyCredParams: [
                    { type: 'public-key', alg: -7 },
                    { type: 'public-key', alg: -257 }
                ],
                authenticatorSelection: {
                    residentKey: 'preferred',
                    userVerification: 'required'
                },
                attestation: 'none',
                extensions: {
                    prf: {
                        eval: {
                            first: firstSalt
                        }
                    }
                },
                timeout: 60000
            }
        });

        if (!credential) {
            throw new Error('Passkey creation was cancelled.');
        }

        const credentialId = bytesToBase64url(new Uint8Array(credential.rawId));
        let prfResults = getPublicKeyPrfResults(credential);

        if (!prfResults.first) {
            try {
                prfResults = await getPasskeyPrfOutputs(credentialId, firstSalt);
            } catch (error) {
                if (prfResults.enabled === false && error instanceof Error && error.message === 'This Passkey does not expose PRF output.') {
                    throw new Error('This Passkey does not support encrypted device tickets.');
                }

                throw error;
            }
        }

        if (!prfResults.first) {
            throw new Error('This Passkey does not expose PRF output.');
        }

        return {
            credentialId,
            prfOutput: prfResults.first
        };
    }

    async function getOrCreatePasskeyPrfForTicket(firstSalt) {
        const existingCredentialId = getSavedPasskeyCredentialId();

        if (existingCredentialId) {
            try {
                const prfResults = await getPasskeyPrfOutputs(existingCredentialId, firstSalt);
                writePasskeyCredentialRecord(existingCredentialId);

                return {
                    credentialId: existingCredentialId,
                    prfOutput: prfResults.first,
                    reusedCredential: true
                };
            } catch (error) {
                console.warn('Saved Passkey credential could not be reused; creating a new one:', error);
            }
        }

        const result = await createPasskeyPrfCredential(firstSalt);
        writePasskeyCredentialRecord(result.credentialId);

        return {
            ...result,
            reusedCredential: false
        };
    }

    async function createDeviceTicket(record, bundlePayload, vaultKey) {
        if (!canAttemptPersistentDevicePass() || !vaultKey || !bundlePayload || bundlePayload.version !== 3) {
            throw new Error('Persistent device tickets are unavailable in this browser.');
        }

        if (canAttemptPasskeyPrf()) {
            if (await isPasskeyPrfExplicitlyUnavailable()) {
                const fallbackResult = await createLocalCryptoDeviceTicket(record, bundlePayload, vaultKey);
                return {
                    ...fallbackResult,
                    prfAttempted: false,
                    prfSucceeded: false,
                    prfUnavailableReason: 'Passkey PRF is explicitly unavailable in this browser.'
                };
            }

            try {
                return await createPasskeyDeviceTicket(record, bundlePayload, vaultKey);
            } catch (error) {
                const prfFailureReason = getErrorMessage(error);
                console.warn('Passkey PRF ticket failed; falling back to local CryptoKey ticket:', error);
                const fallbackResult = await createLocalCryptoDeviceTicket(record, bundlePayload, vaultKey);

                return {
                    ...fallbackResult,
                    prfAttempted: true,
                    prfSucceeded: false,
                    prfFailureReason
                };
            }
        }

        const fallbackResult = await createLocalCryptoDeviceTicket(record, bundlePayload, vaultKey);

        return {
            ...fallbackResult,
            prfAttempted: false,
            prfSucceeded: false,
            prfUnavailableReason: getPasskeyPrfUnavailableReason()
        };
    }

    async function createPasskeyDeviceTicket(record, bundlePayload, vaultKey) {
        const salt = getRandomBytes(32);
        const { credentialId, prfOutput, reusedCredential } = await getOrCreatePasskeyPrfForTicket(salt);
        const now = Date.now();
        const bundleId = getBundleId(bundlePayload);
        const context = {
            taskId: record.id,
            bundleId,
            credentialId,
            protection: 'passkey-prf'
        };
        const payload = {
            version: 1,
            taskId: record.id,
            bundleId,
            vaultKey: bytesToBase64url(vaultKey),
            authorization: 'permanent',
            createdAt: now,
            lastUsedAt: now,
            counter: 0
        };
        const ticket = await encryptDeviceTicketPayload(payload, context, salt, prfOutput);

        await saveDeviceTicket({
            version: 1,
            protection: 'passkey-prf',
            authorization: 'permanent',
            rememberDeviceRequested: true,
            credentialScope: 'origin',
            taskId: record.id,
            bundleId,
            credentialId,
            ticket,
            createdAt: now,
            updatedAt: now
        });

        return {
            protection: 'passkey-prf',
            prfAttempted: true,
            prfSucceeded: true,
            credentialReused: reusedCredential,
            credentialId
        };
    }

    async function createLocalCryptoDeviceTicket(record, bundlePayload, vaultKey) {
        const now = Date.now();
        const bundleId = getBundleId(bundlePayload);
        const keyId = `local:${record.id}:${bundleId}`;
        const key = await createLocalDeviceKey(keyId);
        const salt = getRandomBytes(16);
        const context = {
            taskId: record.id,
            bundleId,
            keyId,
            protection: 'local-crypto-key'
        };
        const payload = {
            version: 1,
            taskId: record.id,
            bundleId,
            vaultKey: bytesToBase64url(vaultKey),
            usesRemaining: devicePassMaxUses,
            maxUses: devicePassMaxUses,
            createdAt: now,
            lastUsedAt: now,
            expiresAt: now + devicePassTtlMs,
            counter: 0
        };
        const ticket = await encryptDeviceTicketPayloadWithKey(payload, context, salt, key);

        await saveDeviceTicket({
            version: 1,
            protection: 'local-crypto-key',
            rememberDeviceRequested: true,
            taskId: record.id,
            bundleId,
            keyId,
            ticket,
            createdAt: now,
            updatedAt: now
        });

        return {
            protection: 'local-crypto-key',
            prfAttempted: false,
            prfSucceeded: false,
            keyId
        };
    }

    function validateDeviceTicketPayload(payload, ticketRecord, bundlePayload) {
        const now = Date.now();

        if (!payload || payload.version !== 1 || payload.taskId !== ticketRecord.taskId || payload.bundleId !== getBundleId(bundlePayload)) {
            throw new Error('Device ticket does not match this archive.');
        }

        if (!payload.vaultKey) {
            throw new Error('Device ticket is missing the vault key.');
        }

        if (ticketRecord.protection !== 'local-crypto-key') {
            return;
        }

        if (!Number.isFinite(payload.usesRemaining) || payload.usesRemaining <= 0) {
            throw new Error('Device ticket has no remaining unlocks.');
        }

        if (!Number.isFinite(payload.expiresAt) || now > payload.expiresAt) {
            throw new Error('Device ticket has expired.');
        }

        if (Number.isFinite(payload.lastUsedAt) && now + devicePassClockSkewMs < payload.lastUsedAt) {
            throw new Error('Device clock moved backwards. Re-enter the token.');
        }
    }

    function createDeviceTicketMismatchError(message, cause) {
        const error = new Error(message);
        error.deviceTicketMismatch = true;
        error.cause = cause;
        return error;
    }

    async function unlockWithDeviceTicket(record, bundlePayload, ticketRecord) {
        if (!ticketRecord || ticketRecord.bundleId !== getBundleId(bundlePayload) || bundlePayload.version !== 3) {
            throw new Error('Device ticket is stale.');
        }

        if (ticketRecord.protection === 'local-crypto-key') {
            return unlockWithLocalCryptoTicket(record, bundlePayload, ticketRecord);
        }

        const currentTicket = parseDeviceTicket(ticketRecord.ticket);
        const nextSalt = getRandomBytes(32);
        const prfResults = await getPasskeyPrfOutputs(ticketRecord.credentialId, currentTicket.salt, nextSalt);
        let payload;
        try {
            payload = await decryptDeviceTicketPayload(ticketRecord, bundlePayload, prfResults.first);
            validateDeviceTicketPayload(payload, ticketRecord, bundlePayload);
        } catch (error) {
            throw createDeviceTicketMismatchError('Saved Passkey ticket no longer matches this archive.', error);
        }

        const now = Date.now();
        const vaultKey = base64urlToBytes(payload.vaultKey);
        const nextPayload = {
            ...payload,
            authorization: 'permanent',
            lastUsedAt: now,
            counter: Number.isFinite(payload.counter) ? payload.counter + 1 : 1
        };
        const nextRecord = {
            ...ticketRecord,
            authorization: 'permanent',
            ticket: await encryptDeviceTicketPayload(
                nextPayload,
                {
                    taskId: record.id,
                    bundleId: getBundleId(bundlePayload),
                    credentialId: ticketRecord.credentialId,
                    protection: 'passkey-prf'
                },
                prfResults.second ? nextSalt : currentTicket.salt,
                prfResults.second || prfResults.first
            ),
            updatedAt: now
        };

        await saveDeviceTicket(nextRecord);

        return vaultKey;
    }

    async function unlockWithLocalCryptoTicket(record, bundlePayload, ticketRecord) {
        const key = await getLocalDeviceKey(ticketRecord.keyId);
        if (!key) {
            throw new Error('Local device key is missing.');
        }

        const currentTicket = parseDeviceTicket(ticketRecord.ticket);
        const payload = await decryptDeviceTicketPayloadWithKey(ticketRecord, bundlePayload, key);

        validateDeviceTicketPayload(payload, ticketRecord, bundlePayload);

        const now = Date.now();
        const vaultKey = base64urlToBytes(payload.vaultKey);
        const remainingUses = payload.usesRemaining - 1;

        if (remainingUses > 0) {
            const nextPayload = {
                ...payload,
                usesRemaining: remainingUses,
                lastUsedAt: now,
                counter: payload.counter + 1
            };
            const nextRecord = {
                ...ticketRecord,
                ticket: await encryptDeviceTicketPayloadWithKey(
                    nextPayload,
                    {
                        taskId: record.id,
                        bundleId: getBundleId(bundlePayload),
                        keyId: ticketRecord.keyId,
                        protection: 'local-crypto-key'
                    },
                    currentTicket.salt,
                    key
                ),
                updatedAt: now
            };

            await saveDeviceTicket(nextRecord);
        } else {
            await deleteDeviceTicket(record.id, 'local-crypto-key');
        }

        return vaultKey;
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
        if (savedPasskeyButton) savedPasskeyButton.disabled = isBusy;
        if (devicePassInput) devicePassInput.disabled = isBusy || !canAttemptPersistentDevicePass();
    }

    function setTokenPromptMode(mode, record = state.activeRecord) {
        const isSaveDeviceMode = mode === 'saveDevice';
        const isOpenRecordMode = mode === 'openRecord';
        const isPostTokenMode = isSaveDeviceMode || isOpenRecordMode;

        tokenPanel?.setAttribute('data-mode', mode);
        configureSavedPasskeyOption(record, mode);

        if (tokenField) tokenField.hidden = isPostTokenMode;
        if (tokenLabel) tokenLabel.hidden = isPostTokenMode;
        if (devicePassOption) devicePassOption.hidden = isPostTokenMode;

        if (tokenInput) {
            tokenInput.required = !isPostTokenMode;
            if (isPostTokenMode) {
                tokenInput.blur();
            }
        }

        if (tokenTitle) {
            tokenTitle.textContent = isOpenRecordMode
                ? 'Open record'
                : isSaveDeviceMode ? 'Save device access?' : 'Enter your token';
        }

        if (tokenDescription) {
            tokenDescription.textContent = isOpenRecordMode
                ? 'Device access is saved. Open the record in a new tab to continue.'
                : isSaveDeviceMode
                    ? 'Save a Passkey for this record. Windows Security may ask you to confirm; if it cannot complete, this browser will save an encrypted local device ticket instead.'
                : record
                    ? `Use the access token for ${record.label}. A successful unlock can create an encrypted local device ticket.`
                    : 'Use the access token for this record. The archive is decrypted locally in your browser and opened in a new tab.';
        }

        if (tokenSubmit) {
            tokenSubmit.textContent = isOpenRecordMode
                ? 'Open record'
                : isSaveDeviceMode ? 'Save Passkey' : 'Continue with token';
        }

        if (tokenCancel) {
            tokenCancel.textContent = isOpenRecordMode
                ? 'Close'
                : isSaveDeviceMode ? 'Skip' : 'Back';
        }

        if (tokenNote) {
            tokenNote.textContent = isOpenRecordMode
                ? 'The next click opens the decrypted record from this browser session.'
                : isSaveDeviceMode
                    ? 'This happens after the token has been verified, so a failed Passkey attempt will not block opening the record.'
                : defaultTokenNote;
        }
    }

    function showDeviceSavePrompt(pendingUnlock) {
        state.pendingUnlock = {
            ...pendingUnlock,
            rememberDeviceRequested: true
        };
        setTokenPromptMode('saveDevice', pendingUnlock.record);
        setTokenStatus('Token accepted. Save this device for faster local unlocks.', 'success');

        window.setTimeout(() => {
            tokenSubmit?.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 120);
    }

    function showOpenRecordPrompt(pendingUnlock, message = 'Token accepted. Click Open record to continue.') {
        state.pendingUnlock = {
            ...pendingUnlock,
            readyToOpen: true
        };
        setTokenPromptMode('openRecord', pendingUnlock.record);
        setTokenStatus(message, 'success');

        window.setTimeout(() => {
            tokenSubmit?.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 120);
    }

    function openPendingViewerWindow(pendingUnlock) {
        if (pendingUnlock.viewerWindow) {
            try {
                if (!pendingUnlock.viewerWindow.closed) {
                    return pendingUnlock.viewerWindow;
                }
            } catch (error) {
                return pendingUnlock.viewerWindow;
            }
        }

        const viewerWindow = openViewerWindow();
        if (!viewerWindow) {
            return null;
        }

        writeViewerPlaceholder(viewerWindow, pendingUnlock.record.label);
        pendingUnlock.viewerWindow = viewerWindow;
        return viewerWindow;
    }

    function completePendingUnlock(options = {}) {
        const { rememberInSession = false } = options;
        const pendingUnlock = state.pendingUnlock;

        if (!pendingUnlock) return;

        const viewerWindow = openPendingViewerWindow(pendingUnlock);
        if (!viewerWindow) {
            setTokenStatus('Popup blocked. Allow popups for this site first, then try again.', 'error');
            return;
        }

        state.pendingUnlock = null;

        if ((rememberInSession || pendingUnlock.rememberInSession) && pendingUnlock.vaultKey) {
            setSessionVaultKey(pendingUnlock.record, pendingUnlock.bundlePayload, pendingUnlock.vaultKey);
        }

        viewerWindow.location.replace(pendingUnlock.viewerUrl);
        setTokenStatus('Record unsealed. Opening in a new tab...', 'success');
        closeTokenPrompt({ restorePanelFocus: false });
        closeProjects({ restorePageFocus: false });
    }

    async function skipPendingDeviceAccess() {
        if (!state.pendingUnlock || state.unlocking) {
            closeTokenPrompt();
            return;
        }

        const { record } = state.pendingUnlock;
        deleteSessionVaultKey(record);
        await deleteLocalFallbackTicket(record);
        completePendingUnlock();
    }

    function finishDeviceTicketSave(pendingUnlock, ticketResult) {
        setTokenStatus(
            ticketResult.protection === 'passkey-prf'
                ? 'Passkey device ticket saved. Opening record...'
                : 'Local device ticket saved. Opening record...',
            'success'
        );
        pendingUnlock.readyToOpen = true;
        setTokenPromptMode('openRecord', pendingUnlock.record);
        setTokenStatus('Device access saved. Click Open record to continue.', 'success');
        window.setTimeout(() => {
            tokenSubmit?.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 120);
    }

    async function savePendingDeviceAccess(event) {
        event.preventDefault();

        const pendingUnlock = state.pendingUnlock;
        if (!pendingUnlock) return;
        if (!pendingUnlock.rememberDeviceRequested) {
            await skipPendingDeviceAccess();
            return;
        }

        setUnlockBusy(true);
        setTokenStatus(
            canAttemptPasskeyPrf()
                ? 'Opening Windows Security...'
                : 'Saving encrypted local device ticket...',
            'success'
        );

        try {
            const ticketResult = await createDeviceTicket(
                pendingUnlock.record,
                pendingUnlock.bundlePayload,
                pendingUnlock.vaultKey
            );

            finishDeviceTicketSave(pendingUnlock, ticketResult);
        } catch (error) {
            console.warn('Device ticket creation failed:', error);
            const reason = getErrorMessage(error);
            setTokenStatus(`Device ticket was not saved: ${reason} You can try again or skip.`, 'error');
        } finally {
            setUnlockBusy(false);
        }
    }

    function completePendingSavedAccess() {
        const pendingSavedAccess = state.pendingSavedAccess;
        if (!pendingSavedAccess || !pendingSavedAccess.viewerUrl) return;

        const viewerWindow = openViewerWindow();
        if (!viewerWindow) {
            setTokenStatus('Popup blocked. Allow popups for this site first, then try again.', 'error');
            return;
        }

        writeViewerPlaceholder(viewerWindow, pendingSavedAccess.record.label);
        viewerWindow.location.replace(pendingSavedAccess.viewerUrl);

        state.pendingSavedAccess = null;
        setTokenStatus('Record unsealed. Opening in a new tab...', 'success');
        closeTokenPrompt({ restorePanelFocus: false });
        closeProjects({ restorePageFocus: false });
    }

    async function useSavedPasskeyAccess(event) {
        event.preventDefault();

        const record = state.activeRecord;
        if (!record || !getSavedPasskeyTicket(record)) return;

        setUnlockBusy(true);
        setTokenStatus('Opening Windows Security...', 'success');

        try {
            const bundlePayload = await fetchBundlePayload(record);
            const ticketRecord = getSavedPasskeyTicket(record);

            if (!ticketRecord || ticketRecord.bundleId !== getBundleId(bundlePayload)) {
                await deleteDeviceTicket(record.id, 'passkey-prf');
                throw new Error('Saved Passkey access is no longer available.');
            }

            let vaultKey;
            try {
                vaultKey = await unlockWithDeviceTicket(record, bundlePayload, ticketRecord);
            } catch (error) {
                if (error?.deviceTicketMismatch) {
                    await deleteDeviceTicket(record.id, 'passkey-prf');
                }

                throw error;
            }

            let unlockResult;
            try {
                unlockResult = await decryptBundleWithVaultKey(bundlePayload, vaultKey);
            } catch (error) {
                await deleteDeviceTicket(record.id, 'passkey-prf');
                throw createDeviceTicketMismatchError('Saved Passkey ticket no longer opens this archive.', error);
            }
            const fileMap = unpackArchive(unlockResult.archiveBytes);

            state.pendingSavedAccess = {
                record,
                bundlePayload,
                viewerUrl: buildViewerUrl(record, fileMap),
                readyToOpen: true
            };

            setTokenPromptMode('openRecord', record);
            setTokenStatus('Saved Passkey verified. Click Open record to continue.', 'success');
            window.setTimeout(() => {
                tokenSubmit?.focus({ preventScroll: true });
            }, reduceMotion ? 0 : 120);
        } catch (error) {
            console.warn('Saved Passkey access failed:', error);
            const reason = getErrorMessage(error);

            setTokenStatus(`Saved Passkey failed: ${reason} Use the token to refresh access.`, 'error');
            configureSavedPasskeyOption(record, 'token');
        } finally {
            setUnlockBusy(false);
        }
    }

    function handleTokenCancel() {
        if (state.pendingSavedAccess?.readyToOpen && !state.unlocking) {
            closeTokenPrompt();
            return;
        }

        if (state.pendingUnlock?.readyToOpen && !state.unlocking) {
            closeTokenPrompt();
            return;
        }

        if (state.pendingUnlock && !state.unlocking) {
            void skipPendingDeviceAccess();
            return;
        }

        closeTokenPrompt();
    }

    function handleTokenClose() {
        if (state.pendingSavedAccess && !state.unlocking) {
            closeTokenPrompt();
            return;
        }

        handleTokenCancel();
    }

    function handleTokenFormSubmit(event) {
        if (state.pendingSavedAccess) {
            if (state.pendingSavedAccess.readyToOpen) {
                event.preventDefault();
                completePendingSavedAccess();
                return;
            }
        }

        if (state.pendingUnlock) {
            if (state.pendingUnlock.readyToOpen) {
                event.preventDefault();
                completePendingUnlock();
                return;
            }

            savePendingDeviceAccess(event);
            return;
        }

        unlockActiveRecord(event);
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

        return [...root.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
            .filter(element => element.getClientRects().length > 0 || element === document.activeElement);
    }

    function closeTokenPrompt(options = {}) {
        const { restorePanelFocus = true } = options;

        if (!tokenOverlay || tokenOverlay.hidden) return;

        window.clearTimeout(state.tokenTimer);
        tokenOverlay.classList.remove('is-open');
        tokenOverlay.setAttribute('aria-hidden', 'true');

        const finishClose = () => {
            tokenOverlay.hidden = true;
            state.pendingUnlock = null;
            state.pendingSavedAccess = null;
            setTokenPromptMode('token', state.activeRecord);
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

        state.pendingUnlock = null;
        state.pendingSavedAccess = null;
        state.activeRecord = record;
        if (tokenMeta) {
            tokenMeta.textContent = `${record.label} · ${record.id.toUpperCase()}`;
        }
        setTokenStatus('');
        if (tokenForm) tokenForm.reset();
        setTokenPromptMode('token', record);
        setUnlockBusy(false);
        configureDevicePassOption();
        if (canAttemptPasskeyPrf()) {
            getPasskeyClientCapabilities();
        }

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
            const ticketRecord = getSavedDeviceTicket(project);
            const hasSavedAccess = state.sessionVaultKeys.has(project.id) || canUseSavedDeviceTicket(ticketRecord);

            appendRow({
                label: project.label,
                meta: hasSavedAccess
                    ? 'Saved device access is available in this browser'
                    : project.state === 'sealed' ? 'Access token required to unlock locally' : 'Published archive',
                access: hasSavedAccess ? 'Device pass' : project.state === 'sealed' ? 'Sealed' : 'Open',
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
            await loadDeviceTickets();
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
            if (state.pendingUnlock || state.pendingSavedAccess) {
                handleTokenClose();
                return;
            }
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

    async function openViewerFromVaultKey(record, bundlePayload, vaultKey, viewerWindow, options = {}) {
        const { rememberInSession = false } = options;
        const unlockResult = await decryptBundleWithVaultKey(bundlePayload, vaultKey);
        const fileMap = unpackArchive(unlockResult.archiveBytes);
        const viewerUrl = buildViewerUrl(record, fileMap);

        if (rememberInSession) {
            setSessionVaultKey(record, bundlePayload, vaultKey);
        }

        viewerWindow.location.replace(viewerUrl);
        closeTokenPrompt({ restorePanelFocus: false });
        closeProjects({ restorePageFocus: false });
    }

    async function trySavedAccess(record, viewerWindow) {
        const bundlePayload = await fetchBundlePayload(record);
        const sessionVaultKey = getSessionVaultKey(record, bundlePayload);

        if (sessionVaultKey) {
            await openViewerFromVaultKey(record, bundlePayload, sessionVaultKey, viewerWindow);
            return;
        }

        const ticketRecord = getSavedLocalFallbackTicket(record);
        if (ticketRecord && ticketRecord.bundleId !== getBundleId(bundlePayload)) {
            await deleteDeviceTicket(record.id, 'local-crypto-key');
            throw new Error('Saved local access is no longer available.');
        }

        const hasMatchingTicket = canUseSavedDeviceTicket(ticketRecord);

        if (hasMatchingTicket) {
            let vaultKey;
            try {
                vaultKey = await unlockWithDeviceTicket(record, bundlePayload, ticketRecord);
            } catch (error) {
                if (!(error && error.name === 'NotAllowedError')) {
                    await deleteDeviceTicket(record.id, 'local-crypto-key');
                }

                throw error;
            }

            await openViewerFromVaultKey(record, bundlePayload, vaultKey, viewerWindow);
            return;
        }

        throw new Error('No saved device access is available.');
    }

    async function openRecord(recordId) {
        const record = state.projects.find(project => project.id === recordId);
        if (!record) return;

        const passkeyTicket = getSavedPasskeyTicket(record);
        const fallbackTicket = getSavedLocalFallbackTicket(record);
        const ticketRecord = getSavedDeviceTicket(record);
        const hasSessionAccess = state.sessionVaultKeys.has(record.id);
        const hasSavedAccess = hasSessionAccess || canUseSavedDeviceTicket(ticketRecord);

        if (!hasSavedAccess) {
            openTokenPrompt(record.id);
            return;
        }

        if (!hasSessionAccess && passkeyTicket && !fallbackTicket) {
            openTokenPrompt(record.id);
            setTokenStatus('Saved Passkey unlock is available below the token field.', 'success');
            return;
        }

        const viewerWindow = openViewerWindow();
        if (!viewerWindow) {
            openTokenPrompt(record.id);
            setTokenStatus('Popup blocked. Enter the token after allowing popups for this site.', 'error');
            return;
        }

        writeViewerPlaceholder(viewerWindow, record.label);

        try {
            await trySavedAccess(record, viewerWindow);
        } catch (error) {
            viewerWindow.close();
            if (passkeyTicket) {
                openTokenPrompt(record.id);
                setTokenStatus(
                    error instanceof Error
                        ? `${error.message} Saved Passkey unlock is available below the token field.`
                        : 'Saved Passkey access requires confirmation.',
                    'error'
                );
            } else {
                openTokenPrompt(record.id);
                setTokenStatus(error instanceof Error ? error.message : 'Saved access failed. Enter the token again.', 'error');
            }
        }
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

        const shouldRememberDevice = Boolean(
            devicePassInput &&
            !devicePassInput.disabled &&
            devicePassInput.checked
        );

        setUnlockBusy(true);
        setTokenStatus('Decrypting archive...', 'success');

        try {
            const bundlePayload = await fetchBundlePayload(state.activeRecord);
            configureDevicePassOption(bundlePayload, { resetChoice: false });

            const unlockResult = await decryptBundleWithToken(bundlePayload, token);
            const fileMap = unpackArchive(unlockResult.archiveBytes);
            const viewerUrl = buildViewerUrl(state.activeRecord, fileMap);

            if (shouldRememberDevice && unlockResult.vaultKey && canAttemptPersistentDevicePass()) {
                showDeviceSavePrompt({
                    record: state.activeRecord,
                    bundlePayload,
                    vaultKey: unlockResult.vaultKey,
                    viewerUrl,
                    viewerWindow: null
                });
                return;
            }

            if (!shouldRememberDevice) {
                deleteSessionVaultKey(state.activeRecord);
                await deleteLocalFallbackTicket(state.activeRecord);
            }

            showOpenRecordPrompt({
                record: state.activeRecord,
                bundlePayload,
                vaultKey: unlockResult.vaultKey,
                viewerUrl,
                viewerWindow: null
            });
        } catch (error) {
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
                handleTokenClose();
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

            openRecord(action.dataset.taskId);
        });

        tokenClose?.addEventListener('click', handleTokenClose);
        tokenCancel?.addEventListener('click', handleTokenCancel);
        tokenOverlay?.addEventListener('click', event => {
            if (event.target === tokenOverlay && !state.unlocking) {
                handleTokenClose();
            }
        });
        savedPasskeyButton?.addEventListener('click', useSavedPasskeyAccess);
        tokenForm?.addEventListener('submit', handleTokenFormSubmit);

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
