// @ts-check
/** @namespace TeqFw_Cfg_Source_DotenvParser @description Deterministic internal dotenv grammar parser. */
// @ts-nocheck

export default function DotenvParser() {
    this.parse = function(text) {
        if (typeof text !== 'string') throw new TypeError('text');
        const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
        const lines = []; let current = ''; let quote = null;
        for (const char of source) {
            if (quote) { if (char === quote) { current += char; quote = null; } else current += char === '\n' ? '\n' : char; }
            else if (char === '\n') { lines.push(current); current = ''; }
            else { if (char === "'" || char === '"') quote = char; current += char; }
        }
        if (quote) throw new Error('unclosed quote');
        lines.push(current);
        const result = new Map();
        for (const line of lines) {
            const trimmed = line.trim(); if (!trimmed || trimmed.startsWith('#')) continue;
            const match = /^(?:(export)(\s+))?([^\s=]+)\s*=\s*(.*)$/.exec(line.trimStart().replace(/\r$/, ''));
            if (!match) throw new Error('malformed assignment');
            result.set(match[3], parseValue(match[4]));
        }
        return Object.fromEntries(result);
    };
}
function parseValue(raw) {
    if (raw.startsWith("'")) { const end = raw.indexOf("'", 1); if (end < 0 || (raw.slice(end + 1).trim() && !raw.slice(end + 1).trim().startsWith('#'))) throw new Error('malformed quote'); return raw.slice(1, end); }
    if (raw.startsWith('"')) { let value = ''; let closed = false; for (let index = 1; index < raw.length; index++) { const char = raw[index]; if (char === '"') { closed = true; if (raw.slice(index + 1).trim() && !raw.slice(index + 1).trim().startsWith('#')) throw new Error('malformed quote'); break; } if (char === '\\') { const escaped = raw[++index]; const values = {'\\':'\\','"':'"',n:'\n',r:'\r',t:'\t'}; if (!(escaped in values)) throw new Error('unsupported escape'); value += values[escaped]; } else value += char; } if (!closed) throw new Error('unclosed quote'); return value; }
    const comment = raw.indexOf('#'); return (comment < 0 ? raw : raw.slice(0, comment)).trim();
}
