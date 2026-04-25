importScripts('vendor/argon2-bundled.min.js');

const textEncoder = new TextEncoder();

function base64ToBytes(base64Value) {
    const binary = self.atob(base64Value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

function createWorkerError(message) {
    const error = new Error(message);
    error.isVaultWorkerError = true;
    return error;
}

function getBundleAad(bundlePayload) {
    if (!bundlePayload || !bundlePayload.bundleId) {
        return undefined;
    }

    return textEncoder.encode(`evo-vault-archive:${bundlePayload.taskId}:${bundlePayload.bundleId}`);
}

function getSlotAad(bundlePayload, slot) {
    if (!bundlePayload || !bundlePayload.bundleId || !slot || !slot.id) {
        return undefined;
    }

    return textEncoder.encode(`evo-vault-slot:${bundlePayload.taskId}:${bundlePayload.bundleId}:${slot.id}`);
}

async function importAesKey(keyBytes, usages) {
    return self.crypto.subtle.importKey(
        'raw',
        keyBytes,
        'AES-GCM',
        false,
        usages
    );
}

async function deriveTokenKey(token, kdf) {
    if (!self.argon2 || typeof self.argon2.hash !== 'function') {
        throw createWorkerError('Argon2 runtime unavailable.');
    }

    const result = await self.argon2.hash({
        pass: token,
        salt: base64ToBytes(kdf.salt),
        time: kdf.passes,
        mem: kdf.memoryKiB,
        hashLen: kdf.tagLength,
        parallelism: kdf.parallelism,
        type: self.argon2.ArgonType.Argon2id
    });

    return importAesKey(result.hash, ['decrypt']);
}

function validateLegacyBundlePayload(bundlePayload) {
    if (!bundlePayload || bundlePayload.version !== 2) {
        throw createWorkerError('Archive format is outdated and must be resealed.');
    }

    if (!bundlePayload.kdf || bundlePayload.kdf.name !== 'Argon2id') {
        throw createWorkerError('Archive format is outdated and must be resealed.');
    }

    if (!bundlePayload.bundle || bundlePayload.bundle.cipher !== 'AES-GCM') {
        throw createWorkerError('Archive cipher is unsupported.');
    }
}

function validateVaultBundlePayload(bundlePayload) {
    if (!bundlePayload || bundlePayload.version !== 3) {
        throw createWorkerError('Archive format is unsupported.');
    }

    if (!bundlePayload.bundleId || !bundlePayload.bundle || bundlePayload.bundle.cipher !== 'AES-GCM') {
        throw createWorkerError('Archive cipher is unsupported.');
    }

    if (!Array.isArray(bundlePayload.slots)) {
        throw createWorkerError('Archive unlock slots are missing.');
    }
}

function getTokenSlot(bundlePayload) {
    return bundlePayload.slots.find(slot => slot && slot.type === 'token-argon2id');
}

async function decryptLegacyBundle(bundlePayload, token) {
    validateLegacyBundlePayload(bundlePayload);

    const key = await deriveTokenKey(token, bundlePayload.kdf);
    return self.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: base64ToBytes(bundlePayload.bundle.iv)
        },
        key,
        base64ToBytes(bundlePayload.bundle.ciphertext)
    );
}

async function unwrapVaultKey(bundlePayload, token) {
    validateVaultBundlePayload(bundlePayload);

    const tokenSlot = getTokenSlot(bundlePayload);
    if (!tokenSlot || tokenSlot.cipher !== 'AES-GCM' || !tokenSlot.kdf || tokenSlot.kdf.name !== 'Argon2id') {
        throw createWorkerError('Archive token slot is unavailable.');
    }

    const slotKey = await deriveTokenKey(token, tokenSlot.kdf);
    const vaultKey = await self.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: base64ToBytes(tokenSlot.iv),
            additionalData: getSlotAad(bundlePayload, tokenSlot)
        },
        slotKey,
        base64ToBytes(tokenSlot.wrappedVaultKey)
    );

    return new Uint8Array(vaultKey);
}

async function decryptVaultBundle(bundlePayload, vaultKeyBytes) {
    validateVaultBundlePayload(bundlePayload);

    const key = await importAesKey(vaultKeyBytes, ['decrypt']);
    return self.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: base64ToBytes(bundlePayload.bundle.iv),
            additionalData: getBundleAad(bundlePayload)
        },
        key,
        base64ToBytes(bundlePayload.bundle.ciphertext)
    );
}

self.addEventListener('message', async event => {
    const { id, mode = 'token', token, vaultKey, bundlePayload } = event.data || {};
    if (typeof id !== 'number') return;

    try {
        let plaintext;
        let unwrappedVaultKey = null;

        if (bundlePayload && bundlePayload.version === 2) {
            if (mode !== 'token') {
                throw createWorkerError('Legacy archives require a token.');
            }

            plaintext = await decryptLegacyBundle(bundlePayload, token);
        } else if (mode === 'vaultKey') {
            plaintext = await decryptVaultBundle(bundlePayload, new Uint8Array(vaultKey));
        } else {
            unwrappedVaultKey = await unwrapVaultKey(bundlePayload, token);
            plaintext = await decryptVaultBundle(bundlePayload, unwrappedVaultKey);
        }

        self.postMessage(
            {
                id,
                ok: true,
                archiveBytes: plaintext,
                vaultKey: unwrappedVaultKey ? unwrappedVaultKey.buffer : null
            },
            unwrappedVaultKey ? [plaintext, unwrappedVaultKey.buffer] : [plaintext]
        );
    } catch (error) {
        const message = error && error.isVaultWorkerError
            ? error.message
            : 'Unable to unlock this record.';

        self.postMessage({
            id,
            ok: false,
            error: message
        });
    }
});
