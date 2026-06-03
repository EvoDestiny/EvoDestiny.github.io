(() => {
    const ease = 'cubic-bezier(0.23, 1, 0.32, 1)';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── i18n ────────────────────────────────────────────────────────────────────
    const TRANSLATIONS = {
        en: {
            phrases: ['Developer & Creator.', 'Crafting elegant digital experiences.', 'Passionate about clean code & design.'],
            greeting: "Hello, I'm",
            nav_projects: 'Projects',
            project_kicker: 'Private Archive',
            project_title: 'Choose your record',
            project_description: 'Select a project below. If the record is sealed, the next step will ask for its access token and unlock it locally in your browser.',
            project_footnote: 'Tokens are verified locally. Nothing is written back into the public site.',
            pl_archive: 'Project archive',
            pl_preparing: 'Preparing sealed records',
            pl_offline: 'Manifest could not be reached',
            pl_empty: 'No sealed records are published yet',
            pl_saved_meta: 'Saved device access is available in this browser',
            pl_sealed_meta: 'Access token required to unlock locally',
            pl_open_meta: 'Published archive',
            pl_show_more: 'Show more',
            pl_show_less: 'Show less',
            st_sealed: 'sealed',
            st_open: 'open',
            st_device_pass: 'device pass',
            st_loading: 'loading',
            st_offline: 'offline',
            st_empty: 'empty',
            token_kicker: 'Private Access',
            tok_title_token: 'Enter your token',
            tok_title_open: 'Open record',
            tok_title_save: 'Save device access?',
            tok_title_owner: 'Confirm owner code',
            tok_desc_open: 'Device access is saved. Open the record in a new tab to continue.',
            tok_desc_save: 'Save a Passkey for this record. Windows Security may ask you to confirm; if it cannot complete, this browser will save an encrypted local device ticket instead.',
            tok_desc_passkey: 'Passkey accepted. Enter the top-left owner code to finish decrypting this saved device ticket.',
            tok_desc_fallback: 'Enter the top-left owner code. This browser key unlocks the saved local fallback ticket.',
            tok_desc_record: 'Use the access token for {0}. Saving device access also requires the private token.',
            tok_desc_default: 'Use the access token for this record. The archive is decrypted locally in your browser and opened in a new tab.',
            tok_submit_token: 'Continue with token',
            tok_submit_open: 'Open record',
            tok_submit_save: 'Save Passkey',
            tok_submit_owner: 'Continue with owner code',
            tok_cancel_token: 'Back',
            tok_cancel_open: 'Close',
            tok_cancel_save: 'Skip',
            tok_label_token: 'Access token',
            tok_label_owner: 'Owner code',
            tok_ph_token: 'Access token',
            tok_ph_owner: 'Owner code',
            tok_note_token: 'The access token is never stored. Device saving requires the private token; fallback browser-key tickets are limited to 5 uses or 24 hours.',
            tok_note_open: 'The next click opens the decrypted record from this browser session.',
            tok_note_save: 'This happens after the token has been verified, so a failed Passkey attempt will not block opening the record.',
            tok_note_passkey: 'The saved Passkey ticket was enrolled with the private token; unlock now uses this device and owner code.',
            tok_note_fallback: 'The local fallback ticket was enrolled with the private token and is limited to 5 uses or 24 hours.',
            priv_token_label: 'Private token',
            priv_token_ph: 'Private token',
            dev_pass_title: 'Remember this device with Passkey',
            dev_id_label: 'Type the visible owner code',
            dev_id_detail: 'Type the code shown in the top-left corner to save this device.',
            priv_token_detail: 'Required only when saving device access.',
            passkey_btn: 'Use saved Passkey',
            passkey_detail: 'Saved Passkey unlock is available. Windows Security opens only after you choose Use saved Passkey, then owner code is required.',
            dp_avail_passkey: 'Saving device access requires the private token; saved Passkey unlock later uses the owner code.',
            dp_avail_local: 'Saving device access requires the private token; local fallback unlock later uses the owner code.',
            dp_unavail_bundle: 'This record must be resealed with private device authorization before it can be remembered.',
            dp_unavail_domain: 'Use localhost or the GitHub Pages HTTPS domain; IP origins only get session access.',
            dp_unavail_storage: 'This browser will fall back to session-only access if persistent local storage is unavailable.',
            close_proj_aria: 'Close project archive',
            close_tok_aria: 'Close token prompt',
            msg_enter_token: 'Enter the token to unseal this record.',
            msg_check_owner: 'Checking owner code...',
            msg_decrypting: 'Decrypting archive...',
            msg_check_priv: 'Checking private token...',
            msg_popup: 'Popup blocked. Allow popups for this site first, then try again.',
            msg_popup_tok: 'Popup blocked. Enter the token after allowing popups for this site.',
            msg_unsealed: 'Record unsealed. Opening in a new tab...',
            msg_tok_ok: 'Token accepted. Click Open record to continue.',
            msg_tok_warn: 'Token accepted, but owner verification needs attention.',
            msg_tok_save: 'Token accepted. Save this device for faster local unlocks.',
            msg_open_no_save: 'Open without saving device access.',
            msg_no_verify: 'Device access was not saved because archive ownership could not be verified.',
            msg_win_sec: 'Opening Windows Security...',
            msg_saving_local: 'Saving encrypted local device ticket...',
            msg_passkey_saved: 'Passkey device ticket saved. Opening record...',
            msg_local_saved: 'Local device ticket saved. Opening record...',
            msg_dev_saved: 'Device access saved. Click Open record to continue.',
            msg_passkey_ok: 'Passkey accepted. Type the visible owner code to continue.',
            msg_dec_passkey: 'Decrypting saved Passkey access...',
            msg_passkey_ver: 'Saved Passkey verified. Click Open record to continue.',
            msg_type_own_pk: 'Type the visible owner code to unlock saved Passkey access.',
            msg_type_own_lc: 'Type the visible owner code to unlock saved local access.',
            msg_dec_local: 'Decrypting saved local access...',
            msg_own_fail: 'Owner code verification failed. Recheck the top-left code before continuing.',
            msg_pk_avail: 'Saved Passkey unlock is available below the token field. It requires the owner code.',
            msg_keyboard: 'Type the visible owner code with the keyboard.',
            msg_dev_fail: 'Device ticket was not saved: {0} You can try again or skip.',
            msg_pk_fail: 'Saved Passkey failed: {0} Use the token to refresh access.',
            msg_pk_err: 'Saved Passkey access failed. Recheck the owner code or enter the access token again.',
            msg_lc_err: 'Saved local access failed. Recheck the owner code or enter the access token again.',
            msg_recheck: '{0} Recheck the owner code or enter the access token again.',
            msg_pk_recheck: '{0} Saved Passkey unlock is available below the token field and requires the owner code.',
            msg_unable: 'Unable to unlock this record.',
            risk_title: 'Owner verification warning',
            risk_code_fail: 'Verification failed',
            risk_integrity: 'Page integrity',
            risk_integrity_v: 'Check the original site before continuing',
            risk_risk: 'Risk',
            risk_risk_v: 'Altered or impersonated submission',
            risk_msg: 'The owner code did not pass security verification. If the code you typed matches the top-left code, check whether this page was altered or is being used as an impersonated submission.',
            risk_action: 'Review owner code',
            ov_verified: 'Verified archive owner',
            ov_warning: 'Owner verification warning',
            ov_owner_code: 'Owner code',
            ov_site: 'Canonical site',
            ov_repo: 'Canonical repo',
            ov_task: 'Task ID',
            ov_bundle: 'Bundle ID',
            ov_sig: 'Signature',
            ov_key: 'Public key',
        },
        zh: {
            phrases: ['开发者 & 创作者。', '匠心打造精致数字体验。', '热爱简洁代码与优雅设计。'],
            greeting: '你好，我是',
            nav_projects: '项目',
            project_kicker: '私人档案馆',
            project_title: '选择你的档案',
            project_description: '在下方选择一个项目。若档案已封存，下一步将要求输入访问令牌并在本地浏览器中解锁。',
            project_footnote: '令牌仅在本地验证，不会写入公共站点。',
            pl_archive: '项目档案',
            pl_preparing: '正在准备封存记录',
            pl_offline: '档案清单无法访问',
            pl_empty: '暂无已发布的封存记录',
            pl_saved_meta: '此浏览器已保存设备访问',
            pl_sealed_meta: '需要访问令牌以在本地解锁',
            pl_open_meta: '已发布档案',
            pl_show_more: '显示更多',
            pl_show_less: '收起',
            st_sealed: '已封存',
            st_open: '已开放',
            st_device_pass: '设备通行证',
            st_loading: '加载中',
            st_offline: '离线',
            st_empty: '空',
            token_kicker: '私人访问',
            tok_title_token: '输入您的令牌',
            tok_title_open: '打开记录',
            tok_title_save: '保存设备访问？',
            tok_title_owner: '确认所有者代码',
            tok_desc_open: '设备访问已保存。在新标签页中打开记录以继续。',
            tok_desc_save: '为此记录保存 Passkey。Windows 安全中心可能会要求您确认；若无法完成，浏览器将保存加密的本地设备票据。',
            tok_desc_passkey: 'Passkey 已接受。请输入左上角的所有者代码以完成解密。',
            tok_desc_fallback: '请输入左上角的所有者代码。此浏览器密钥将解锁已保存的本地备用票据。',
            tok_desc_record: '使用 {0} 的访问令牌。保存设备访问还需要私人令牌。',
            tok_desc_default: '使用此记录的访问令牌。档案将在您的浏览器本地解密，并在新标签页中打开。',
            tok_submit_token: '使用令牌继续',
            tok_submit_open: '打开记录',
            tok_submit_save: '保存 Passkey',
            tok_submit_owner: '使用所有者代码继续',
            tok_cancel_token: '返回',
            tok_cancel_open: '关闭',
            tok_cancel_save: '跳过',
            tok_label_token: '访问令牌',
            tok_label_owner: '所有者代码',
            tok_ph_token: '访问令牌',
            tok_ph_owner: '所有者代码',
            tok_note_token: '访问令牌不会被存储。保存设备需要私人令牌；备用浏览器密钥票据最多使用 5 次或 24 小时。',
            tok_note_open: '下一次点击将从此浏览器会话中打开已解密的记录。',
            tok_note_save: '令牌验证后才会执行此操作，因此 Passkey 失败不会阻止记录打开。',
            tok_note_passkey: '已保存的 Passkey 票据是用私人令牌注册的；现在使用此设备和所有者代码解锁。',
            tok_note_fallback: '本地备用票据是用私人令牌注册的，最多使用 5 次或 24 小时。',
            priv_token_label: '私人令牌',
            priv_token_ph: '私人令牌',
            dev_pass_title: '用 Passkey 记住此设备',
            dev_id_label: '输入可见的所有者代码',
            dev_id_detail: '输入左上角显示的代码以保存此设备。',
            priv_token_detail: '仅在保存设备访问时需要。',
            passkey_btn: '使用已保存的 Passkey',
            passkey_detail: '已保存 Passkey 解锁可用。选择后 Windows 安全中心才会打开，之后需要所有者代码。',
            dp_avail_passkey: '保存设备访问需要私人令牌；之后 Passkey 解锁使用所有者代码。',
            dp_avail_local: '保存设备访问需要私人令牌；之后本地备用解锁使用所有者代码。',
            dp_unavail_bundle: '此记录需要重新封装后才能保存设备授权。',
            dp_unavail_domain: '请使用 localhost 或 GitHub Pages HTTPS 域名；IP 来源只能获得会话访问。',
            dp_unavail_storage: '如果持久本地存储不可用，此浏览器将回退到仅会话访问。',
            close_proj_aria: '关闭项目档案',
            close_tok_aria: '关闭令牌提示',
            msg_enter_token: '请输入令牌以解封此记录。',
            msg_check_owner: '正在验证所有者代码…',
            msg_decrypting: '正在解密档案…',
            msg_check_priv: '正在验证私人令牌…',
            msg_popup: '弹窗被拦截。请先允许此站点弹窗，然后重试。',
            msg_popup_tok: '弹窗被拦截。允许弹窗后请输入令牌。',
            msg_unsealed: '记录已解封，正在新标签页中打开…',
            msg_tok_ok: '令牌已接受。点击"打开记录"继续。',
            msg_tok_warn: '令牌已接受，但所有者验证需要注意。',
            msg_tok_save: '令牌已接受。保存此设备以便更快速的本地解锁。',
            msg_open_no_save: '不保存设备访问，直接打开。',
            msg_no_verify: '由于无法验证档案所有权，设备访问未被保存。',
            msg_win_sec: '正在打开 Windows 安全中心…',
            msg_saving_local: '正在保存加密本地设备票据…',
            msg_passkey_saved: 'Passkey 设备票据已保存，正在打开记录…',
            msg_local_saved: '本地设备票据已保存，正在打开记录…',
            msg_dev_saved: '设备访问已保存。点击"打开记录"继续。',
            msg_passkey_ok: 'Passkey 已接受。请输入可见的所有者代码以继续。',
            msg_dec_passkey: '正在解密已保存的 Passkey 访问…',
            msg_passkey_ver: '已保存的 Passkey 已验证。点击"打开记录"继续。',
            msg_type_own_pk: '请输入可见的所有者代码以解锁已保存的 Passkey 访问。',
            msg_type_own_lc: '请输入可见的所有者代码以解锁已保存的本地访问。',
            msg_dec_local: '正在解密已保存的本地访问…',
            msg_own_fail: '所有者代码验证失败。继续前请重新检查左上角代码。',
            msg_pk_avail: '令牌输入框下方有已保存的 Passkey 解锁，需要所有者代码。',
            msg_keyboard: '请用键盘输入可见的所有者代码。',
            msg_dev_fail: '设备票据未能保存：{0} 您可以重试或跳过。',
            msg_pk_fail: '已保存的 Passkey 失败：{0} 请使用令牌刷新访问。',
            msg_pk_err: '已保存的 Passkey 访问失败。请重新检查所有者代码或重新输入访问令牌。',
            msg_lc_err: '已保存的本地访问失败。请重新检查所有者代码或重新输入访问令牌。',
            msg_recheck: '{0} 请重新检查所有者代码或重新输入访问令牌。',
            msg_pk_recheck: '{0} 令牌输入框下方有已保存的 Passkey 解锁，需要所有者代码。',
            msg_unable: '无法解锁此记录。',
            risk_title: '所有者验证警告',
            risk_code_fail: '验证失败',
            risk_integrity: '页面完整性',
            risk_integrity_v: '继续前请检查原始站点',
            risk_risk: '风险',
            risk_risk_v: '页面被篡改或冒充提交',
            risk_msg: '所有者代码未通过安全验证。如果您输入的代码与左上角代码一致，请检查此页面是否被篡改或用于冒充提交。',
            risk_action: '查看所有者代码',
            ov_verified: '已验证档案所有者',
            ov_warning: '所有者验证警告',
            ov_owner_code: '所有者代码',
            ov_site: '规范站点',
            ov_repo: '规范仓库',
            ov_task: '任务 ID',
            ov_bundle: '包 ID',
            ov_sig: '签名',
            ov_key: '公钥',
        }
    };

    let currentLang = (() => {
        try {
            const saved = localStorage.getItem('evo-lang');
            if (saved) return saved;
            const browserLang = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
            return browserLang.startsWith('zh') ? 'zh' : 'en';
        } catch (e) { return 'en'; }
    })();
    const t = (key) => {
        const tr = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
        return tr[key] !== undefined ? tr[key] : (TRANSLATIONS.en[key] !== undefined ? TRANSLATIONS.en[key] : key);
    };
    const tFmt = (key, ...args) => {
        let s = t(key);
        args.forEach((v, i) => { s = s.replace(`{${i}}`, v); });
        return s;
    };
    // ────────────────────────────────────────────────────────────────────────────

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
    const passkeyOwnerCodeBinding = 'owner-hash-private-token-v1';
    const localOwnerCodeBinding = 'local-secret-private-token-v1';
    const privateTokenBinding = 'device-grant-v1';
    const collapsedProjectLimit = 3;
    const textDecoder = new TextDecoder();
    const textEncoder = new TextEncoder();

    let phrases = TRANSLATIONS[currentLang].phrases || TRANSLATIONS.en.phrases;

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
    const projectMore = document.getElementById('project-more');
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
    const ownerVerificationPanel = document.getElementById('owner-verification');
    const tokenField = tokenForm?.querySelector('.token-field') || null;
    const tokenLabel = document.getElementById('token-label');
    const tokenNote = tokenForm?.querySelector('.token-note') || null;
    const devicePassInput = document.getElementById('device-pass-input');
    const devicePassOption = document.getElementById('device-pass-option');
    const devicePassDetail = document.getElementById('device-pass-detail');
    const deviceIdConfirm = document.getElementById('device-id-confirm');
    const deviceIdInput = document.getElementById('device-id-input');
    const privateTokenConfirm = document.getElementById('private-token-confirm');
    const privateTokenInput = document.getElementById('private-token-input');
    const defaultTokenNote = tokenNote ? tokenNote.textContent : '';

    const state = {
        activeRecord: null,
        activeBundlePayload: null,
        bundleCache: new Map(),
        closeTimer: 0,
        devicePassDb: null,
        devicePassDbReady: null,
        deviceTickets: new Map(),
        manifestError: '',
        manifestLoaded: false,
        pendingUnlock: null,
        pendingSavedAccess: null,
        pendingPasskeyAccess: null,
        pendingFallbackAccess: null,
        projectsExpanded: false,
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
    let ownerRiskDialog = null;
    let ownerRiskLastFocusedElement = null;

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

    function stableStringify(value) {
        if (Array.isArray(value)) {
            return `[${value.map(stableStringify).join(',')}]`;
        }

        if (value && typeof value === 'object') {
            return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
        }

        return JSON.stringify(value);
    }

    async function sha256Base64url(value) {
        const bytes = typeof value === 'string' ? textEncoder.encode(value) : value;
        const digest = await window.crypto.subtle.digest('SHA-256', bytes);
        return bytesToBase64url(new Uint8Array(digest));
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

    function clearClipboardSilently() {
        if (!window.isSecureContext || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            return;
        }

        navigator.clipboard.writeText('').catch(() => {});
    }

    const ownerCodeGuard = (() => {
        const selectorBytes = [46, 111, 119, 110, 101, 114, 45, 99, 111, 100, 101];
        const compactDigits = value => String(value ?? '').replace(/\D/g, '');
        const rotate = (value, bits) => ((value << bits) | (value >>> (32 - bits))) >>> 0;
        const sameText = (left, right) => {
            const a = String(left ?? '');
            const b = String(right ?? '');
            const length = Math.max(a.length, b.length);
            let delta = a.length ^ b.length;

            for (let index = 0; index < length; index += 1) {
                delta |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
            }

            return delta === 0;
        };
        const mixDigits = value => {
            const digits = compactDigits(value);
            const lanes = [
                (0x6d2b79f5 ^ digits.length) >>> 0,
                (0x1b873593 + digits.length) >>> 0,
                (0x85ebca6b ^ (digits.length << 16)) >>> 0,
                0xc2b2ae35
            ];

            for (let index = 0; index < digits.length; index += 1) {
                const digit = digits.charCodeAt(index) - 48;
                const lane = index & 3;
                const salt = ((digit + 1) * (index + 17)) ^ ((index + 1) << 8);
                lanes[lane] = Math.imul(
                    rotate(lanes[lane] ^ salt, ((digit + index) % 17) + 5),
                    0x9e3779b1
                ) >>> 0;
                lanes[(lane + 1) & 3] = (
                    lanes[(lane + 1) & 3] ^
                    rotate((lanes[lane] + digit + index) >>> 0, ((index * 3 + digit) % 19) + 3)
                ) >>> 0;
            }

            const folded = lanes.reduce(
                (accumulator, lane, index) => (accumulator ^ rotate(lane, (index * 7) + 3)) >>> 0,
                (0xa5a5a5a5 ^ digits.length) >>> 0
            );
            const shadow = Array.from(digits)
                .map((digit, index) => String.fromCharCode(97 + (((digit.charCodeAt(0) - 48) + index + digits.length) % 26)))
                .reverse()
                .join('');

            return `${digits.length.toString(36)}:${lanes.map(lane => lane.toString(36)).join('.')}:${folded.toString(36)}:${shadow}`;
        };
        const readVisible = () => {
            const selector = String.fromCharCode(...selectorBytes);
            const host = document.querySelector(selector);
            if (!host) return '';

            const fragments = host.children.length
                ? Array.from(host.children).map(node => node.textContent || '')
                : [host.textContent || ''];

            return compactDigits(fragments.join(''));
        };
        const prove = candidate => {
            const typedCode = compactDigits(candidate);
            const visibleCode = readVisible();
            const typedMirror = Array.from(typedCode).reverse().join('');
            const visibleMirror = Array.from(visibleCode).reverse().join('');
            const ok = Boolean(
                typedCode &&
                visibleCode &&
                sameText(mixDigits(typedCode), mixDigits(visibleCode)) &&
                sameText(mixDigits(typedMirror), mixDigits(visibleMirror)) &&
                sameText(typedCode, visibleCode)
            );

            return { ok, typedCode, visibleCode };
        };

        return {
            read: readVisible,
            prove,
            sameText
        };
    })();

    function getDisplayedOwnerCode() {
        return ownerCodeGuard.read();
    }

    function getOwnerCodeFromOwner(owner) {
        if (!owner || typeof owner !== 'object') return '';

        return owner.ownerCode || '';
    }

    function cloneOwnerWithOwnerCode(owner, ownerCode) {
        return {
            ...(owner || {}),
            ownerCode
        };
    }

    async function getClaimedOwnerHash(bundlePayload, claimedOwnerCode = getDisplayedOwnerCode()) {
        if (!bundlePayload || bundlePayload.version < 4) {
            return null;
        }

        if (!bundlePayload.owner || !claimedOwnerCode) {
            throw new Error('Archive owner binding is unavailable.');
        }

        return sha256Base64url(stableStringify(cloneOwnerWithOwnerCode(bundlePayload.owner, claimedOwnerCode)));
    }

    async function verifyTypedOwnerCode(bundlePayload, value) {
        const proof = ownerCodeGuard.prove(value || '');

        if (!proof.ok) {
            return {
                ...proof,
                reason: 'mismatch'
            };
        }

        if (bundlePayload?.version >= 4) {
            try {
                const claimedHash = await getClaimedOwnerHash(bundlePayload, proof.typedCode);
                if (!ownerCodeGuard.sameText(claimedHash, bundlePayload.ownerHash || '')) {
                    return {
                        ...proof,
                        ok: false,
                        ownerHash: claimedHash,
                        reason: 'owner-binding'
                    };
                }

                const signatureResult = await verifyOwnerSignature(bundlePayload.owner, bundlePayload.ownerSignature);
                if (!signatureResult.valid) {
                    return {
                        ...proof,
                        ok: false,
                        ownerHash: claimedHash,
                        signatureResult,
                        reason: 'owner-signature'
                    };
                }

                return {
                    ...proof,
                    ownerHash: claimedHash,
                    signatureResult
                };
            } catch (error) {
                return {
                    ...proof,
                    ok: false,
                    reason: 'owner-binding-unavailable'
                };
            }
        }

        return proof;
    }

    async function verifyRememberOwnerCode(bundlePayload) {
        return verifyTypedOwnerCode(bundlePayload, deviceIdInput?.value || '');
    }

    function closeOwnerCodeRiskDialog(options = {}) {
        const { restoreFocus = true } = options;
        if (!ownerRiskDialog || ownerRiskDialog.hidden) return;

        ownerRiskDialog.classList.remove('is-open');
        ownerRiskDialog.setAttribute('aria-hidden', 'true');

        const finishClose = () => {
            ownerRiskDialog.hidden = true;
            if (restoreFocus && ownerRiskLastFocusedElement instanceof HTMLElement) {
                ownerRiskLastFocusedElement.focus({ preventScroll: true });
            }
            ownerRiskLastFocusedElement = null;
        };

        if (reduceMotion) {
            finishClose();
            return;
        }

        window.setTimeout(finishClose, 180);
    }

    function ensureOwnerCodeRiskDialog() {
        if (ownerRiskDialog) return ownerRiskDialog;

        const dialog = document.createElement('div');
        dialog.className = 'owner-risk';
        dialog.hidden = true;
        dialog.setAttribute('aria-hidden', 'true');
        dialog.innerHTML = `
            <section class="owner-risk-panel owner-verification" data-tone="error" role="alertdialog" aria-modal="true" aria-labelledby="owner-risk-title" aria-describedby="owner-risk-message" tabindex="-1">
                <p class="owner-verification-title" id="owner-risk-title">${escapeHtml(t('risk_title'))}</p>
                <dl class="owner-verification-grid">
                    <dt>${escapeHtml(t('ov_owner_code'))}</dt>
                    <dd id="owner-risk-code">${escapeHtml(t('risk_code_fail'))}</dd>
                    <dt>${escapeHtml(t('risk_integrity'))}</dt>
                    <dd>${escapeHtml(t('risk_integrity_v'))}</dd>
                    <dt>${escapeHtml(t('risk_risk'))}</dt>
                    <dd>${escapeHtml(t('risk_risk_v'))}</dd>
                </dl>
                <p class="owner-verification-message" id="owner-risk-message">
                    ${escapeHtml(t('risk_msg'))}
                </p>
                <button type="button" class="owner-risk-action">${escapeHtml(t('risk_action'))}</button>
            </section>
        `;

        const panel = dialog.querySelector('.owner-risk-panel');
        const action = dialog.querySelector('.owner-risk-action');

        action?.addEventListener('click', () => closeOwnerCodeRiskDialog());
        dialog.addEventListener('click', event => {
            if (event.target === dialog) {
                closeOwnerCodeRiskDialog();
            }
        });
        panel?.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                closeOwnerCodeRiskDialog();
            }
        });

        document.body.appendChild(dialog);
        ownerRiskDialog = dialog;
        return ownerRiskDialog;
    }

    function showOwnerCodeRiskWarning() {
        setTokenStatus(t('msg_own_fail'), 'error');

        const dialog = ensureOwnerCodeRiskDialog();
        const panel = dialog.querySelector('.owner-risk-panel');
        const action = dialog.querySelector('.owner-risk-action');
        const codeRow = dialog.querySelector('#owner-risk-code');
        ownerRiskLastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (codeRow) {
            codeRow.textContent = getDisplayedOwnerCode() || 'Unavailable';
        }
        dialog.hidden = false;
        dialog.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            dialog.classList.add('is-open');
        });

        window.setTimeout(() => {
            (action || panel)?.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 80);
    }

    function getBundleId(bundlePayload) {
        if (bundlePayload && bundlePayload.bundleId) {
            return bundlePayload.bundleId;
        }

        return bundlePayload && bundlePayload.taskId
            ? `legacy:${bundlePayload.version}:${bundlePayload.taskId}`
            : 'legacy:unknown';
    }

    function supportsPrivateDeviceGrant(bundlePayload) {
        const grant = bundlePayload?.deviceGrant;
        return Boolean(
            bundlePayload &&
            bundlePayload.version >= 6 &&
            grant &&
            grant.type === 'private-token-argon2id' &&
            grant.cipher === 'AES-GCM' &&
            grant.kdf?.name === 'Argon2id'
        );
    }

    function getDeviceGrantSiteContext(bundlePayload, ownerHash = '') {
        const owner = bundlePayload?.owner || {};
        const ownerSignature = bundlePayload?.ownerSignature || {};

        return {
            version: 1,
            origin: window.location.origin,
            taskId: bundlePayload?.taskId || '',
            bundleId: getBundleId(bundlePayload),
            ownerHash: ownerHash || '',
            canonicalSite: owner.canonicalSite || '',
            canonicalRepo: owner.canonicalRepo || '',
            publicKeyFingerprint: ownerSignature.publicKeyFingerprint || ''
        };
    }

    async function getDeviceGrantBinding(bundlePayload, ownerHash = '') {
        return sha256Base64url(stableStringify(getDeviceGrantSiteContext(bundlePayload, ownerHash)));
    }

    function createPrivateTokenError(message, cause) {
        const error = new Error(message);
        error.privateTokenError = true;
        error.cause = cause;
        return error;
    }

    function getSessionVaultKey(record, bundlePayload, ownerHash = '') {
        const cached = state.sessionVaultKeys.get(record.id);
        const now = Date.now();

        if (!cached || cached.bundleId !== getBundleId(bundlePayload) || cached.ownerHash !== ownerHash) {
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

    function setSessionVaultKey(record, bundlePayload, vaultKey, ownerHash = '') {
        if (!vaultKey || !bundlePayload || ![3, 4, 5, 6].includes(bundlePayload.version)) {
            return;
        }

        if (bundlePayload.version >= 4 && !ownerHash) {
            return;
        }

        const now = Date.now();

        state.sessionVaultKeys.set(record.id, {
            bundleId: getBundleId(bundlePayload),
            ownerHash,
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
            vaultKey: payload.vaultKey ? new Uint8Array(payload.vaultKey) : null,
            deviceGrantKey: payload.deviceGrantKey ? new Uint8Array(payload.deviceGrantKey) : null
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
        if (!message.bundlePayload || ![2, 3, 4, 5, 6].includes(message.bundlePayload.version)) {
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

    async function decryptBundleWithToken(bundlePayload, token, ownerHash = null) {
        return runDecryptWorker({
            mode: 'token',
            token,
            bundlePayload,
            ownerHash
        });
    }

    async function decryptBundleWithVaultKey(bundlePayload, vaultKey, ownerHash = null) {
        return runDecryptWorker({
            mode: 'vaultKey',
            vaultKey,
            bundlePayload,
            ownerHash
        });
    }

    async function unwrapDeviceGrantWithPrivateToken(bundlePayload, privateToken, ownerHash = '') {
        if (!supportsPrivateDeviceGrant(bundlePayload)) {
            throw createPrivateTokenError('This record must be resealed before device access can be saved.');
        }

        if (!privateToken) {
            throw createPrivateTokenError('Enter the private token for device access.');
        }

        try {
            const result = await runDecryptWorker({
                mode: 'deviceGrant',
                privateToken,
                bundlePayload,
                ownerHash
            });

            if (!result.deviceGrantKey) {
                throw new Error('Private device authorization is unavailable.');
            }

            return {
                deviceGrantKey: result.deviceGrantKey,
                deviceGrantBinding: await getDeviceGrantBinding(bundlePayload, ownerHash)
            };
        } catch (error) {
            if (error?.privateTokenError) {
                throw error;
            }

            throw createPrivateTokenError('Private token could not authorize device access.', error);
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

    function removeDocumentIcons(doc) {
        doc.querySelectorAll('link[rel]').forEach(link => {
            const relation = (link.getAttribute('rel') || '').toLowerCase();
            if (relation.includes('icon')) {
                link.remove();
            }
        });
    }

    async function verifyOwnerSignature(owner, ownerSignature) {
        if (!ownerSignature || ownerSignature.algorithm !== 'Ed25519' || !ownerSignature.publicKeySpki || !ownerSignature.signature) {
            return { status: 'missing', valid: false };
        }

        if (!window.crypto?.subtle || typeof window.crypto.subtle.importKey !== 'function') {
            return { status: 'unsupported', valid: false };
        }

        try {
            const publicKeyBytes = base64ToBytes(ownerSignature.publicKeySpki);
            const expectedFingerprint = `sha256-${await sha256Base64url(publicKeyBytes)}`;
            const fingerprintMatches = ownerSignature.publicKeyFingerprint === expectedFingerprint;
            const key = await window.crypto.subtle.importKey(
                'spki',
                publicKeyBytes,
                { name: 'Ed25519' },
                false,
                ['verify']
            );
            const valid = await window.crypto.subtle.verify(
                { name: 'Ed25519' },
                key,
                base64urlToBytes(ownerSignature.signature),
                textEncoder.encode(stableStringify(owner))
            );

            return {
                status: valid && fingerprintMatches ? 'valid' : 'invalid',
                valid: valid && fingerprintMatches,
                publicKeyFingerprint: ownerSignature.publicKeyFingerprint || expectedFingerprint
            };
        } catch (error) {
            const unsupportedNames = ['NotSupportedError', 'DataError'];
            if (unsupportedNames.includes(error?.name)) {
                return {
                    status: 'unsupported',
                    valid: false,
                    publicKeyFingerprint: ownerSignature.publicKeyFingerprint || ''
                };
            }

            return {
                status: 'invalid',
                valid: false,
                publicKeyFingerprint: ownerSignature.publicKeyFingerprint || ''
            };
        }
    }

    async function verifyBundleOwner(record, bundlePayload, fileMap, ownerHash) {
        if (!bundlePayload || bundlePayload.version < 4) {
            return {
                ownerVerified: false,
                signatureStatus: 'legacy',
                claimedOwnerCode: getDisplayedOwnerCode(),
                owner: null,
                ownerHash: ownerHash || '',
                taskId: record.id,
                bundleId: getBundleId(bundlePayload),
                messages: ['This archive was sealed before owner verification was added.']
            };
        }

        const claimedOwnerCode = getDisplayedOwnerCode();
        const meta = readVaultMeta(fileMap);
        const messages = [];
        const bundleOwner = bundlePayload.owner || null;
        const archiveOwner = meta.owner || null;
        const ownerSignature = bundlePayload.ownerSignature || null;
        let computedOwnerHash = '';
        let claimedOwnerHash = '';

        if (!bundleOwner || !archiveOwner) {
            messages.push('Owner metadata is missing.');
        }

        if (!claimedOwnerCode) {
            messages.push('The visible owner code is missing.');
        }

        if (bundleOwner) {
            computedOwnerHash = await sha256Base64url(stableStringify(bundleOwner));
            if (claimedOwnerCode) {
                claimedOwnerHash = await getClaimedOwnerHash(bundlePayload, claimedOwnerCode);
            }
        }

        if (bundlePayload.ownerHash !== computedOwnerHash || meta.ownerHash !== computedOwnerHash || ownerHash !== claimedOwnerHash) {
            messages.push('Owner binding does not match this page.');
        }

        if (stableStringify(bundleOwner) !== stableStringify(archiveOwner)) {
            messages.push('Archive owner metadata differs from the public bundle owner.');
        }

        if (stableStringify(ownerSignature) !== stableStringify(meta.ownerSignature || null)) {
            messages.push('Archive owner signature differs from the public bundle signature.');
        }

        if (claimedOwnerCode !== getOwnerCodeFromOwner(bundleOwner)) {
            messages.push('Visible owner code does not match archive owner.');
        }

        const signatureResult = await verifyOwnerSignature(bundleOwner, ownerSignature);
        if (!signatureResult.valid) {
            messages.push(`Owner signature is ${signatureResult.status}.`);
        }

        return {
            ownerVerified: messages.length === 0 && signatureResult.valid,
            signatureStatus: signatureResult.status,
            claimedOwnerCode,
            owner: bundleOwner,
            ownerHash: computedOwnerHash,
            taskId: record.id,
            bundleId: getBundleId(bundlePayload),
            publicKeyFingerprint: signatureResult.publicKeyFingerprint || ownerSignature?.publicKeyFingerprint || '',
            messages
        };
    }

    function getOwnerVerificationRows(ownerVerification) {
        const owner = ownerVerification?.owner || {};
        return [
            [t('ov_owner_code'), getOwnerCodeFromOwner(owner) || ownerVerification?.claimedOwnerCode || 'Unknown'],
            [t('ov_site'), owner.canonicalSite || 'Unknown'],
            [t('ov_repo'), owner.canonicalRepo || 'Unknown'],
            [t('ov_task'), owner.taskId || ownerVerification?.taskId || 'Unknown'],
            [t('ov_bundle'), owner.bundleId || ownerVerification?.bundleId || 'Unknown'],
            [t('ov_sig'), ownerVerification?.signatureStatus || 'unknown'],
            [t('ov_key'), ownerVerification?.publicKeyFingerprint || 'Unknown']
        ];
    }

    function buildOwnerVerificationMarkup(ownerVerification, compact = false) {
        if (!ownerVerification) return '';

        const title = ownerVerification.ownerVerified ? t('ov_verified') : t('ov_warning');
        const rows = getOwnerVerificationRows(ownerVerification);
        const details = rows.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join('');
        const messages = ownerVerification.messages?.length
            ? `<p class="owner-verification-message">${escapeHtml(ownerVerification.messages.join(' '))}</p>`
            : '';

        return `
            <p class="owner-verification-title">${escapeHtml(title)}</p>
            <dl class="owner-verification-grid">${details}</dl>
            ${compact ? '' : messages}
        `;
    }

    function renderOwnerVerification(ownerVerification) {
        if (!ownerVerificationPanel) return;

        if (!ownerVerification) {
            ownerVerificationPanel.hidden = true;
            ownerVerificationPanel.innerHTML = '';
            delete ownerVerificationPanel.dataset.tone;
            return;
        }

        ownerVerificationPanel.innerHTML = buildOwnerVerificationMarkup(ownerVerification);
        ownerVerificationPanel.hidden = false;
        ownerVerificationPanel.dataset.tone = ownerVerification.ownerVerified ? 'success' : 'error';
    }

    function assertOwnerVerification(ownerVerification) {
        if (!ownerVerification || ownerVerification.ownerVerified) return;

        throw new Error('Archive owner signature verification failed.');
    }

    function injectOwnerVerificationBadge(doc, ownerVerification) {
        if (!ownerVerification) return;

        const accentLine = ownerVerification.ownerVerified
            ? 'rgba(201, 162, 39, 0.55)'
            : 'rgba(143, 67, 53, 0.5)';
        const titleColor = ownerVerification.ownerVerified ? '#171615' : '#6b3027';

        const style = doc.createElement('style');
        style.textContent = `
.evo-owner-badge {
    position: fixed;
    z-index: 2147483647;
    top: 50%;
    left: 18px;
    transform: translateY(-50%);
    width: min(260px, calc(100vw - 32px));
    padding: 18px 20px 20px;
    border: 1px solid rgba(34, 37, 42, 0.1);
    border-radius: 6px;
    background: #fbf8f3;
    color: #171615;
    box-shadow: 0 12px 28px rgba(67, 50, 16, 0.08);
    font: 12px/1.5 Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    text-align: left;
}
.evo-owner-badge .owner-verification-title {
    margin: 0 auto;
    font-family: "Cormorant Garamond", "Hoefler Text", "Garamond", "Times New Roman", serif;
    font-size: 16px;
    font-weight: 500;
    font-style: italic;
    letter-spacing: 0.01em;
    line-height: 1.2;
    text-align: center;
    color: ${titleColor};
}
.evo-owner-badge .owner-verification-title::after {
    content: '';
    display: block;
    width: 36px;
    height: 1px;
    margin: 8px auto 0;
    background: ${accentLine};
}
.evo-owner-badge .owner-verification-grid {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 14px;
    row-gap: 6px;
    margin: 14px 0 0;
    align-items: baseline;
}
.evo-owner-badge dt {
    margin: 0;
    color: #6d6658;
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    line-height: 1.5;
}
.evo-owner-badge dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    color: #171615;
    font-size: 11.5px;
    line-height: 1.5;
    font-feature-settings: "tnum" 1;
}
@media (max-height: 520px) {
    .evo-owner-badge {
        top: 14px;
        transform: none;
    }
}
@media print {
    .evo-owner-badge {
        position: static;
        width: auto;
        box-shadow: none;
        transform: none;
        background: #fff;
    }
}`;
        const badge = doc.createElement('aside');
        badge.className = 'evo-owner-badge';
        badge.setAttribute('aria-label', 'Archive owner verification');
        badge.innerHTML = buildOwnerVerificationMarkup(ownerVerification, true);
        doc.head.appendChild(style);
        doc.body.prepend(badge);
    }

    function buildViewerUrl(record, fileMap, ownerVerification = null) {
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
        injectOwnerVerificationBadge(doc, ownerVerification);

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
        const localFontsHref = escapeHtml(new URL('external/fonts/fonts.css', window.location.href).href);

        viewerWindow.document.open();
        viewerWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unlocking ${escapedLabel}</title>
    <link rel="stylesheet" href="${localFontsHref}">
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
        const hasPersistentStorage = canAttemptPersistentDevicePass();
        const isSupportedBundle = !bundlePayload || supportsPrivateDeviceGrant(bundlePayload);
        const isAvailable = hasPersistentStorage && isSupportedBundle;
        const hasPasskeyPrfAttempt = canAttemptPasskeyPrf();
        const rpId = getPasskeyRpId();

        devicePassInput.disabled = !isAvailable;
        if (resetChoice || !isAvailable) {
            devicePassInput.checked = false;
            if (deviceIdInput) {
                deviceIdInput.value = '';
            }
        }
        devicePassOption.classList.toggle('is-disabled', !isAvailable);
        devicePassOption.title = isAvailable
            ? 'Bind this vault to an encrypted local device ticket after the access and private tokens unlock successfully.'
            : !isSupportedBundle
                ? 'This record must be resealed with private device authorization before it can be remembered.'
                : rpId
                    ? 'Persistent device tickets require a secure context, IndexedDB, and Web Crypto.'
                    : 'Persistent Passkey tickets require a domain origin. Use localhost or the GitHub Pages HTTPS domain instead of 127.0.0.1.';

        if (devicePassDetail) {
            devicePassDetail.textContent = isAvailable
                ? hasPasskeyPrfAttempt
                    ? t('dp_avail_passkey')
                    : t('dp_avail_local')
                : !isSupportedBundle
                    ? t('dp_unavail_bundle')
                    : rpId
                        ? t('dp_unavail_storage')
                        : t('dp_unavail_domain');
        }

        updateDeviceIdConfirmation();
        updatePrivateTokenConfirmation();
        updateTokenSubmitAvailability();
    }

    function isTokenMode() {
        return tokenPanel?.getAttribute('data-mode') === 'token';
    }

    function updateDeviceIdConfirmation() {
        if (!deviceIdConfirm || !deviceIdInput || !devicePassInput) return;

        const shouldShow = isTokenMode() && !devicePassInput.disabled && devicePassInput.checked;
        deviceIdConfirm.hidden = !shouldShow;

        if (!shouldShow) {
            deviceIdInput.value = '';
        }
    }

    function updatePrivateTokenConfirmation() {
        if (!privateTokenConfirm || !privateTokenInput || !devicePassInput) return;

        const shouldShow = (
            isTokenMode() &&
            !devicePassInput.disabled &&
            devicePassInput.checked
        );

        privateTokenConfirm.hidden = !shouldShow;
        privateTokenInput.required = shouldShow;

        if (!shouldShow) {
            privateTokenInput.value = '';
        }
    }

    function updateTokenSubmitAvailability() {
        if (!tokenSubmit) return;

        tokenSubmit.disabled = state.unlocking;
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
        const passkeyTicket = getSavedPasskeyTicket(record);
        if (canUseSavedDeviceTicket(passkeyTicket)) return passkeyTicket;

        return getSavedLocalFallbackTicket(record);
    }

    function canUseSavedDeviceTicket(ticketRecord) {
        if (!ticketRecord) return false;
        if (ticketRecord.protection === 'passkey-prf') {
            return ticketRecord.version === 3 &&
                ticketRecord.rememberDeviceRequested === true &&
                ticketRecord.ownerCodeBinding === passkeyOwnerCodeBinding &&
                ticketRecord.privateTokenBinding === privateTokenBinding &&
                Boolean(ticketRecord.deviceGrantBinding) &&
                Boolean(ticketRecord.deviceGrantTicket);
        }
        return ticketRecord.protection === 'local-crypto-key' &&
            ticketRecord.version === 3 &&
            ticketRecord.rememberDeviceRequested === true &&
            ticketRecord.ownerCodeBinding === localOwnerCodeBinding &&
            ticketRecord.privateTokenBinding === privateTokenBinding &&
            Boolean(ticketRecord.deviceGrantBinding) &&
            Boolean(ticketRecord.localSecretTicket) &&
            Boolean(ticketRecord.deviceGrantTicket);
    }

    function configureSavedPasskeyOption(record = state.activeRecord, mode = 'token') {
        if (!savedPasskeyOption) return;

        const ticketRecord = getSavedPasskeyTicket(record);
        const isVisible = mode === 'token' && canUseSavedDeviceTicket(ticketRecord);

        savedPasskeyOption.hidden = !isVisible;

        if (savedPasskeyButton) {
            savedPasskeyButton.disabled = state.unlocking || !isVisible;
        }

        if (savedPasskeyDetail && isVisible) {
            savedPasskeyDetail.textContent = t('passkey_detail');
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
            version: 3,
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
            context.ownerHash || '',
            context.deviceGrantBinding || '',
            context.protection || 'passkey-prf',
            getTicketProtectorId(context)
        ].join('|'));
    }

    function getLocalSecretContext(record, bundlePayload, ticketRecord, ownerHash = '') {
        return {
            taskId: record?.id || ticketRecord.taskId,
            bundleId: getBundleId(bundlePayload),
            ownerHash,
            keyId: ticketRecord.keyId,
            deviceGrantBinding: ticketRecord.deviceGrantBinding || '',
            protection: 'local-secret-key'
        };
    }

    function getDeviceGrantTicketContext(record, bundlePayload, ticketRecord, ownerHash = '') {
        return {
            taskId: record?.id || ticketRecord.taskId,
            bundleId: getBundleId(bundlePayload),
            ownerHash,
            credentialId: ticketRecord.credentialId,
            keyId: ticketRecord.keyId,
            deviceGrantBinding: ticketRecord.deviceGrantBinding || '',
            protection: `${ticketRecord.protection || 'device'}-device-grant`
        };
    }

    function getDeviceGrantTicketPayload(record, bundlePayload, ownerHash, deviceGrant, now = Date.now(), createdAt = now) {
        if (!deviceGrant?.deviceGrantKey || !deviceGrant?.deviceGrantBinding) {
            throw new Error('Private device authorization is required.');
        }

        return {
            version: 1,
            taskId: record.id,
            bundleId: getBundleId(bundlePayload),
            ownerHash: ownerHash || '',
            deviceGrantBinding: deviceGrant.deviceGrantBinding,
            deviceGrantKey: bytesToBase64url(deviceGrant.deviceGrantKey),
            createdAt,
            updatedAt: now
        };
    }

    function readDeviceGrantTicketPayload(payload, ticketRecord, bundlePayload, ownerHash = '') {
        if (
            !payload ||
            payload.version !== 1 ||
            payload.taskId !== ticketRecord.taskId ||
            payload.bundleId !== getBundleId(bundlePayload) ||
            (payload.ownerHash || '') !== (ownerHash || '') ||
            (payload.deviceGrantBinding || '') !== (ticketRecord.deviceGrantBinding || '') ||
            !payload.deviceGrantKey
        ) {
            throw new Error('Saved device authorization does not match this owner.');
        }

        return {
            deviceGrantKey: base64urlToBytes(payload.deviceGrantKey),
            deviceGrantBinding: payload.deviceGrantBinding,
            createdAt: payload.createdAt || ticketRecord.createdAt || Date.now()
        };
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

    function combineKeyMaterial(...chunks) {
        const normalized = chunks.map(chunk => new Uint8Array(chunk || []));
        const length = normalized.reduce((total, chunk) => total + chunk.byteLength, 0);
        const combined = new Uint8Array(length);
        let offset = 0;

        for (const chunk of normalized) {
            combined.set(chunk, offset);
            offset += chunk.byteLength;
        }

        return combined;
    }

    async function deriveTicketKey(prfOutput, { taskId, bundleId, credentialId, ownerHash, deviceGrantBinding }, deviceGrantKey) {
        if (!deviceGrantKey || !deviceGrantKey.byteLength) {
            throw new Error('Private device authorization is required.');
        }

        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            combineKeyMaterial(prfOutput, deviceGrantKey),
            'HKDF',
            false,
            ['deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: textEncoder.encode([
                    window.location.origin,
                    taskId,
                    bundleId,
                    ownerHash || '',
                    deviceGrantBinding || '',
                    'passkey-prf-v3'
                ].join('|')),
                info: textEncoder.encode(`evo-vault-passkey-ticket-key-v3|${credentialId}|${ownerHash || ''}|${deviceGrantBinding || ''}`)
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

    async function derivePasskeyDeviceGrantTicketKey(prfOutput, { taskId, bundleId, credentialId, ownerHash, deviceGrantBinding }, salt) {
        if (!prfOutput || !prfOutput.byteLength) {
            throw new Error('Passkey PRF output is unavailable.');
        }

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
                salt,
                info: textEncoder.encode([
                    'evo-vault-passkey-device-grant-ticket-key-v1',
                    window.location.origin,
                    taskId,
                    bundleId,
                    ownerHash || '',
                    deviceGrantBinding || '',
                    credentialId
                ].join('|'))
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

    async function deriveLocalFallbackTicketKey(localSecret, { taskId, bundleId, keyId, ownerHash, deviceGrantBinding }, salt, deviceGrantKey) {
        if (!deviceGrantKey || !deviceGrantKey.byteLength) {
            throw new Error('Private device authorization is required.');
        }

        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            combineKeyMaterial(localSecret, deviceGrantKey),
            'HKDF',
            false,
            ['deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt,
                info: textEncoder.encode([
                    'evo-vault-local-fallback-ticket-key-v1',
                    window.location.origin,
                    taskId,
                    bundleId,
                    ownerHash || '',
                    deviceGrantBinding || '',
                    keyId
                ].join('|'))
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

    async function encryptDeviceTicketPayload(payload, context, salt, prfOutput, deviceGrantKey) {
        const key = await deriveTicketKey(prfOutput, context, deviceGrantKey);
        return encryptDeviceTicketPayloadWithKey(payload, context, salt, key);
    }

    async function encryptPasskeyDeviceGrantTicket(payload, context, salt, prfOutput) {
        const key = await derivePasskeyDeviceGrantTicketKey(prfOutput, context, salt);
        return encryptDeviceTicketPayloadWithKey(payload, context, salt, key);
    }

    function getDeviceTicketContext(ticketRecord, bundlePayload, overrides = {}) {
        return {
            taskId: ticketRecord.taskId,
            bundleId: getBundleId(bundlePayload),
            ownerHash: ticketRecord.ownerHash || '',
            credentialId: ticketRecord.credentialId,
            keyId: ticketRecord.keyId,
            deviceGrantBinding: ticketRecord.deviceGrantBinding || '',
            protection: ticketRecord.protection || 'passkey-prf',
            ...overrides
        };
    }

    async function decryptDeviceTicketPayloadWithKey(ticketRecord, bundlePayload, key, options = {}) {
        const context = options.context || getDeviceTicketContext(ticketRecord, bundlePayload);
        const ticket = parseDeviceTicket(options.ticket || ticketRecord.ticket);
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

    async function decryptPasskeyDeviceGrantTicket(record, bundlePayload, ticketRecord, ownerHash, prfOutput, salt) {
        if (!ticketRecord.deviceGrantTicket) {
            throw new Error('Saved Passkey access must be refreshed with the access and private tokens.');
        }

        const context = getDeviceGrantTicketContext(record, bundlePayload, ticketRecord, ownerHash);
        const key = await derivePasskeyDeviceGrantTicketKey(prfOutput, context, salt);
        const payload = await decryptDeviceTicketPayloadWithKey(ticketRecord, bundlePayload, key, {
            ticket: ticketRecord.deviceGrantTicket,
            context
        });

        return readDeviceGrantTicketPayload(payload, ticketRecord, bundlePayload, ownerHash);
    }

    async function decryptLocalDeviceGrantTicket(record, bundlePayload, ticketRecord, key, ownerHash) {
        if (!ticketRecord.deviceGrantTicket) {
            throw new Error('Saved local access must be refreshed with the access and private tokens.');
        }

        const context = getDeviceGrantTicketContext(record, bundlePayload, ticketRecord, ownerHash);
        const payload = await decryptDeviceTicketPayloadWithKey(ticketRecord, bundlePayload, key, {
            ticket: ticketRecord.deviceGrantTicket,
            context
        });

        return readDeviceGrantTicketPayload(payload, ticketRecord, bundlePayload, ownerHash);
    }

    async function decryptLocalFallbackSecret(record, bundlePayload, ticketRecord, key, ownerHash = '') {
        if (ticketRecord.ownerCodeBinding !== localOwnerCodeBinding || ticketRecord.privateTokenBinding !== privateTokenBinding || !ticketRecord.localSecretTicket) {
            throw new Error('Saved local access must be refreshed with the access and private tokens.');
        }

        const secretPayload = await decryptDeviceTicketPayloadWithKey(ticketRecord, bundlePayload, key, {
            ticket: ticketRecord.localSecretTicket,
            context: getLocalSecretContext(record, bundlePayload, ticketRecord, ownerHash)
        });

        if (
            !secretPayload ||
            secretPayload.version !== 2 ||
            secretPayload.taskId !== ticketRecord.taskId ||
            secretPayload.bundleId !== getBundleId(bundlePayload) ||
            (secretPayload.ownerHash || '') !== (ownerHash || '') ||
            (secretPayload.deviceGrantBinding || '') !== (ticketRecord.deviceGrantBinding || '') ||
            !secretPayload.localSecret
        ) {
            throw new Error('Saved local access does not match this owner.');
        }

        return base64urlToBytes(secretPayload.localSecret);
    }

    async function decryptDeviceTicketPayload(ticketRecord, bundlePayload, prfOutput, ownerHash = ticketRecord.ownerHash || '', deviceGrantKey, deviceGrantBinding = ticketRecord.deviceGrantBinding || '') {
        const context = {
            taskId: ticketRecord.taskId,
            bundleId: getBundleId(bundlePayload),
            ownerHash,
            credentialId: ticketRecord.credentialId,
            deviceGrantBinding,
            protection: ticketRecord.protection || 'passkey-prf'
        };
        const key = await deriveTicketKey(prfOutput, context, deviceGrantKey);

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

    async function createDeviceTicket(record, bundlePayload, vaultKey, ownerHash = '', deviceGrant) {
        if (!canAttemptPersistentDevicePass() || !vaultKey || !bundlePayload || !supportsPrivateDeviceGrant(bundlePayload)) {
            throw new Error('Persistent device tickets are unavailable in this browser.');
        }

        if (!ownerHash || !deviceGrant?.deviceGrantKey || !deviceGrant?.deviceGrantBinding) {
            throw new Error('Persistent device tickets require owner and private token verification.');
        }

        if (canAttemptPasskeyPrf()) {
            if (await isPasskeyPrfExplicitlyUnavailable()) {
                const fallbackResult = await createLocalCryptoDeviceTicket(record, bundlePayload, vaultKey, ownerHash, deviceGrant);
                return {
                    ...fallbackResult,
                    prfAttempted: false,
                    prfSucceeded: false,
                    prfUnavailableReason: 'Passkey PRF is explicitly unavailable in this browser.'
                };
            }

            try {
                return await createPasskeyDeviceTicket(record, bundlePayload, vaultKey, ownerHash, deviceGrant);
            } catch (error) {
                const prfFailureReason = getErrorMessage(error);
                console.warn('Passkey PRF ticket failed; falling back to local CryptoKey ticket:', error);
                const fallbackResult = await createLocalCryptoDeviceTicket(record, bundlePayload, vaultKey, ownerHash, deviceGrant);

                return {
                    ...fallbackResult,
                    prfAttempted: true,
                    prfSucceeded: false,
                    prfFailureReason
                };
            }
        }

        const fallbackResult = await createLocalCryptoDeviceTicket(record, bundlePayload, vaultKey, ownerHash, deviceGrant);

        return {
            ...fallbackResult,
            prfAttempted: false,
            prfSucceeded: false,
            prfUnavailableReason: getPasskeyPrfUnavailableReason()
        };
    }

    async function createPasskeyDeviceTicket(record, bundlePayload, vaultKey, ownerHash = '', deviceGrant) {
        const salt = getRandomBytes(32);
        const { credentialId, prfOutput, reusedCredential } = await getOrCreatePasskeyPrfForTicket(salt);
        const now = Date.now();
        const bundleId = getBundleId(bundlePayload);
        const deviceGrantBinding = deviceGrant.deviceGrantBinding;
        const context = {
            taskId: record.id,
            bundleId,
            ownerHash,
            credentialId,
            deviceGrantBinding,
            protection: 'passkey-prf'
        };
        const deviceGrantTicketRecord = {
            taskId: record.id,
            protection: 'passkey-prf',
            ownerHash,
            credentialId,
            deviceGrantBinding
        };
        const deviceGrantTicketContext = getDeviceGrantTicketContext(record, bundlePayload, deviceGrantTicketRecord, ownerHash);
        const deviceGrantTicket = await encryptPasskeyDeviceGrantTicket(
            getDeviceGrantTicketPayload(record, bundlePayload, ownerHash, deviceGrant, now),
            deviceGrantTicketContext,
            salt,
            prfOutput
        );
        const payload = {
            version: 2,
            taskId: record.id,
            bundleId,
            ownerHash,
            deviceGrantBinding,
            vaultKey: bytesToBase64url(vaultKey),
            authorization: 'permanent',
            createdAt: now,
            lastUsedAt: now,
            counter: 0
        };
        const ticket = await encryptDeviceTicketPayload(payload, context, salt, prfOutput, deviceGrant.deviceGrantKey);

        await saveDeviceTicket({
            version: 3,
            protection: 'passkey-prf',
            ownerCodeBinding: passkeyOwnerCodeBinding,
            privateTokenBinding,
            authorization: 'permanent',
            rememberDeviceRequested: true,
            credentialScope: 'origin',
            taskId: record.id,
            bundleId,
            ownerHash,
            deviceGrantBinding,
            credentialId,
            deviceGrantTicket,
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

    async function createLocalCryptoDeviceTicket(record, bundlePayload, vaultKey, ownerHash = '', deviceGrant) {
        const now = Date.now();
        const bundleId = getBundleId(bundlePayload);
        const keyId = `local:${record.id}:${bundleId}`;
        const key = await createLocalDeviceKey(keyId);
        const localSecret = getRandomBytes(32);
        const localSecretSalt = getRandomBytes(16);
        const ticketSalt = getRandomBytes(32);
        const deviceGrantBinding = deviceGrant.deviceGrantBinding;
        const context = {
            taskId: record.id,
            bundleId,
            ownerHash,
            keyId,
            deviceGrantBinding,
            protection: 'local-crypto-key'
        };
        const deviceGrantTicketRecord = {
            taskId: record.id,
            protection: 'local-crypto-key',
            ownerHash,
            keyId,
            deviceGrantBinding
        };
        const localSecretTicket = await encryptDeviceTicketPayloadWithKey(
            {
                version: 2,
                taskId: record.id,
                bundleId,
                ownerHash,
                deviceGrantBinding,
                localSecret: bytesToBase64url(localSecret),
                createdAt: now
            },
            getLocalSecretContext(record, bundlePayload, { taskId: record.id, keyId, deviceGrantBinding }, ownerHash),
            localSecretSalt,
            key
        );
        const deviceGrantTicket = await encryptDeviceTicketPayloadWithKey(
            getDeviceGrantTicketPayload(record, bundlePayload, ownerHash, deviceGrant, now),
            getDeviceGrantTicketContext(record, bundlePayload, deviceGrantTicketRecord, ownerHash),
            getRandomBytes(32),
            key
        );
        const ticketKey = await deriveLocalFallbackTicketKey(localSecret, context, ticketSalt, deviceGrant.deviceGrantKey);
        const payload = {
            version: 2,
            taskId: record.id,
            bundleId,
            ownerHash,
            deviceGrantBinding,
            vaultKey: bytesToBase64url(vaultKey),
            usesRemaining: devicePassMaxUses,
            maxUses: devicePassMaxUses,
            createdAt: now,
            lastUsedAt: now,
            expiresAt: now + devicePassTtlMs,
            counter: 0
        };
        const ticket = await encryptDeviceTicketPayloadWithKey(payload, context, ticketSalt, ticketKey);

        await saveDeviceTicket({
            version: 3,
            protection: 'local-crypto-key',
            ownerCodeBinding: localOwnerCodeBinding,
            privateTokenBinding,
            rememberDeviceRequested: true,
            taskId: record.id,
            bundleId,
            ownerHash,
            deviceGrantBinding,
            keyId,
            localSecretTicket,
            deviceGrantTicket,
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

    function validateDeviceTicketPayload(payload, ticketRecord, bundlePayload, ownerHash = '', deviceGrantBinding = '') {
        const now = Date.now();

        if (!payload || payload.version !== 2 || payload.taskId !== ticketRecord.taskId || payload.bundleId !== getBundleId(bundlePayload)) {
            throw new Error('Device ticket does not match this archive.');
        }

        if ((payload.ownerHash || '') !== (ownerHash || '') || (ticketRecord.ownerHash || '') !== (ownerHash || '')) {
            throw new Error('Device ticket does not match this owner.');
        }

        if (
            ticketRecord.privateTokenBinding !== privateTokenBinding ||
            !deviceGrantBinding ||
            (payload.deviceGrantBinding || '') !== deviceGrantBinding ||
            (ticketRecord.deviceGrantBinding || '') !== deviceGrantBinding
        ) {
            throw new Error('Device ticket requires the matching saved device authorization.');
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

    async function unlockWithDeviceTicket(record, bundlePayload, ticketRecord, ownerHash = '') {
        if (!ticketRecord || ticketRecord.bundleId !== getBundleId(bundlePayload) || !supportsPrivateDeviceGrant(bundlePayload)) {
            throw new Error('Device ticket is stale.');
        }

        if (ticketRecord.privateTokenBinding !== privateTokenBinding) {
            throw new Error('Saved device access must be refreshed with the access and private tokens.');
        }

        if (!ticketRecord.deviceGrantTicket || !ticketRecord.deviceGrantBinding) {
            throw new Error('Saved device access must be refreshed with the access and private tokens.');
        }

        if (ticketRecord.protection === 'passkey-prf' && ticketRecord.ownerCodeBinding !== passkeyOwnerCodeBinding) {
            throw new Error('Saved Passkey access must be refreshed with the access and private tokens.');
        }

        if (ticketRecord.protection !== 'local-crypto-key' && (ticketRecord.ownerHash || '') !== (ownerHash || '')) {
            throw new Error('Saved device access belongs to a different owner.');
        }

        if (ticketRecord.protection === 'local-crypto-key') {
            return unlockWithLocalCryptoTicket(record, bundlePayload, ticketRecord, ownerHash);
        }

        const currentTicket = parseDeviceTicket(ticketRecord.ticket);
        const nextSalt = getRandomBytes(32);
        const prfResults = await getPasskeyPrfOutputs(ticketRecord.credentialId, currentTicket.salt, nextSalt);

        return unlockWithPasskeyPrfResults(record, bundlePayload, ticketRecord, ownerHash, prfResults, nextSalt);
    }

    async function unlockWithPasskeyPrfResults(record, bundlePayload, ticketRecord, ownerHash, prfResults, nextSalt) {
        if (!prfResults?.first) {
            throw new Error('This Passkey does not expose PRF output.');
        }

        if (ticketRecord.ownerCodeBinding !== passkeyOwnerCodeBinding || ticketRecord.privateTokenBinding !== privateTokenBinding) {
            throw new Error('Saved Passkey access must be refreshed with the access and private tokens.');
        }

        const currentTicket = parseDeviceTicket(ticketRecord.ticket);
        let deviceGrant;
        let deviceGrantBinding = '';
        let payload;
        try {
            deviceGrant = await decryptPasskeyDeviceGrantTicket(record, bundlePayload, ticketRecord, ownerHash, prfResults.first, currentTicket.salt);
            deviceGrantBinding = deviceGrant.deviceGrantBinding || '';
            payload = await decryptDeviceTicketPayload(ticketRecord, bundlePayload, prfResults.first, ownerHash, deviceGrant.deviceGrantKey, deviceGrantBinding);
            validateDeviceTicketPayload(payload, ticketRecord, bundlePayload, ownerHash, deviceGrantBinding);
        } catch (error) {
            throw createDeviceTicketMismatchError('Saved Passkey ticket no longer matches this archive.', error);
        }

        const now = Date.now();
        const vaultKey = base64urlToBytes(payload.vaultKey);
        const nextTicketSalt = prfResults.second && nextSalt ? nextSalt : currentTicket.salt;
        const nextPrfOutput = prfResults.second || prfResults.first;
        const nextDeviceGrantContext = getDeviceGrantTicketContext(record, bundlePayload, ticketRecord, ownerHash);
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
                    ownerHash,
                    credentialId: ticketRecord.credentialId,
                    deviceGrantBinding,
                    protection: 'passkey-prf'
                },
                nextTicketSalt,
                nextPrfOutput,
                deviceGrant.deviceGrantKey
            ),
            deviceGrantTicket: await encryptPasskeyDeviceGrantTicket(
                getDeviceGrantTicketPayload(record, bundlePayload, ownerHash, deviceGrant, now, deviceGrant.createdAt),
                nextDeviceGrantContext,
                nextTicketSalt,
                nextPrfOutput
            ),
            updatedAt: now
        };

        await saveDeviceTicket(nextRecord);

        return vaultKey;
    }

    async function unlockWithLocalCryptoTicket(record, bundlePayload, ticketRecord, ownerHash = '') {
        const key = await getLocalDeviceKey(ticketRecord.keyId);
        if (!key) {
            throw new Error('Local device key is missing.');
        }

        const currentTicket = parseDeviceTicket(ticketRecord.ticket);
        const deviceGrant = await decryptLocalDeviceGrantTicket(record, bundlePayload, ticketRecord, key, ownerHash);
        const localSecret = await decryptLocalFallbackSecret(record, bundlePayload, ticketRecord, key, ownerHash);
        const deviceGrantBinding = deviceGrant.deviceGrantBinding || '';
        const ticketKey = await deriveLocalFallbackTicketKey(
            localSecret,
            {
                taskId: record.id,
                bundleId: getBundleId(bundlePayload),
                ownerHash,
                deviceGrantBinding,
                keyId: ticketRecord.keyId
            },
            currentTicket.salt,
            deviceGrant.deviceGrantKey
        );
        const payload = await decryptDeviceTicketPayloadWithKey(ticketRecord, bundlePayload, ticketKey, {
            context: getDeviceTicketContext(ticketRecord, bundlePayload, { ownerHash, deviceGrantBinding })
        });

        validateDeviceTicketPayload(payload, ticketRecord, bundlePayload, ownerHash, deviceGrantBinding);

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
            const nextSalt = getRandomBytes(32);
            const nextTicketKey = await deriveLocalFallbackTicketKey(
                localSecret,
                {
                    taskId: record.id,
                    bundleId: getBundleId(bundlePayload),
                    ownerHash,
                    deviceGrantBinding,
                    keyId: ticketRecord.keyId
                },
                nextSalt,
                deviceGrant.deviceGrantKey
            );
            const nextRecord = {
                ...ticketRecord,
                ticket: await encryptDeviceTicketPayloadWithKey(
                    nextPayload,
                    {
                        taskId: record.id,
                        bundleId: getBundleId(bundlePayload),
                        ownerHash,
                        keyId: ticketRecord.keyId,
                        deviceGrantBinding,
                        protection: 'local-crypto-key'
                    },
                    nextSalt,
                    nextTicketKey
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

    function getPrivateTokenValue() {
        return privateTokenInput ? privateTokenInput.value.trim() : '';
    }

    function requirePrivateTokenValue(message = 'Enter the private token for device access.') {
        const privateToken = getPrivateTokenValue();
        if (!privateToken) {
            throw createPrivateTokenError(message);
        }

        return privateToken;
    }

    function setUnlockBusy(isBusy) {
        state.unlocking = isBusy;

        if (tokenInput) tokenInput.disabled = isBusy;
        if (tokenSubmit) tokenSubmit.disabled = isBusy;
        if (tokenCancel) tokenCancel.disabled = isBusy;
        if (tokenClose) tokenClose.disabled = isBusy;
        if (savedPasskeyButton) savedPasskeyButton.disabled = isBusy;
        if (devicePassInput) {
            const activeBundlePayload = state.pendingUnlock?.bundlePayload || state.pendingPasskeyAccess?.bundlePayload || state.activeBundlePayload;
            const canUseDevicePass = canAttemptPersistentDevicePass() && (!activeBundlePayload || supportsPrivateDeviceGrant(activeBundlePayload));
            devicePassInput.disabled = isBusy || !canUseDevicePass;
        }
        if (privateTokenInput) privateTokenInput.disabled = isBusy;
        updateTokenSubmitAvailability();
    }

    function setTokenPromptMode(mode, record = state.activeRecord) {
        const isSaveDeviceMode = mode === 'saveDevice';
        const isOpenRecordMode = mode === 'openRecord';
        const isFallbackOwnerCodeMode = mode === 'fallbackOwnerCode';
        const isPasskeyOwnerCodeMode = mode === 'passkeyOwnerCode';
        const isOwnerCodeMode = isFallbackOwnerCodeMode || isPasskeyOwnerCodeMode;
        const isPostTokenMode = isSaveDeviceMode || isOpenRecordMode;

        tokenPanel?.setAttribute('data-mode', mode);
        configureSavedPasskeyOption(record, mode);

        if (tokenField) tokenField.hidden = isPostTokenMode;
        if (tokenLabel) tokenLabel.hidden = isPostTokenMode;
        if (tokenLabel && !isPostTokenMode) {
            tokenLabel.textContent = isOwnerCodeMode ? t('tok_label_owner') : t('tok_label_token');
        }
        if (devicePassOption) devicePassOption.hidden = isPostTokenMode || isOwnerCodeMode;
        if (deviceIdConfirm) deviceIdConfirm.hidden = true;

        if (tokenInput) {
            tokenInput.required = !isPostTokenMode;
            if (isPostTokenMode) {
                tokenInput.blur();
            } else if (isOwnerCodeMode) {
                tokenInput.type = 'text';
                tokenInput.inputMode = 'numeric';
                tokenInput.autocomplete = 'off';
                tokenInput.placeholder = t('tok_ph_owner');
            } else {
                tokenInput.type = 'password';
                tokenInput.inputMode = 'text';
                tokenInput.autocomplete = 'one-time-code';
                tokenInput.placeholder = t('tok_ph_token');
            }
        }

        if (tokenTitle) {
            tokenTitle.textContent = isOpenRecordMode
                ? t('tok_title_open')
                : isSaveDeviceMode
                    ? t('tok_title_save')
                    : isOwnerCodeMode ? t('tok_title_owner') : t('tok_title_token');
        }

        if (tokenDescription) {
            tokenDescription.textContent = isOpenRecordMode
                ? t('tok_desc_open')
                : isSaveDeviceMode
                    ? t('tok_desc_save')
                : isPasskeyOwnerCodeMode
                    ? t('tok_desc_passkey')
                : isFallbackOwnerCodeMode
                    ? t('tok_desc_fallback')
                : record
                    ? tFmt('tok_desc_record', record.label)
                    : t('tok_desc_default');
        }

        if (tokenSubmit) {
            tokenSubmit.textContent = isOpenRecordMode
                ? t('tok_submit_open')
                : isSaveDeviceMode ? t('tok_submit_save') : isOwnerCodeMode ? t('tok_submit_owner') : t('tok_submit_token');
        }

        if (tokenCancel) {
            tokenCancel.textContent = isOpenRecordMode
                ? t('tok_cancel_open')
                : isSaveDeviceMode ? t('tok_cancel_save') : t('tok_cancel_token');
        }

        if (tokenNote) {
            tokenNote.textContent = isOpenRecordMode
                ? t('tok_note_open')
                : isSaveDeviceMode
                    ? t('tok_note_save')
                : isPasskeyOwnerCodeMode
                    ? t('tok_note_passkey')
                : isFallbackOwnerCodeMode
                    ? t('tok_note_fallback')
                : t('tok_note_token');
        }

        const ownerVerification = state.pendingUnlock?.ownerVerification || state.pendingSavedAccess?.ownerVerification || null;
        renderOwnerVerification(isOpenRecordMode ? ownerVerification : null);
        updateDeviceIdConfirmation();
        updatePrivateTokenConfirmation();
        updateTokenSubmitAvailability();
    }

    function showDeviceSavePrompt(pendingUnlock) {
        state.pendingUnlock = {
            ...pendingUnlock,
            rememberDeviceRequested: true
        };
        setTokenPromptMode('saveDevice', pendingUnlock.record);
        setTokenStatus(t('msg_tok_save'), 'success');

        window.setTimeout(() => {
            tokenSubmit?.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 120);
    }

    function showOpenRecordPrompt(pendingUnlock, message) {
        if (message === undefined) message = t('msg_tok_ok');
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
            setTokenStatus(t('msg_popup'), 'error');
            return;
        }

        state.pendingUnlock = null;

        if ((rememberInSession || pendingUnlock.rememberInSession) && pendingUnlock.vaultKey) {
            setSessionVaultKey(pendingUnlock.record, pendingUnlock.bundlePayload, pendingUnlock.vaultKey, pendingUnlock.ownerHash || '');
        }

        viewerWindow.location.replace(pendingUnlock.viewerUrl);
        setTokenStatus(t('msg_unsealed'), 'success');
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
                ? t('msg_passkey_saved')
                : t('msg_local_saved'),
            'success'
        );
        pendingUnlock.readyToOpen = true;
        setTokenPromptMode('openRecord', pendingUnlock.record);
        setTokenStatus(t('msg_dev_saved'), 'success');
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
        if (!pendingUnlock.ownerVerification?.ownerVerified) {
            setTokenStatus(t('msg_no_verify'), 'error');
            showOpenRecordPrompt(pendingUnlock, t('msg_open_no_save'));
            return;
        }

        setUnlockBusy(true);
        setTokenStatus(
            canAttemptPasskeyPrf()
                ? t('msg_win_sec')
                : t('msg_saving_local'),
            'success'
        );

        try {
            const ticketResult = await createDeviceTicket(
                pendingUnlock.record,
                pendingUnlock.bundlePayload,
                pendingUnlock.vaultKey,
                pendingUnlock.ownerHash || '',
                pendingUnlock.deviceGrant
            );

            finishDeviceTicketSave(pendingUnlock, ticketResult);
        } catch (error) {
            console.warn('Device ticket creation failed:', error);
            const reason = getErrorMessage(error);
            setTokenStatus(tFmt('msg_dev_fail', reason), 'error');
        } finally {
            setUnlockBusy(false);
        }
    }

    function completePendingSavedAccess() {
        const pendingSavedAccess = state.pendingSavedAccess;
        if (!pendingSavedAccess || !pendingSavedAccess.viewerUrl) return;

        const viewerWindow = openViewerWindow();
        if (!viewerWindow) {
            setTokenStatus(t('msg_popup'), 'error');
            return;
        }

        writeViewerPlaceholder(viewerWindow, pendingSavedAccess.record.label);
        viewerWindow.location.replace(pendingSavedAccess.viewerUrl);

        state.pendingSavedAccess = null;
        setTokenStatus(t('msg_unsealed'), 'success');
        closeTokenPrompt({ restorePanelFocus: false });
        closeProjects({ restorePageFocus: false });
    }

    async function useSavedPasskeyAccess(event) {
        event.preventDefault();

        const record = state.activeRecord;
        const savedPasskeyTicket = getSavedPasskeyTicket(record);
        if (!record || !canUseSavedDeviceTicket(savedPasskeyTicket)) return;

        setUnlockBusy(true);
        setTokenStatus(t('msg_win_sec'), 'success');

        try {
            const bundlePayload = await fetchBundlePayload(record);
            state.activeBundlePayload = bundlePayload;
            const ticketRecord = getSavedPasskeyTicket(record);

            if (!ticketRecord || ticketRecord.bundleId !== getBundleId(bundlePayload)) {
                await deleteDeviceTicket(record.id, 'passkey-prf');
                throw new Error('Saved Passkey access is no longer available.');
            }

            if (!canUseSavedDeviceTicket(ticketRecord)) {
                throw new Error('Saved Passkey access must be refreshed with the token.');
            }

            const currentTicket = parseDeviceTicket(ticketRecord.ticket);
            const nextSalt = getRandomBytes(32);
            const prfResults = await getPasskeyPrfOutputs(ticketRecord.credentialId, currentTicket.salt, nextSalt);

            state.pendingPasskeyAccess = {
                record,
                bundlePayload,
                ticketRecord,
                prfResults,
                nextSalt
            };

            if (tokenInput) {
                tokenInput.value = '';
            }
            if (privateTokenInput) {
                privateTokenInput.value = '';
            }
            setTokenPromptMode('passkeyOwnerCode', record);
            setTokenStatus(t('msg_passkey_ok'), 'success');
            window.setTimeout(() => {
                tokenInput?.focus({ preventScroll: true });
            }, reduceMotion ? 0 : 120);
        } catch (error) {
            console.warn('Saved Passkey access failed:', error);
            const reason = getErrorMessage(error);

            setTokenStatus(tFmt('msg_pk_fail', reason), 'error');
            configureSavedPasskeyOption(record, 'token');
        } finally {
            setUnlockBusy(false);
        }
    }

    async function unlockPendingPasskeyAccess(event) {
        event.preventDefault();

        const pendingPasskey = state.pendingPasskeyAccess;
        if (!pendingPasskey || !tokenInput) return;

        const ownerCode = tokenInput.value.replace(/\D/g, '');
        if (!ownerCode) {
            setTokenStatus(t('msg_type_own_pk'), 'error');
            tokenInput.focus({ preventScroll: true });
            return;
        }

        const ownerCodeCheck = await verifyTypedOwnerCode(pendingPasskey.bundlePayload, ownerCode);
        if (!ownerCodeCheck.ok) {
            showOwnerCodeRiskWarning(ownerCodeCheck);
            tokenInput.focus({ preventScroll: true });
            tokenInput.select();
            return;
        }

        const { record, bundlePayload, ticketRecord, prfResults, nextSalt } = pendingPasskey;
        setUnlockBusy(true);
        setTokenStatus(t('msg_dec_passkey'), 'success');

        try {
            if (!ticketRecord || ticketRecord.bundleId !== getBundleId(bundlePayload)) {
                await deleteDeviceTicket(record.id, 'passkey-prf');
                throw new Error('Saved Passkey access is no longer available.');
            }

            const ownerHash = ownerCodeCheck.ownerHash || await getClaimedOwnerHash(bundlePayload, ownerCodeCheck.typedCode);
            if ((ticketRecord.ownerHash || '') !== (ownerHash || '')) {
                showOwnerCodeRiskWarning(ownerCodeCheck);
                throw new Error('Saved Passkey access belongs to a different owner.');
            }

            let vaultKey;
            try {
                vaultKey = await unlockWithPasskeyPrfResults(record, bundlePayload, ticketRecord, ownerHash || '', prfResults, nextSalt);
            } catch (error) {
                if (error?.deviceTicketMismatch) {
                    await deleteDeviceTicket(record.id, 'passkey-prf');
                }

                throw error;
            }

            let unlockResult;
            try {
                unlockResult = await decryptBundleWithVaultKey(bundlePayload, vaultKey, ownerHash);
            } catch (error) {
                await deleteDeviceTicket(record.id, 'passkey-prf');
                throw createDeviceTicketMismatchError('Saved Passkey ticket no longer opens this archive.', error);
            }
            const fileMap = unpackArchive(unlockResult.archiveBytes);
            const ownerVerification = await verifyBundleOwner(record, bundlePayload, fileMap, ownerHash);
            assertOwnerVerification(ownerVerification);

            state.pendingPasskeyAccess = null;
            state.pendingSavedAccess = {
                record,
                bundlePayload,
                ownerHash,
                ownerVerification,
                viewerUrl: buildViewerUrl(record, fileMap, ownerVerification),
                readyToOpen: true
            };

            setTokenPromptMode('openRecord', record);
            setTokenStatus(t('msg_passkey_ver'), 'success');
            window.setTimeout(() => {
                tokenSubmit?.focus({ preventScroll: true });
            }, reduceMotion ? 0 : 120);
        } catch (error) {
            console.warn('Saved Passkey owner code unlock failed:', error);
            setTokenStatus(
                error instanceof Error
                    ? tFmt('msg_recheck', error.message)
                    : t('msg_pk_err'),
                'error'
            );
            tokenInput.focus({ preventScroll: true });
            tokenInput.select();
        } finally {
            setUnlockBusy(false);
        }
    }

    async function unlockPendingLocalFallbackAccess(event) {
        event.preventDefault();

        const pendingFallback = state.pendingFallbackAccess;
        if (!pendingFallback || !tokenInput) return;

        const ownerCode = tokenInput.value.replace(/\D/g, '');
        if (!ownerCode) {
            setTokenStatus(t('msg_type_own_lc'), 'error');
            tokenInput.focus({ preventScroll: true });
            return;
        }

        const { record } = pendingFallback;
        let bundlePayload;

        try {
            bundlePayload = await fetchBundlePayload(record);
            state.activeBundlePayload = bundlePayload;
        } catch (error) {
            setTokenStatus(error instanceof Error ? error.message : 'Archive bundle is unavailable.', 'error');
            tokenInput.focus({ preventScroll: true });
            tokenInput.select();
            return;
        }

        const ownerCodeCheck = await verifyTypedOwnerCode(bundlePayload, ownerCode);
        if (!ownerCodeCheck.ok) {
            showOwnerCodeRiskWarning(ownerCodeCheck);
            tokenInput.focus({ preventScroll: true });
            tokenInput.select();
            return;
        }

        const viewerWindow = openViewerWindow();
        if (!viewerWindow) {
            setTokenStatus(t('msg_popup'), 'error');
            return;
        }

        writeViewerPlaceholder(viewerWindow, record.label);
        setUnlockBusy(true);
        setTokenStatus(t('msg_dec_local'), 'success');

        try {
            const ticketRecord = getSavedLocalFallbackTicket(record);
            if (!ticketRecord || ticketRecord.bundleId !== getBundleId(bundlePayload)) {
                if (ticketRecord) {
                    await deleteDeviceTicket(record.id, 'local-crypto-key');
                }
                throw new Error('Saved local access is no longer available.');
            }

            const ownerHash = ownerCodeCheck.ownerHash || await getClaimedOwnerHash(bundlePayload, ownerCodeCheck.typedCode);
            const vaultKey = await unlockWithDeviceTicket(record, bundlePayload, ticketRecord, ownerHash || '');
            await openViewerFromVaultKey(record, bundlePayload, vaultKey, viewerWindow, { ownerHash });
        } catch (error) {
            viewerWindow.close();
            console.warn('Saved local access failed:', error);
            setTokenStatus(
                error instanceof Error
                    ? tFmt('msg_recheck', error.message)
                    : t('msg_lc_err'),
                'error'
            );
            tokenInput.focus({ preventScroll: true });
            tokenInput.select();
        } finally {
            setUnlockBusy(false);
        }
    }

    function handleTokenCancel() {
        if (state.pendingPasskeyAccess && !state.unlocking) {
            closeTokenPrompt();
            return;
        }

        if (state.pendingFallbackAccess && !state.unlocking) {
            closeTokenPrompt();
            return;
        }

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
        if (state.pendingPasskeyAccess && !state.unlocking) {
            closeTokenPrompt();
            return;
        }

        if (state.pendingFallbackAccess && !state.unlocking) {
            closeTokenPrompt();
            return;
        }

        if (state.pendingSavedAccess && !state.unlocking) {
            closeTokenPrompt();
            return;
        }

        handleTokenCancel();
    }

    function handleTokenFormSubmit(event) {
        if (state.pendingPasskeyAccess) {
            unlockPendingPasskeyAccess(event);
            return;
        }

        if (state.pendingFallbackAccess) {
            unlockPendingLocalFallbackAccess(event);
            return;
        }

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

    function isOwnerCodePromptMode() {
        return ['fallbackOwnerCode', 'passkeyOwnerCode'].includes(tokenPanel?.getAttribute('data-mode'));
    }

    function handleTokenInput() {
        if (!tokenInput || !isOwnerCodePromptMode()) return;

        tokenInput.value = tokenInput.value.replace(/\D/g, '');
    }

    function blockFallbackOwnerCodeTransfer(event) {
        if (!isOwnerCodePromptMode()) return;

        event.preventDefault();
        setTokenStatus(t('msg_keyboard'), 'error');
    }

    function handleDevicePassToggle() {
        updateDeviceIdConfirmation();
        updatePrivateTokenConfirmation();
        updateTokenSubmitAvailability();
        if (devicePassInput?.checked) {
            window.setTimeout(() => tokenInput?.focus({ preventScroll: true }), 0);
        }
    }

    function handleDeviceIdInput() {
        if (!deviceIdInput) return;

        deviceIdInput.value = deviceIdInput.value.replace(/\D/g, '');
        updateTokenSubmitAvailability();
    }

    function blockDeviceIdTransfer(event) {
        event.preventDefault();
        setTokenStatus(t('msg_keyboard'), 'error');
    }

    function restoreFocus() {
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus({ preventScroll: true });
        }
    }

    function getActiveDialogRoot() {
        if (ownerRiskDialog && !ownerRiskDialog.hidden) {
            return ownerRiskDialog;
        }

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

        closeOwnerCodeRiskDialog({ restoreFocus: false });
        window.clearTimeout(state.tokenTimer);
        tokenOverlay.classList.remove('is-open');
        tokenOverlay.setAttribute('aria-hidden', 'true');

        const finishClose = () => {
            tokenOverlay.hidden = true;
            state.pendingUnlock = null;
            state.pendingSavedAccess = null;
            state.pendingPasskeyAccess = null;
            state.pendingFallbackAccess = null;
            state.activeBundlePayload = null;
            setTokenPromptMode('token', state.activeRecord);
            state.activeRecord = null;
            setTokenStatus('');
            if (tokenForm) tokenForm.reset();
            if (privateTokenInput) privateTokenInput.value = '';
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
        state.pendingPasskeyAccess = null;
        state.pendingFallbackAccess = null;
        state.activeBundlePayload = null;
        state.activeRecord = record;
        if (tokenMeta) {
            tokenMeta.textContent = `${record.label} · ${record.id.toUpperCase()}`;
        }
        setTokenStatus('');
        if (tokenForm) tokenForm.reset();
        if (deviceIdInput) deviceIdInput.value = '';
        if (privateTokenInput) privateTokenInput.value = '';
        renderOwnerVerification(null);
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

    function openFallbackOwnerCodePrompt(recordId) {
        if (!tokenOverlay || !tokenPanel || !tokenTitle || !tokenInput) return;

        const record = state.projects.find(project => project.id === recordId);
        if (!record) return;

        state.pendingUnlock = null;
        state.pendingSavedAccess = null;
        state.pendingPasskeyAccess = null;
        state.pendingFallbackAccess = { record };
        state.activeBundlePayload = null;
        state.activeRecord = record;
        if (tokenMeta) {
            tokenMeta.textContent = `${record.label} · ${record.id.toUpperCase()}`;
        }
        setTokenStatus('');
        if (tokenForm) tokenForm.reset();
        if (tokenInput) tokenInput.value = '';
        if (deviceIdInput) deviceIdInput.value = '';
        if (privateTokenInput) privateTokenInput.value = '';
        renderOwnerVerification(null);
        setTokenPromptMode('fallbackOwnerCode', record);
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

    function getProjectPublishedTime(project) {
        const publishedAt = project?.publishedAt || project?.updatedAt || project?.createdAt || '';
        const timestamp = Date.parse(publishedAt);

        return Number.isFinite(timestamp) ? timestamp : null;
    }

    function getSortedProjects() {
        return state.projects
            .map((project, index) => ({
                project,
                index,
                publishedTime: getProjectPublishedTime(project)
            }))
            .sort((a, b) => {
                const aTime = a.publishedTime;
                const bTime = b.publishedTime;

                if (aTime !== null || bTime !== null) {
                    const timeDelta = (bTime ?? -Infinity) - (aTime ?? -Infinity);
                    if (timeDelta !== 0) return timeDelta;
                }

                return b.index - a.index;
            })
            .map(item => item.project);
    }

    function renderProjectMoreButton(hasOverflow) {
        if (!projectMore) return;

        projectMore.hidden = !hasOverflow;
        projectMore.textContent = state.projectsExpanded ? t('pl_show_less') : t('pl_show_more');
        projectMore.setAttribute('aria-expanded', state.projectsExpanded ? 'true' : 'false');
        projectMore.setAttribute('aria-controls', 'project-list');
    }

    function renderProjects() {
        if (!projectList) return;

        projectList.innerHTML = '';
        projectList.classList.remove('is-expanded');
        renderProjectMoreButton(false);

        const chevronSvg = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 3.5 10 8l-4.5 4.5"/></svg>';

        const stateKeyByAccess = {
            Sealed: 'sealed',
            Open: 'open',
            'Device pass': 'device-pass',
            Loading: 'loading',
            Offline: 'offline',
            Empty: 'empty'
        };

        const statusLabelByAccess = {
            Sealed: t('st_sealed'),
            Open: t('st_open'),
            'Device pass': t('st_device_pass'),
            Loading: t('st_loading'),
            Offline: t('st_offline'),
            Empty: t('st_empty')
        };

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
            const row = document.createElement('button');
            row.type = 'button';
            row.className = `project-row project-action${disabled ? ' is-disabled' : ''}`;
            row.style.setProperty('--stagger', index);
            row.disabled = disabled;
            if (taskId) {
                row.dataset.taskId = taskId;
            }
            row.setAttribute('aria-label', `${actionLabel} ${label}`);

            const indexNode = document.createElement('span');
            indexNode.className = 'project-row-index';
            indexNode.setAttribute('aria-hidden', 'true');
            const derivedIndex = idText
                || (taskId ? taskId.replace(/^task[-_]?/i, '').replace(/^0*(\d)/, '$1').padStart(2, '0') : String(index + 1).padStart(2, '0'));
            indexNode.textContent = derivedIndex;

            const record = document.createElement('span');
            record.className = 'project-record';

            const recordLabel = document.createElement('span');
            recordLabel.className = 'project-record-label';
            recordLabel.textContent = label;

            const recordMeta = document.createElement('span');
            recordMeta.className = 'project-record-meta';
            recordMeta.textContent = meta;

            record.append(recordLabel, recordMeta);

            const status = document.createElement('span');
            const stateKey = stateKeyByAccess[access] || (accessClass.includes('unavailable') ? 'offline' : '');
            status.className = 'project-row-status';
            if (stateKey) status.dataset.state = stateKey;
            status.textContent = statusLabelByAccess[access] || (access ? String(access).toLowerCase() : '');

            const chevron = document.createElement('span');
            chevron.className = 'project-row-chevron';
            chevron.setAttribute('aria-hidden', 'true');
            chevron.innerHTML = chevronSvg;

            row.append(indexNode, record, status, chevron);
            projectList.appendChild(row);
        };

        if (!state.manifestLoaded && !state.manifestError) {
            appendRow({
                label: t('pl_archive'),
                meta: t('pl_preparing'),
                access: 'Loading',
                actionLabel: 'Wait',
                disabled: true,
                accessClass: 'is-unavailable'
            }, 0);
            return;
        }

        if (state.manifestError) {
            appendRow({
                label: t('pl_archive'),
                meta: t('pl_offline'),
                access: 'Offline',
                actionLabel: 'Unavailable',
                disabled: true,
                accessClass: 'is-unavailable'
            }, 0);
            return;
        }

        if (!state.projects.length) {
            appendRow({
                label: t('pl_archive'),
                meta: t('pl_empty'),
                access: 'Empty',
                actionLabel: 'Unavailable',
                disabled: true,
                accessClass: 'is-unavailable'
            }, 0);
            return;
        }

        const sortedProjects = getSortedProjects();
        const hasOverflow = sortedProjects.length > collapsedProjectLimit;
        const visibleProjects = state.projectsExpanded
            ? sortedProjects
            : sortedProjects.slice(0, collapsedProjectLimit);

        projectList.classList.toggle('is-expanded', state.projectsExpanded && hasOverflow);
        renderProjectMoreButton(hasOverflow);

        visibleProjects.forEach((project, index) => {
            const ticketRecord = getSavedDeviceTicket(project);
            const hasSavedAccess = state.sessionVaultKeys.has(project.id) || canUseSavedDeviceTicket(ticketRecord);

            appendRow({
                label: project.label,
                meta: hasSavedAccess
                    ? t('pl_saved_meta')
                    : project.state === 'sealed' ? t('pl_sealed_meta') : t('pl_open_meta'),
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
        state.projectsExpanded = false;
        renderProjects();

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

    function toggleProjectListExpansion() {
        state.projectsExpanded = !state.projectsExpanded;

        if (!state.projectsExpanded && projectList) {
            projectList.scrollTop = 0;
        }

        renderProjects();
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
        const ownerHash = options.ownerHash || await getClaimedOwnerHash(bundlePayload);
        const unlockResult = await decryptBundleWithVaultKey(bundlePayload, vaultKey, ownerHash);
        const fileMap = unpackArchive(unlockResult.archiveBytes);
        const ownerVerification = await verifyBundleOwner(record, bundlePayload, fileMap, ownerHash);
        assertOwnerVerification(ownerVerification);
        const viewerUrl = buildViewerUrl(record, fileMap, ownerVerification);

        if (rememberInSession) {
            setSessionVaultKey(record, bundlePayload, vaultKey, ownerHash || '');
        }

        viewerWindow.location.replace(viewerUrl);
        closeTokenPrompt({ restorePanelFocus: false });
        closeProjects({ restorePageFocus: false });
    }

    async function trySavedAccess(record, viewerWindow, options = {}) {
        const { allowLocalFallback = false } = options;
        const bundlePayload = await fetchBundlePayload(record);
        const ownerHash = await getClaimedOwnerHash(bundlePayload);
        const sessionVaultKey = getSessionVaultKey(record, bundlePayload, ownerHash || '');

        if (sessionVaultKey) {
            await openViewerFromVaultKey(record, bundlePayload, sessionVaultKey, viewerWindow, { ownerHash });
            return;
        }

        if (!allowLocalFallback) {
            throw new Error('No saved session access is available.');
        }

        const ticketRecord = getSavedLocalFallbackTicket(record);
        if (ticketRecord && ticketRecord.bundleId !== getBundleId(bundlePayload)) {
            await deleteDeviceTicket(record.id, 'local-crypto-key');
            throw new Error('Saved local access is no longer available.');
        }

        if (ticketRecord && (ticketRecord.ownerHash || '') !== (ownerHash || '')) {
            throw new Error('Saved local access belongs to a different owner.');
        }

        const hasMatchingTicket = canUseSavedDeviceTicket(ticketRecord);

        if (hasMatchingTicket) {
            throw new Error('Saved local access requires the owner code.');
        }

        throw new Error('No saved device access is available.');
    }

    async function openRecord(recordId) {
        const record = state.projects.find(project => project.id === recordId);
        if (!record) return;

        const passkeyTicket = getSavedPasskeyTicket(record);
        const fallbackTicket = getSavedLocalFallbackTicket(record);
        const hasSessionAccess = state.sessionVaultKeys.has(record.id);
        const hasPasskeyAccess = canUseSavedDeviceTicket(passkeyTicket);
        const hasFallbackAccess = canUseSavedDeviceTicket(fallbackTicket);

        if (!hasSessionAccess && hasPasskeyAccess) {
            openTokenPrompt(record.id);
            setTokenStatus(t('msg_pk_avail'), 'success');
            return;
        }

        if (!hasSessionAccess && hasFallbackAccess) {
            openFallbackOwnerCodePrompt(record.id);
            return;
        }

        if (!hasSessionAccess) {
            openTokenPrompt(record.id);
            return;
        }

        const viewerWindow = openViewerWindow();
        if (!viewerWindow) {
            openTokenPrompt(record.id);
            setTokenStatus(t('msg_popup_tok'), 'error');
            return;
        }

        writeViewerPlaceholder(viewerWindow, record.label);

        try {
            await trySavedAccess(record, viewerWindow);
        } catch (error) {
            viewerWindow.close();
            if (hasPasskeyAccess) {
                openTokenPrompt(record.id);
                setTokenStatus(
                    error instanceof Error
                        ? tFmt('msg_pk_recheck', error.message)
                        : t('msg_pk_err'),
                    'error'
                );
            } else {
                openTokenPrompt(record.id);
                setTokenStatus(error instanceof Error ? error.message : t('msg_lc_err'), 'error');
            }
        }
    }

    async function unlockActiveRecord(event) {
        event.preventDefault();

        if (!state.activeRecord || !tokenInput) return;

        const token = tokenInput.value.trim();
        if (!token) {
            setTokenStatus(t('msg_enter_token'), 'error');
            tokenInput.focus({ preventScroll: true });
            return;
        }

        clearClipboardSilently();

        setUnlockBusy(true);
        setTokenStatus(devicePassInput?.checked ? t('msg_check_owner') : t('msg_decrypting'), 'success');

        try {
            const bundlePayload = await fetchBundlePayload(state.activeRecord);
            state.activeBundlePayload = bundlePayload;
            configureDevicePassOption(bundlePayload, { resetChoice: false });
            const shouldRememberDevice = Boolean(
                devicePassInput &&
                !devicePassInput.disabled &&
                devicePassInput.checked
            );
            let ownerHash = null;
            let deviceGrant = null;

            if (shouldRememberDevice) {
                const ownerCodeCheck = await verifyRememberOwnerCode(bundlePayload);
                if (!ownerCodeCheck.ok) {
                    showOwnerCodeRiskWarning(ownerCodeCheck);
                    deviceIdInput?.focus({ preventScroll: true });
                    deviceIdInput?.select();
                    return;
                }

                const privateToken = requirePrivateTokenValue();
                ownerHash = ownerCodeCheck.ownerHash || await getClaimedOwnerHash(bundlePayload, ownerCodeCheck.typedCode);
                setTokenStatus(t('msg_check_priv'), 'success');
                deviceGrant = await unwrapDeviceGrantWithPrivateToken(bundlePayload, privateToken, ownerHash || '');
            }

            setTokenStatus(t('msg_decrypting'), 'success');
            ownerHash = ownerHash || await getClaimedOwnerHash(bundlePayload);
            const unlockResult = await decryptBundleWithToken(bundlePayload, token, ownerHash);
            const fileMap = unpackArchive(unlockResult.archiveBytes);
            const ownerVerification = await verifyBundleOwner(state.activeRecord, bundlePayload, fileMap, ownerHash);
            assertOwnerVerification(ownerVerification);
            const viewerUrl = buildViewerUrl(state.activeRecord, fileMap, ownerVerification);
            if (tokenInput) {
                tokenInput.value = '';
            }
            if (privateTokenInput && shouldRememberDevice) {
                privateTokenInput.value = '';
            }

            if (shouldRememberDevice && unlockResult.vaultKey && canAttemptPersistentDevicePass() && ownerVerification.ownerVerified) {
                showDeviceSavePrompt({
                    record: state.activeRecord,
                    bundlePayload,
                    vaultKey: unlockResult.vaultKey,
                    ownerHash,
                    deviceGrant,
                    ownerVerification,
                    viewerUrl,
                    viewerWindow: null
                });
                return;
            }

            if (!shouldRememberDevice || !ownerVerification.ownerVerified) {
                deleteSessionVaultKey(state.activeRecord);
                await deleteLocalFallbackTicket(state.activeRecord);
            }

            showOpenRecordPrompt({
                record: state.activeRecord,
                bundlePayload,
                vaultKey: unlockResult.vaultKey,
                ownerHash,
                ownerVerification,
                viewerUrl,
                viewerWindow: null
            }, ownerVerification.ownerVerified ? t('msg_tok_ok') : t('msg_tok_warn'));
        } catch (error) {
            setTokenStatus(error instanceof Error ? error.message : t('msg_unable'), 'error');
            if (error?.privateTokenError) {
                privateTokenInput?.focus({ preventScroll: true });
                privateTokenInput?.select();
            } else {
                tokenInput.focus({ preventScroll: true });
                tokenInput.select();
            }
        } finally {
            setUnlockBusy(false);
        }
    }

    function handleGlobalKeydown(event) {
        if (ownerRiskDialog && !ownerRiskDialog.hidden) {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeOwnerCodeRiskDialog();
            }
        } else if (tokenOverlay && !tokenOverlay.hidden) {
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
        projectMore?.addEventListener('click', toggleProjectListExpansion);

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
        devicePassInput?.addEventListener('change', handleDevicePassToggle);
        deviceIdInput?.addEventListener('input', handleDeviceIdInput);
        deviceIdInput?.addEventListener('paste', blockDeviceIdTransfer);
        deviceIdInput?.addEventListener('drop', blockDeviceIdTransfer);
        tokenInput?.addEventListener('input', handleTokenInput);
        tokenInput?.addEventListener('paste', blockFallbackOwnerCodeTransfer);
        tokenInput?.addEventListener('drop', blockFallbackOwnerCodeTransfer);
        tokenForm?.addEventListener('submit', handleTokenFormSubmit);

        document.addEventListener('keydown', handleGlobalKeydown);
    }

    async function runEntrance() {
        const greeting = document.querySelector('.greeting');
        const name = document.querySelector('.name');
        const divider = document.querySelector('.divider');
        const tagline = document.querySelector('.tagline');
        const links = document.querySelector('.links');
        const ownerCode = document.querySelector('.owner-code');

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

        if (ownerCode) {
            ownerCode.style.transition = reduceMotion ? 'none' : 'opacity 3s ease';
            ownerCode.style.opacity = '1';
        }

        const langToggleEl = document.getElementById('lang-toggle');
        if (langToggleEl) {
            langToggleEl.style.transition = reduceMotion ? 'none' : 'opacity 3s ease';
            langToggleEl.style.opacity = '1';
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

    function applyLanguage() {
        // Update phrases and restart typing animation
        phrases = TRANSLATIONS[currentLang].phrases || TRANSLATIONS.en.phrases;
        phraseIdx = 0;
        charIdx = 0;
        deleting = false;
        if (typedEl) typedEl.textContent = '';

        // Save preference
        try { localStorage.setItem('evo-lang', currentLang); } catch (e) {}

        // Update lang toggle button label (show the other lang as the toggle target)
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            const langLabel = langBtn.querySelector('.lang-label');
            if (langLabel) langLabel.textContent = currentLang === 'zh' ? 'EN' : 'ZH';
        }

        // Page-level static text
        const greetingEl = document.querySelector('.greeting');
        if (greetingEl) greetingEl.textContent = t('greeting');

        const projectsTrigger = document.getElementById('projects-trigger');
        if (projectsTrigger) projectsTrigger.textContent = t('nav_projects');

        // Project panel
        const projectKicker = document.querySelector('.project-kicker');
        if (projectKicker) projectKicker.textContent = t('project_kicker');

        const projectTitleEl = document.getElementById('project-title');
        if (projectTitleEl) projectTitleEl.textContent = t('project_title');

        const projectDescEl = document.querySelector('.project-description');
        if (projectDescEl) projectDescEl.textContent = t('project_description');

        const projectFootnoteEl = document.querySelector('.project-footnote');
        if (projectFootnoteEl) projectFootnoteEl.textContent = t('project_footnote');

        const projectCloseEl = document.getElementById('project-close');
        if (projectCloseEl) projectCloseEl.setAttribute('aria-label', t('close_proj_aria'));

        // Token panel static elements
        const tokenKicker = document.querySelector('.token-kicker');
        if (tokenKicker) tokenKicker.textContent = t('token_kicker');

        const tokenCloseEl = document.getElementById('token-close');
        if (tokenCloseEl) tokenCloseEl.setAttribute('aria-label', t('close_tok_aria'));

        // Private token label (label[for=private-token-input])
        const privLabelEl = document.querySelector('label[for="private-token-input"]');
        if (privLabelEl) privLabelEl.textContent = t('priv_token_label');

        const privInputEl = document.getElementById('private-token-input');
        if (privInputEl) privInputEl.placeholder = t('priv_token_ph');

        // Device pass title
        const devPassTitleEl = document.querySelector('.device-pass-title');
        if (devPassTitleEl) devPassTitleEl.textContent = t('dev_pass_title');

        // Device id section
        const devIdLabelEl = document.querySelector('label[for="device-id-input"]');
        if (devIdLabelEl) devIdLabelEl.textContent = t('dev_id_label');

        const devIdDetailEl = document.querySelector('.device-id-detail');
        if (devIdDetailEl) devIdDetailEl.textContent = t('dev_id_detail');

        const privTokenDetailEl = document.querySelector('.private-token-detail');
        if (privTokenDetailEl) privTokenDetailEl.textContent = t('priv_token_detail');

        // Saved passkey button
        if (savedPasskeyButton) savedPasskeyButton.textContent = t('passkey_btn');

        // Re-apply current mode if token overlay is open, else set defaults
        if (tokenOverlay && !tokenOverlay.hidden) {
            const currentMode = tokenPanel?.getAttribute('data-mode') || 'token';
            setTokenPromptMode(currentMode, state.activeRecord);
        } else {
            if (tokenTitle) tokenTitle.textContent = t('tok_title_token');
            if (tokenDescription) tokenDescription.textContent = t('tok_desc_default');
            if (tokenSubmit) tokenSubmit.textContent = t('tok_submit_token');
            if (tokenCancel) tokenCancel.textContent = t('tok_cancel_token');
            if (tokenNote) tokenNote.textContent = t('tok_note_token');
            if (tokenLabel) tokenLabel.textContent = t('tok_label_token');
            if (tokenInput) tokenInput.placeholder = t('tok_ph_token');
        }

        // Update owner risk dialog if visible
        if (ownerRiskDialog && !ownerRiskDialog.hidden) {
            const rPanel = ownerRiskDialog.querySelector('.owner-risk-panel');
            if (rPanel) {
                const titleEl = rPanel.querySelector('#owner-risk-title');
                if (titleEl) titleEl.textContent = t('risk_title');
                const dts = rPanel.querySelectorAll('dt');
                const dds = rPanel.querySelectorAll('dd');
                if (dts[0]) dts[0].textContent = t('ov_owner_code');
                if (dts[1]) dts[1].textContent = t('risk_integrity');
                if (dts[2]) dts[2].textContent = t('risk_risk');
                if (dds[1]) dds[1].textContent = t('risk_integrity_v');
                if (dds[2]) dds[2].textContent = t('risk_risk_v');
                const msgEl = rPanel.querySelector('.owner-verification-message');
                if (msgEl) msgEl.textContent = t('risk_msg');
                const actionEl = rPanel.querySelector('.owner-risk-action');
                if (actionEl) actionEl.textContent = t('risk_action');
            }
        }

        // Re-render dynamic sections
        configureDevicePassOption(state.activeBundlePayload);
        configureSavedPasskeyOption(state.activeRecord);
        if (overlay && !overlay.hidden) {
            renderProjects();
        }
    }

    function setupLangToggle() {
        const langBtn = document.getElementById('lang-toggle');
        if (!langBtn) return;

        const langLabel = langBtn.querySelector('.lang-label');
        if (langLabel) langLabel.textContent = currentLang === 'zh' ? 'EN' : 'ZH';

        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            applyLanguage();
        });
    }

    setupProjectOverlay();
    loadProjectManifest();
    runEntrance();
    setupLangToggle();

    // Apply saved language on load (after DOM elements are available)
    if (currentLang !== 'en') {
        applyLanguage();
    }
})();
