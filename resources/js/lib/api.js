import axios from 'axios';

/** Liest das XSRF-Token-Cookie für fetch()-Anfragen (axios macht das automatisch). */
export function xsrfToken() {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export const api = {
    get: (url, config) => axios.get(url, config).then((r) => r.data),
    post: (url, data, config) => axios.post(url, data, config).then((r) => r.data),
    patch: (url, data, config) => axios.patch(url, data, config).then((r) => r.data),
    delete: (url, config) => axios.delete(url, config).then((r) => r.data),
};

export function errorMessage(error, fallback = 'Aktion fehlgeschlagen.') {
    const data = error?.response?.data;
    if (data?.errors) {
        return Object.values(data.errors).flat().join(' ');
    }
    return data?.message || fallback;
}

/**
 * POST mit Server-Sent-Events. Ruft onEvent für jedes Ereignis auf.
 * Gibt eine Funktion zum Abbrechen zurück.
 */
export function streamPost(url, body, onEvent, { signal } = {}) {
    return fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        signal,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            'X-XSRF-TOKEN': xsrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(body),
    }).then(async (response) => {
        if (!response.ok) {
            let message = `Fehler ${response.status}`;
            try {
                const data = await response.json();
                message = data.message || Object.values(data.errors || {}).flat().join(' ') || message;
            } catch (e) {
                // Antwort war kein JSON
            }
            throw new Error(message);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let index;
            while ((index = buffer.indexOf('\n\n')) !== -1) {
                const raw = buffer.slice(0, index);
                buffer = buffer.slice(index + 2);
                const line = raw.split('\n').find((l) => l.startsWith('data:'));
                if (!line) continue;
                try {
                    onEvent(JSON.parse(line.slice(5).trim()));
                } catch (e) {
                    // unvollständiges Ereignis ignorieren
                }
            }
        }
    });
}

export function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function formatDate(iso) {
    if (!iso) return '–';
    return new Date(iso).toLocaleString('de-CH', { dateStyle: 'medium', timeStyle: 'short' });
}
