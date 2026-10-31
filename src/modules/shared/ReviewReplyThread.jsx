import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Plus, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import defaultAvatar from "../../assets/shared/default_user.webp";
import { reviewLogService } from "../../services/reviewLogService";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import ErrorNotice from "../../components/ErrorNotice";

const PAGE_SIZE = 20;

function relativeTime(value) {
  if (!value) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString();
}

function ReplyRow({ reply, onReply }) {
  return (
    <div className="flex gap-3">
      <img src={reply.author_image_url || defaultAvatar} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-inter text-[13px] font-bold text-[#1f5cae]">{reply.author_name || "Former user"}</span>
          {reply.parent_reply && <span className="font-inter text-[11px] text-gray-500">↪ {reply.reply_to_name}</span>}
          <span className="font-inter text-[11px] text-gray-400">{relativeTime(reply.created_at)}</span>
        </div>
        <p className="mb-0 mt-1 whitespace-pre-wrap break-words font-inter text-[13px] leading-6 text-gray-700">{reply.message}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span title="Voting is not available" className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-inter text-[11px] text-gray-500 opacity-70" aria-label="Approve reply, voting unavailable"><ThumbsUp size={15} /> 0</span>
          <span title="Voting is not available" className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-inter text-[11px] text-gray-500 opacity-70" aria-label="Disapprove reply, voting unavailable"><ThumbsDown size={15} /> 0</span>
          {onReply && <button type="button" onClick={() => onReply(reply)} className="rounded-md px-2 py-1 font-inter text-[12px] font-semibold text-[#1f5cae] transition hover:bg-blue-50">Reply</button>}
        </div>
      </div>
    </div>
  );
}

export default function ReviewReplyThread({ log, canReply = false, onCountChange }) {
  const logId = log?.log_id;
  const [replies, setReplies] = useState([]);
  const [count, setCount] = useState(log?.reply_count || 0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [sending, setSending] = useState(false);
  const requestIdRef = useRef(null);

  useEffect(() => {
    setReplies([]); setCount(log?.reply_count || 0); setPage(1); setTotalPages(1);
    setExpanded(false); setDraft(""); setReplyTarget(null); setError("");
    requestIdRef.current = null;
  }, [logId, log?.reply_count]);

  const loadPage = useCallback(async (nextPage, append = false) => {
    if (!logId) return;
    setLoading(true); setError("");
    try {
      const result = await reviewLogService.getReplies(logId, { page: nextPage, pageSize: PAGE_SIZE });
      const rows = result?.results || [];
      setReplies((current) => append ? [...current, ...rows.filter((row) => !current.some((item) => item.reply_id === row.reply_id))] : rows);
      setCount(result?.count ?? rows.length);
      setTotalPages(result?.total_pages || 1);
      setPage(nextPage);
      setExpanded(true);
      onCountChange?.(logId, result?.count ?? rows.length);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError) || "Could not load replies. Please try again.");
    } finally { setLoading(false); }
  }, [logId, onCountChange]);

  useEffect(() => {
    if (!expanded) return undefined;
    const refreshReplies = () => loadPage(1, false);
    window.addEventListener("vista:realtime-notification", refreshReplies);
    return () => window.removeEventListener("vista:realtime-notification", refreshReplies);
  }, [expanded, loadPage]);

  const submit = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;
    setSending(true); setError("");
    try {
      requestIdRef.current ||= globalThis.crypto?.randomUUID?.()
        || `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
      await reviewLogService.createReply(logId, { message, parentReply: replyTarget?.reply_id || null, clientRequestId: requestIdRef.current });
      setDraft(""); setReplyTarget(null);
      requestIdRef.current = null;
      await loadPage(1, false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError) || "Could not send reply. Your draft is still here; please retry.");
    } finally { setSending(false); }
  };

  const remaining = Math.max(0, count - replies.length);
  return (
    <div className="mt-3 font-inter">
      {error && <div className="mb-2"><ErrorNotice message={error} onRetry={() => loadPage(expanded ? page : 1, expanded && page > 1)} /></div>}
      {expanded && replies.length > 0 && (
        <div className="space-y-4 border-l-2 border-[#dbe4f0] py-1 pl-4">
          {replies.map((reply) => <ReplyRow key={reply.reply_id} reply={reply} onReply={canReply ? setReplyTarget : null} />)}
        </div>
      )}
      {expanded && page < totalPages && (
        <button type="button" disabled={loading} onClick={() => loadPage(page + 1, true)} className="ml-4 mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1 font-inter text-[12px] font-semibold text-[#1f5cae] transition hover:bg-blue-50 disabled:opacity-60">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#1f5cae]"><Plus size={13} /></span>
          {loading ? "Loading…" : `${remaining} more repl${remaining === 1 ? "y" : "ies"}`}
        </button>
      )}
      {!expanded && count > 0 && (
        <button type="button" disabled={loading} onClick={() => loadPage(1)} className="ml-4 inline-flex items-center gap-2 rounded-md px-2 py-1 font-inter text-[12px] font-semibold text-[#1f5cae] transition hover:bg-blue-50 disabled:opacity-60">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#1f5cae]"><Plus size={13} /></span>
          {loading ? "Loading…" : `${count} ${count === 1 ? "reply" : "replies"}`}
        </button>
      )}
      {canReply && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            {replyTarget && <div className="mb-1 flex items-center gap-2 text-[11px] text-gray-500"><MessageCircle size={13} /> Replying to {replyTarget.author_name}<button type="button" onClick={() => setReplyTarget(null)} className="font-semibold text-[#1f5cae]">Cancel</button></div>}
            <textarea value={draft} onChange={(event) => setDraft(event.target.value.slice(0, 4000))} maxLength={4000} rows={2} placeholder="Write a reply…" className="w-full resize-y rounded-lg border border-gray-200 bg-[#f5f8fc] px-3 py-2 font-inter text-[13px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#1f5cae] focus:ring-2 focus:ring-blue-100" />
          </div>
          <button type="submit" disabled={sending || !draft.trim()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1f5cae] px-4 py-2 font-inter text-[12px] font-bold text-white transition hover:bg-[#174b90] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} />{sending ? "Sending…" : "Reply"}</button>
        </form>
      )}
    </div>
  );
}
