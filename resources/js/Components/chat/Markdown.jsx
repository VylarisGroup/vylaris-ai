import { Check, Copy } from 'lucide-react';
import { isValidElement, memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

function textOf(node) {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(textOf).join('');
    if (isValidElement(node)) return textOf(node.props.children);
    return '';
}

export function CopyButton({ text, className = '', label = 'Kopieren' }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            // Zwischenablage nicht verfügbar
        }
    };

    return (
        <button type="button" onClick={copy} aria-label={label} title={label} className={`inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs hover:bg-white/10 ${className}`}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Kopiert' : label}
        </button>
    );
}

function CodeBlock({ children }) {
    const code = isValidElement(children) ? children : null;
    const className = code?.props?.className || '';
    const language = /language-(\w+)/.exec(className)?.[1] || 'text';

    return (
        <div className="not-prose my-3 overflow-hidden rounded-xl border border-zinc-700 bg-[#0d1117] text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-300">
                <span>{language}</span>
                <CopyButton text={textOf(children).replace(/\n$/, '')} label="Code kopieren" />
            </div>
            <pre>{children}</pre>
        </div>
    );
}

/**
 * Rendert Markdown ohne rohes HTML (XSS-sicher): Links öffnen extern mit rel=noopener noreferrer.
 */
function Markdown({ content }) {
    return (
        <div className="md-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
                skipHtml
                components={{
                    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                    a: ({ href, children }) => {
                        const safe = /^(https?:|mailto:|#)/i.test(href || '');
                        return safe ? (
                            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                                {children}
                            </a>
                        ) : (
                            <span>{children}</span>
                        );
                    },
                    table: ({ children }) => (
                        <div className="overflow-x-auto">
                            <table>{children}</table>
                        </div>
                    ),
                }}
            >
                {content || ''}
            </ReactMarkdown>
        </div>
    );
}

export default memo(Markdown);
