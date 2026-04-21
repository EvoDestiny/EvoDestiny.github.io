importScripts('vendor/argon2-bundled.min.js');

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

async function deriveAesKey(token, kdf) {
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

    return self.crypto.subtle.importKey(
        'raw',
        result.hash,
        'AES-GCM',
        false,
        ['decrypt']
    );
}

function validateBundlePayload(bundlePayload) {
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

self.addEventListener('message', async event => {
    const { id, token, bundlePayload } = event.data || {};
    if (typeof id !== 'number') return;

    try {
        validateBundlePayload(bundlePayload);

        const key = await deriveAesKey(token, bundlePayload.kdf);
        const plaintext = await self.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: base64ToBytes(bundlePayload.bundle.iv)
            },
            key,
            base64ToBytes(bundlePayload.bundle.ciphertext)
        );

        self.postMessage(
            {
                id,
                ok: true,
                archiveBytes: plaintext
            },
            [plaintext]
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
