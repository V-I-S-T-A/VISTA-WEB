import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/axios";

export default function ReviewReplyThread({ log, submissionId }) {
  const [draft, setDraft] = useState("");
  const [parentReply, setParentReply] = useState(null);
  const [clientRequestId, setClientRequestId] = useState(() => crypto.randomUUID());
  const queryClient = useQueryClient();
  const logId = log.log_id;
  const { data, isFetching, isError } = useQuery({
    queryKey: ["review-replies", logId],
    queryFn: async () => (await apiClient.get(`/review-logs/${logId}/replies/?page_size=100`)).data,
    enabled: Boolean(logId && log.remarks_text?.trim()),
    refetchInterval: 30_000, // Fallback if WebSocket is unavailable
  });
  const mutation = useMutation({
    mutationFn: async () => (await apiClient.post(`/review-logs/${logId}/replies/`, {
      message: draft.trim(), parent_reply: parentReply, client_request_id: clientRequestId,
    })).data,
    onSuccess: () => {
      setDraft("");
      setParentReply(null);
      setClientRequestId(crypto.randomUUID());
      queryClient.invalidateQueries({ queryKey: ["review-replies", logId] });
      queryClient.invalidateQueries({ queryKey: ["review-logs"] });
    },
  });

  useEffect(() => {
    if (submissionId) queryClient.invalidateQueries({ queryKey: ["review-replies", logId] });
  }, [submissionId, log.reply_count, logId, queryClient]);

  if (!log.remarks_text?.trim()) return null;
  const replies = data?.results ?? (Array.isArray(data) ? data : []);
  return <div className="mt-3 space-y-3 border-l-2 border-blue-100 pl-4">
    <h6 className="text-xs font-semibold text-slate-600">Replies ({replies.length})</h6>
    {isError && <p role="alert" className="text-xs text-red-700">Could not load replies. Try refreshing.</p>}
    {replies.map(reply => <div key={reply.reply_id} className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        {reply.author_image_url && <img src={reply.author_image_url} alt="" className="h-7 w-7 rounded-full object-cover" />}
        <strong className="text-xs text-slate-800">{reply.author_name}</strong>
        <span className="text-xs text-slate-500">{new Date(reply.created_at).toLocaleString()}</span>
      </div>
      {reply.parent_reply && <p className="mt-1 text-xs text-slate-500">Replying to {reply.reply_to_name}</p>}
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{reply.message}</p>
      {log.can_reply && <button type="button" className="mt-2 text-xs font-medium text-blue-700" onClick={() => setParentReply(reply.reply_id)}>Reply</button>}
    </div>)}
    {isFetching && !data && <p className="text-xs text-slate-500">Loading replies…</p>}
    {log.can_reply && <form onSubmit={event => { event.preventDefault(); if (draft.trim()) mutation.mutate(); }} className="space-y-2">
      {parentReply && <button type="button" onClick={() => setParentReply(null)} className="text-xs text-blue-700">Replying to a message ×</button>}
      <textarea aria-label="Write a reply" value={draft} maxLength={4000}
        onChange={event => { setDraft(event.target.value); if (mutation.isError) mutation.reset(); }}
        className="w-full rounded-lg border border-slate-300 p-2 text-sm" rows={2} placeholder="Write a reply…" />
      {mutation.isError && <p role="alert" className="text-xs text-red-700">Reply could not be sent. Retry without changing the message.</p>}
      <button type="submit" disabled={!draft.trim() || mutation.isPending}
        className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
        {mutation.isPending ? "Sending…" : "Send reply"}
      </button>
    </form>}
  </div>;
}
