export const REPLY_MAX_LENGTH = 4000;

export function replyUrl(value) {
  const text = String(value || '').trim();
  if (!/^https?:\/\//i.test(text) || /[\s<>]/.test(text)
      || Array.from(text).some(character => character.codePointAt(0) < 32 || character.codePointAt(0) === 127)) return null;
  try {
    const url = new URL(text);
    return url.hostname && !url.username && !url.password ? text : null;
  } catch { return null; }
}

export function composeReply(text, link = '') {
  const url = link.trim();
  const message = [text.trim(), url].filter(Boolean).join('\n');
  const length = Array.from(message).length;
  const error = url && !replyUrl(url) ? 'Enter a valid http:// or https:// link.'
    : length > REPLY_MAX_LENGTH ? 'Keep the message and link within 4,000 characters.' : '';
  return { message, length, error, canSend: Boolean(message) && !error };
}

// Return text and safe URL segments, never HTML. A dedicated link occupies its
// own line, so its exact path/query is retained in the existing message field.
export function replySegments(message) {
  const text = String(message || '');
  const segments = [];
  let end = 0;
  for (const match of text.matchAll(/https?:\/\/[^\s<>]+/gi)) {
    if (match.index > end) segments.push({ text: text.slice(end, match.index) });
    const lineStart = text.lastIndexOf('\n', match.index - 1) + 1;
    const nextLine = text.indexOf('\n', match.index);
    const line = text.slice(lineStart, nextLine < 0 ? text.length : nextLine).trim();
    const candidate = line === match[0] ? match[0] : match[0].replace(/[.,!?;:]+$/, '');
    const href = replyUrl(candidate);
    segments.push(href ? { text: candidate, href } : { text: candidate });
    if (candidate.length < match[0].length) segments.push({ text: match[0].slice(candidate.length) });
    end = match.index + match[0].length;
  }
  if (end < text.length) segments.push({ text: text.slice(end) });
  return segments;
}
