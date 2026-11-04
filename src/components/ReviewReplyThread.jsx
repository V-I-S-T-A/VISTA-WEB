import { useId, useRef, useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { reviewLogService } from "../services/reviewLogService";
import { getApiErrorMessage } from "../utils/apiErrorMessage";
import defaultAvatar from "../assets/shared/default_user.webp";
import "./ReviewReplyThread.css";
import { Link2, X } from "lucide-react";
import ReplyMessage from "./ReplyMessage";
import { composeReply } from "../utils/replyContent";

export const REPLY_MAX_LENGTH = 4000;

export default function ReviewReplyThread({ log, onAccessLost }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [target, setTarget] = useState(null);
  const [draft, setDraft] = useState("");
  const [link, setLink] = useState("");
  const [linkVisible, setLinkVisible] = useState(false);
  const content = composeReply(draft, link);
  const isStudent = queryClient.getQueryData(["current_user"])?.role === "student";
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [denied, setDenied] = useState(false);
  const [confirmedReply, setConfirmedReply] = useState(null);
  const pending = useRef(false);
  const retry = useRef(null);
  const controller = useRef(null);
  const mounted = useRef(true);
  const textarea = useRef(null);
  const returnFocus = useRef(null);
  const regionId = useId();
  const key = ["review-replies", log.log_id];
  const replies = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam, signal }) => reviewLogService.getReplies(log.log_id, { page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: page => page.next ? page.current_page + 1 : undefined,
    enabled: expanded && !denied,
    retry: false,
    staleTime: 0,
  });
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);
  useEffect(() => { if (target) textarea.current?.focus(); }, [target]);
  useEffect(() => {
    if ([403, 404].includes(replies.error?.response?.status)) {
      onAccessLost?.();
    }
  }, [replies.error, onAccessLost]);

  if (denied || [403, 404].includes(replies.error?.response?.status)) {
    return <p role="alert" className="mt-3 text-sm text-red-700">This conversation is no longer accessible. Reload the submission.</p>;
  }
  const loaded = replies.isError ? [] : replies.data?.pages.flatMap(page => page.results) ?? [];
  const rows = confirmedReply && !replies.isError && !loaded.some(reply => reply.reply_id === confirmedReply.reply_id)
    ? [...loaded, confirmedReply] : loaded;
  const count = replies.data?.pages[0]?.count ?? log.reply_count ?? 0;
  const canReply = log.can_reply === true;
  const startReply = (event, reply = null) => {
    returnFocus.current = event.currentTarget;
    setTarget({ id: reply?.reply_id ?? null, name: reply?.author_name || log.changed_by_name || "OSA Staff Member" });
    setSendError("");
  };
  const closeComposer = () => {
    setTarget(null);
    returnFocus.current?.focus();
  };
  const send = async event => {
    event.preventDefault();
    const message = content.message;
    if (pending.current || !content.canSend) return;
    pending.current = true;
    setSending(true);
    setSendError("");
    const signature = JSON.stringify([message, target.id]);
    if (retry.current?.signature !== signature) retry.current = { signature, id: crypto.randomUUID() };
    controller.current = new AbortController();
    try {
      const saved = await reviewLogService.createReply(log.log_id, {
        message, parent_reply: target.id, client_request_id: retry.current.id,
      }, { signal: controller.current.signal });
      // Confirm persistence through a fresh read before showing the successful conversation.
      const fresh = await reviewLogService.getReplies(log.log_id, { signal: controller.current.signal });
      if (!mounted.current) return;
      queryClient.setQueryData(key, { pages: [fresh], pageParams: [1] });
      setConfirmedReply(saved);
      setExpanded(true);
      setDraft("");
      setLink("");
      setLinkVisible(false);
      retry.current = null;
      closeComposer();
    } catch (error) {
      if (!mounted.current) return;
      if ([403, 404].includes(error.response?.status)) {
        setDenied(true);
        queryClient.removeQueries({ queryKey: key });
        onAccessLost?.();
      } else setSendError(getApiErrorMessage(error, "Your reply could not be confirmed. Your draft is saved here; retry to confirm it."));
    } finally {
      pending.current = false;
      if (mounted.current) setSending(false);
    }
  };
  return (
    <div className="review-reply-thread font-inter">
      <div className="flex flex-wrap gap-4">
        {canReply && <button type="button" className="font-semibold text-[#1f5cae] underline" onClick={startReply}>Reply</button>}
        {(count > 0 || expanded) && <button type="button" className="font-semibold text-[#1f5cae]" aria-expanded={expanded} aria-controls={regionId} onClick={() => setExpanded(value => !value)}>
          {expanded ? "Hide replies" : `View ${count} ${count === 1 ? "reply" : "replies"}`}
        </button>}
      </div>
      {expanded && <div id={regionId} className="reply-conversation border-l-2 border-blue-100">
        {replies.isPending && <p role="status">Loading replies…</p>}
        {replies.isError && <p role="alert">{getApiErrorMessage(replies.error)} <button type="button" onClick={() => replies.refetch()} className="underline">Try again</button></p>}
        <ol className="reply-list">
          {rows.map(reply => <li key={reply.reply_id} className="min-w-0 rounded-lg border border-[#dbe4f0] bg-[#f7f9fc] p-3">
            <div className="flex items-center gap-2">
              <img src={reply.author_image_url || defaultAvatar} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = defaultAvatar; }} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0"><p className="break-words font-semibold">{reply.author_name} <span className="font-normal capitalize text-gray-500">({reply.author_role || "Former user"})</span></p>
                <time dateTime={reply.created_at} className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString()}</time>
              </div>
            </div>
            <p className="reply-context break-words text-xs text-gray-500">Replying to {reply.reply_to_name}</p>
            <p className="reply-message whitespace-pre-wrap break-words [overflow-wrap:anywhere]"><ReplyMessage message={reply.message} /></p>
            {canReply && <button type="button" className="mt-2 font-semibold text-[#1f5cae] underline" onClick={event => startReply(event, reply)}>Reply to {reply.author_name}</button>}
          </li>)}
        </ol>
        {replies.hasNextPage && <button type="button" disabled={replies.isFetchingNextPage} onClick={() => replies.fetchNextPage()} className="mt-3 font-semibold text-[#1f5cae] disabled:opacity-50">{replies.isFetchingNextPage ? "Loading…" : "Load more replies"}</button>}
      </div>}
      {canReply && target && <form onSubmit={send} className="reply-compose rounded-lg border border-blue-200 bg-blue-50">
        <label htmlFor={`${regionId}-message`} className="mb-2 block font-semibold">Replying to {target.name}</label>
        <textarea id={`${regionId}-message`} ref={textarea} rows={3} value={draft} onChange={event => setDraft(event.target.value)} disabled={sending} aria-describedby={`${regionId}-limit`} className="w-full resize-y rounded-lg border border-gray-300 bg-white p-2 outline-blue-600" />
        <p id={`${regionId}-limit`} className="text-xs text-gray-500">{content.length} / {REPLY_MAX_LENGTH} characters. Enter adds a new line.</p>
        {linkVisible && <div className="mt-2 flex min-w-0 items-center gap-2">
          <label htmlFor={`${regionId}-link`} className="sr-only">Optional reply link</label>
          <input id={`${regionId}-link`} type="url" inputMode="url" value={link} onChange={event => setLink(event.target.value)} placeholder="https://example.com" disabled={sending} aria-invalid={Boolean(link.trim() && content.error)} className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-blue-600" />
          <button type="button" disabled={sending} aria-label="Remove link" onClick={() => { setLink(""); setLinkVisible(false); }} className="shrink-0 rounded-md p-2 text-gray-500"><X size={16} /></button>
        </div>}
        {content.error && <p role="alert" className="reply-error text-red-700">{content.error}</p>}
        {sendError && <p role="alert" className="reply-error text-red-700">{sendError}</p>}
        <div className="reply-actions flex flex-wrap gap-3">
          {isStudent && <button type="button" disabled={sending} aria-label="Add link" aria-expanded={linkVisible} aria-controls={linkVisible ? `${regionId}-link` : undefined} onClick={() => setLinkVisible(true)} title="Add link" className="inline-flex items-center rounded-lg text-[#1f5cae]"><Link2 size={16} /></button>}
          <button type="submit" disabled={sending || !content.canSend} className="rounded-lg bg-[#ffc700] px-4 py-2 font-bold disabled:opacity-50">{sending ? "Sending…" : "Send reply"}</button>
          <button type="button" disabled={sending} onClick={closeComposer} className="rounded-lg px-3 py-2 font-semibold">Cancel</button>
        </div>
      </form>}
    </div>
  );
}
