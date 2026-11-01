import { useEffect, useId, useRef, useState } from "react";
import { Link2, MessageCircle, Plus, Send, ThumbsDown, ThumbsUp, X } from "lucide-react";
import defaultAvatar from "../../assets/shared/default_user.webp";
import { reviewLogService } from "../../services/reviewLogService";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import ErrorNotice from "../../components/ErrorNotice";
import ReplyMessage from "../../components/ReplyMessage";
import { composeReply } from "../../utils/replyContent";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

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
        <p className="mb-0 mt-1 whitespace-pre-wrap break-words font-inter text-[13px] leading-6 text-gray-700"><ReplyMessage message={reply.message} /></p>
        <div className="mt-2 flex items-center gap-1.5">
          <span title="Voting is not available" className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-inter text-[11px] text-gray-500 opacity-70" aria-label="Approve reply, voting unavailable"><ThumbsUp size={15} /> 0</span>
          <span title="Voting is not available" className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-inter text-[11px] text-gray-500 opacity-70" aria-label="Disapprove reply, voting unavailable"><ThumbsDown size={15} /> 0</span>
          {onReply && <button type="button" onClick={() => onReply(reply)} className="rounded-md px-2 py-1 font-inter text-[12px] font-semibold text-[#1f5cae] transition hover:bg-blue-50">Reply</button>}
        </div>
      </div>
    </div>
  );
}

export default function ReviewReplyThread({ log, canReply = false, onCountChange, onAccessLost }) {
  return <ThreadContent key={log?.log_id} log={log} canReply={canReply} onCountChange={onCountChange} onAccessLost={onAccessLost} />;
}

function ThreadContent({ log, canReply, onCountChange, onAccessLost }) {
  const logId = log?.log_id;
  const cache = useQueryClient();
  const account = cache.getQueryData(["current_user"]);
  const accountId = account?.user_id;
  const linkId = useId();
  const queryKey = ["review-replies", accountId, logId];
  const [expanded, setExpanded] = useState(false);
  const [sendError, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [link, setLink] = useState("");
  const [linkVisible, setLinkVisible] = useState(false);
  const content = composeReply(draft, link);
  const [replyTarget, setReplyTarget] = useState(null);
  const [sending, setSending] = useState(false);
  const [denied, setDenied] = useState(false);
  const [confirmedReply, setConfirmedReply] = useState(null);
  const requestIdRef = useRef(null);
  const pending = useRef(false);
  const mounted = useRef(true);
  const controller = useRef(null);
  const repliesQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => reviewLogService.getReplies(logId, { page: pageParam, pageSize: PAGE_SIZE, signal }),
    initialPageParam: 1,
    getNextPageParam: result => result.next ? result.current_page + 1 : undefined,
    enabled: expanded && !denied,
    retry: false,
    staleTime: 0,
  });
  const count = repliesQuery.data?.pages[0]?.count ?? log?.reply_count ?? 0;
  const page = repliesQuery.data?.pages.length ?? 1;
  const totalPages = repliesQuery.data?.pages[0]?.total_pages ?? 1;
  const loaded = repliesQuery.data?.pages.flatMap(result => result.results) ?? [];
  const replies = confirmedReply && !loaded.some(reply => reply.reply_id === confirmedReply.reply_id)
    ? [...loaded, confirmedReply] : loaded;
  const loading = repliesQuery.isFetching;
  const error = sendError || (repliesQuery.isError ? getApiErrorMessage(repliesQuery.error, "Could not load replies. Please try again.") : "");
  const accessDenied = denied || [403, 404].includes(repliesQuery.error?.response?.status);
  const allowed = canReply && log?.can_reply === true;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);
  useEffect(() => { if (accessDenied) onAccessLost?.(); }, [accessDenied, onAccessLost]);
  useEffect(() => {
    if (repliesQuery.data) onCountChange?.(logId, count);
  }, [repliesQuery.data, logId, count, onCountChange]);

  const loadPage = async (_nextPage, append = false) => {
    setError("");
    if (!expanded) { setExpanded(true); return; }
    if (append) await repliesQuery.fetchNextPage();
    else await repliesQuery.refetch();
  };
  const submit = async event => {
    event.preventDefault();
    const message = content.message;
    if (!allowed || pending.current || !content.canSend) return;
    pending.current = true;
    setSending(true); setError("");
    const signature = JSON.stringify([message, replyTarget?.reply_id ?? null]);
    if (requestIdRef.current?.signature !== signature) requestIdRef.current = { signature, id: crypto.randomUUID() };
    controller.current = new AbortController();
    try {
      const saved = await reviewLogService.createReply(logId, {
        message, parent_reply: replyTarget?.reply_id ?? null, client_request_id: requestIdRef.current.id,
      }, { signal: controller.current.signal });
      const fresh = await reviewLogService.getReplies(logId, { signal: controller.current.signal });
      if (!mounted.current) return;
      cache.setQueryData(queryKey, previous => ({
        pages: [fresh, ...(previous?.pages.slice(1) ?? [])],
        pageParams: previous?.pageParams ?? [1],
      }));
      setConfirmedReply(saved); setDraft(""); setLink(""); setLinkVisible(false); setReplyTarget(null); setExpanded(true);
      requestIdRef.current = null;
      onCountChange?.(logId, fresh.count);
      window.dispatchEvent(new CustomEvent("vista:review-logs-updated", { detail: { submissionId: log.submission_id } }));
    } catch (requestError) {
      if (!mounted.current) return;
      if ([403, 404].includes(requestError.response?.status)) {
        setDenied(true); cache.removeQueries({ queryKey });
      } else setError(getApiErrorMessage(requestError, "Your reply could not be confirmed. Your draft is still here; please retry."));
    } finally {
      pending.current = false;
      if (mounted.current) setSending(false);
    }
  };
  if (accessDenied) return <p role="alert" className="mt-3 text-sm text-red-700">This conversation is no longer accessible. Reload the submission.</p>;
  const remaining = Math.max(0, count - replies.length);
  return (
    <div className="mt-3 font-inter">
      {error && <div className="mb-2"><ErrorNotice message={error} onRetry={() => loadPage(expanded ? page : 1, expanded && page > 1)} /></div>}
      {expanded && replies.length > 0 && (
        <div className="space-y-4 border-l-2 border-[#dbe4f0] py-1 pl-4">
          {replies.map((reply) => <ReplyRow key={reply.reply_id} reply={reply} onReply={allowed ? setReplyTarget : null} />)}
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
      {allowed && (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            {replyTarget && <div className="mb-1 flex items-center gap-2 text-[11px] text-gray-500"><MessageCircle size={13} /> Replying to {replyTarget.author_name}<button type="button" onClick={() => setReplyTarget(null)} className="font-semibold text-[#1f5cae]">Cancel</button></div>}
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} placeholder="Write a reply…" className="w-full resize-y rounded-lg border border-gray-200 bg-[#f5f8fc] px-3 py-2 font-inter text-[13px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#1f5cae] focus:ring-2 focus:ring-blue-100" />
            {linkVisible && <div className="mt-2 flex min-w-0 items-center gap-2">
              <label htmlFor={linkId} className="sr-only">Optional reply link</label>
              <input id={linkId} type="url" inputMode="url" value={link} onChange={event => setLink(event.target.value)} placeholder="https://example.com" disabled={sending} aria-invalid={Boolean(link.trim() && content.error)} className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-[#1f5cae]" />
              <button type="button" disabled={sending} onClick={() => { setLink(""); setLinkVisible(false); }} aria-label="Remove link" className="shrink-0 rounded-md p-2 text-gray-500 hover:bg-blue-50"><X size={16} /></button>
            </div>}
            {content.error && <p role="alert" className="mt-1 text-xs text-red-700">{content.error}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {account?.role === "student" && <button type="button" disabled={sending} onClick={() => setLinkVisible(true)} aria-label="Add link" aria-expanded={linkVisible} aria-controls={linkVisible ? linkId : undefined} title="Add link" className="inline-flex items-center justify-center rounded-lg border border-[#dbe4f0] p-2 text-[#1f5cae] transition hover:bg-blue-50 disabled:opacity-50"><Link2 size={16} /></button>}
            <button type="submit" disabled={sending || !content.canSend} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1f5cae] px-4 py-2 font-inter text-[12px] font-bold text-white transition hover:bg-[#174b90] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} />{sending ? "Sending…" : "Reply"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
