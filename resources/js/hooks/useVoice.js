import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorMessage } from '@/lib/api';

/**
 * Aufnahme über das Mikrofon mit Pegelanzeige. Die Transkription erfolgt serverseitig (STT-Provider).
 */
export function useRecorder({ language, onTranscript, onError }) {
    const [state, setState] = useState('idle'); // idle | recording | transcribing
    const [level, setLevel] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const recorder = useRef(null);
    const stream = useRef(null);
    const chunks = useRef([]);
    const raf = useRef(0);
    const timer = useRef(0);
    const audioCtx = useRef(null);

    const cleanup = useCallback(() => {
        cancelAnimationFrame(raf.current);
        clearInterval(timer.current);
        stream.current?.getTracks().forEach((t) => t.stop());
        audioCtx.current?.close?.().catch(() => {});
        audioCtx.current = null;
        setLevel(0);
    }, []);

    useEffect(() => cleanup, [cleanup]);

    const start = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
            onError?.('Dieser Browser unterstützt keine Audioaufnahme.');
            return;
        }

        try {
            stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        } catch (e) {
            onError?.('Zugriff auf das Mikrofon wurde verweigert.');
            return;
        }

        const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((m) => MediaRecorder.isTypeSupported(m));
        recorder.current = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined);
        chunks.current = [];
        recorder.current.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
        recorder.current.onstop = async () => {
            const type = recorder.current.mimeType || 'audio/webm';
            const blob = new Blob(chunks.current, { type });
            cleanup();

            if (blob.size < 800) {
                setState('idle');
                return;
            }

            setState('transcribing');
            try {
                const form = new FormData();
                form.append('audio', blob, `aufnahme.${type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : 'webm'}`);
                if (language) form.append('language', language);
                const data = await api.post(route('voice.transcribe'), form);
                onTranscript?.(data.text);
            } catch (e) {
                onError?.(errorMessage(e, 'Transkription fehlgeschlagen.'));
            } finally {
                setState('idle');
            }
        };

        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            audioCtx.current = new Ctx();
            const analyser = audioCtx.current.createAnalyser();
            analyser.fftSize = 512;
            audioCtx.current.createMediaStreamSource(stream.current).connect(analyser);
            const data = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
                analyser.getByteTimeDomainData(data);
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = (data[i] - 128) / 128;
                    sum += v * v;
                }
                setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
                raf.current = requestAnimationFrame(tick);
            };
            tick();
        } catch (e) {
            // Pegelanzeige ist optional
        }

        recorder.current.start();
        setSeconds(0);
        timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        setState('recording');
    }, [cleanup, language, onError, onTranscript]);

    const stop = useCallback(() => {
        if (recorder.current?.state === 'recording') recorder.current.stop();
    }, []);

    const cancel = useCallback(() => {
        if (recorder.current) recorder.current.onstop = null;
        if (recorder.current?.state === 'recording') recorder.current.stop();
        cleanup();
        setState('idle');
    }, [cleanup]);

    return { state, level, seconds, start, stop, cancel };
}

let sharedAudio = null;
let sharedListeners = new Set();

function notify(id) {
    sharedListeners.forEach((fn) => fn(id));
}

/**
 * Vorlesen: Audio kommt vom TTS-Provider (serverseitig). Es spielt immer nur eine Nachricht gleichzeitig.
 */
export function useTts(messageKey, voicePrefs) {
    const [status, setStatus] = useState('idle'); // idle | loading | playing

    useEffect(() => {
        const listener = (id) => {
            if (id !== messageKey) setStatus('idle');
        };
        sharedListeners.add(listener);
        return () => sharedListeners.delete(listener);
    }, [messageKey]);

    const stop = useCallback(() => {
        if (sharedAudio) {
            sharedAudio.pause();
            URL.revokeObjectURL(sharedAudio.src);
            sharedAudio = null;
        }
        setStatus('idle');
    }, []);

    const speak = useCallback(
        async (text, onError) => {
            if (status !== 'idle') {
                stop();
                return;
            }

            notify(messageKey);
            if (sharedAudio) {
                sharedAudio.pause();
                sharedAudio = null;
            }

            setStatus('loading');
            try {
                const response = await api.post(
                    route('voice.speak'),
                    { text, voice: voicePrefs?.name || undefined, speed: voicePrefs?.speed || 1, format: voicePrefs?.format || undefined },
                    { responseType: 'blob' },
                );
                const url = URL.createObjectURL(response);
                const audio = new Audio(url);
                sharedAudio = audio;
                audio.onended = () => {
                    URL.revokeObjectURL(url);
                    setStatus('idle');
                    sharedAudio = null;
                };
                audio.onerror = () => setStatus('idle');
                await audio.play();
                setStatus('playing');
            } catch (e) {
                let message = errorMessage(e, 'Sprachausgabe fehlgeschlagen.');
                if (e?.response?.data instanceof Blob) {
                    try {
                        message = JSON.parse(await e.response.data.text()).message || message;
                    } catch (err) {
                        // Standardmeldung
                    }
                }
                setStatus('idle');
                onError?.(message);
            }
        },
        [messageKey, status, stop, voicePrefs],
    );

    return { status, speak, stop };
}
