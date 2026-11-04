import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Reply, Send, X } from "lucide-react";
import defaultAvatar from "../assets/shared/default_user.webp";
import { reviewLogService } from "../services/reviewLogService";
import { getApiErrorMessage } from "../utils/apiErrorMessage";
import { useCurrentUser } from "../hooks/useAuth";

const PAGE_SIZE = 20;
const MAX_LENGTH = 4000;

export default function ReviewReplies({ log, canReply = log.can_reply }) {
  const [expanded, setExpanded] = useState(false);
  const [parent, setParent] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState("");
  const [olderError, setOlderError] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const queryKey = ["review-replies", currentUser?.user_id, log.log_id || log.review_log_id];
  const { data, isLoading, isError, error: loadError, refetch } = useQuery({
    queryKey,
    queryFn: () => reviewLogService.getReplies(log.log_id || log.review_log_id, { page: 1, pageSize: PAGE_SIZE }),
    enabled: expanded,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const submit = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || Array.from(message).length > MAX_LENGTH || !canReply || isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await reviewLogService.createReply(log.log_id || log.review_log_id, {
        message,
        parent_reply: parent?.reply_id || null,
        client_request_id: requestId,
      });
      setDraft("");
      setParent(null);
      setIsComposing(false);
      setRequestId(crypto.randomUUID());
      setExpanded(true);
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: ["review-logs"] });
      window.dispatchEvent(new CustomEvent("vista:review-logs-updated", { detail: { submissionId: log.submission_id } }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Your reply could not be sent. Your draft is saved; try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const replies = data?.results || [];
  const canLoadMore = Boolean(data?.next);
  const draftLength = Array.from(draft).length;
  const loadMore = async () => {
    setIsLoadingMore(true);
    setOlderError("");
    try {
      const page = await reviewLogService.getReplies(log.log_id || log.review_log_id, { page: (data.current_page || 1) + 1, pageSize: PAGE_SIZE });
      queryClient.setQueryData(queryKey, previous => ({ ...page, results: [...(previous?.results || []), ...page.results] }));
    } catch (requestError) {
      setOlderError(getApiErrorMessage(requestError, "More replies could not be loaded."));
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-[#dbe4f0] bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#38516f]">
          <MessageCircle size={14} aria-hidden="true" />
          {log.reply_count || 0} {Number(log.reply_count) === 1 ? "reply" : "replies"}
        </span>
        <div className="flex gap-2">
          {canReply && <button type="button" onClick={() => { setParent(null); setError(""); setIsComposing(true); }} className="rounded-md px-2 py-1 text-xs font-semibold text-[#1f5cae] hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1f5cae]">Reply</button>}
          {Number(log.reply_count) > 0 && <button type="button" onClick={() => setExpanded(value => !value)} className="rounded-md px-2 py-1 text-xs font-semibold text-[#1f5cae] hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1f5cae]">{expanded ? "Hide replies" : "View replies"}</button>}
        </div>
      </div>

      {canReply && isComposing && (
        <form onSubmit={submit} className="mt-3 space-y-2">
          {parent && <p className="m-0 text-xs text-gray-600">Replying to {parent.author_name || "VISTA user"}<button type="button" className="ml-2 text-[#1f5cae] underline" onClick={() => setParent(null)}>Change</button></p>}
          <label className="sr-only" htmlFor={`reply-${log.log_id || log.review_log_id}`}>Write a reply</label>
          <textarea id={`reply-${log.log_id || log.review_log_id}`} value={draft} onChange={event => setDraft(event.target.value)} rows={3} placeholder="Write a reply…" className="w-full resize-y rounded-lg border border-gray-300 p-2.5 text-sm text-gray-800 focus:border-[#1f5cae] focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`text-xs ${draftLength > MAX_LENGTH ? "text-red-600" : "text-gray-500"}`}>{draftLength}/{MAX_LENGTH}</span>
            <div className="flex gap-2"><button type="button" onClick={() => { setParent(null); setDraft(""); setError(""); setRequestId(crypto.randomUUID()); setIsComposing(false); }} className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700"><X size={13} />Cancel</button><button type="submit" disabled={!draft.trim() || draftLength > MAX_LENGTH || isSubmitting} className="inline-flex items-center gap-1 rounded-md bg-[#1f5cae] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={13} />{isSubmitting ? "Sending…" : "Send"}</button></div>
          </div>
          {error && <p role="alert" className="m-0 text-sm text-red-700">{error}</p>}
        </form>
      )}

      {expanded && <div className="mt-3 space-y-3" aria-live="polite">
        {isLoading ? <p className="text-sm text-gray-500">Loading replies…</p> : isError ? <div><p role="alert" className="text-sm text-red-700">{getApiErrorMessage(loadError, "Replies could not be loaded.")}</p><button type="button" onClick={() => refetch()} className="text-sm font-semibold text-[#1f5cae] underline">Try again</button></div> : replies.map(reply => <article key={reply.reply_id} className="flex gap-2.5 rounded-lg bg-[#f7f9fc] p-2.5">
          <img src={reply.author_image_url || defaultAvatar} onError={event => { event.currentTarget.src = defaultAvatar; }} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-x-2"><strong className="text-xs text-[#142d55]">{reply.author_name || "VISTA user"}</strong><span className="text-[11px] text-gray-500">{reply.author_role || "Member"}</span><time className="ml-auto text-[11px] text-gray-500" dateTime={reply.created_at}>{new Date(reply.created_at).toLocaleString()}</time></div>{reply.reply_to_name && <p className="mb-1 mt-1 text-[11px] text-gray-500">Replying to {reply.reply_to_name}</p>}<p className="mb-0 mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">{reply.message}</p>{canReply && <button type="button" onClick={() => { setParent(reply); setExpanded(true); setIsComposing(true); }} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#1f5cae]"><Reply size={12} />Reply</button>}</div>
        </article>)}
        {olderError && <p role="alert" className="m-0 text-sm text-red-700">{olderError}</p>}
        {canLoadMore && <button type="button" disabled={isLoadingMore} onClick={loadMore} className="text-sm font-semibold text-[#1f5cae] underline disabled:opacity-50">{isLoadingMore ? "Loading…" : "Load more replies"}</button>}
      </div>}
    </div>
  );
}
