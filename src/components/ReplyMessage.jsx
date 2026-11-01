import { replySegments } from '../utils/replyContent';

export default function ReplyMessage({ message }) {
  return replySegments(message).map((part, index) => part.href
    ? <a key={index} href={part.href} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-[#1f5cae] underline [overflow-wrap:anywhere]">{part.text}</a>
    : part.text);
}
