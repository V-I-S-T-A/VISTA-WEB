// Manual browser regression fixture. No backend is contacted; only synthetic data is stored.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReviewReplyThread from '../../src/components/ReviewReplyThread';
import { reviewLogService } from '../../src/services/reviewLogService';
import avatar from '../../src/assets/shared/default_user.webp';
import '../../src/index.css';

const storageKey = 'vista-isolated-reply-fixture';
const initial = Array.from({ length: 23 }, (_, index) => ({
  reply_id: `fixture-${index}`, author_name: index % 2 ? 'Original Student' : 'Actual Reviewer',
  author_role: index % 2 ? 'student' : 'staff', author_image_url: index % 2 ? '/fixture-missing-avatar.webp' : avatar,
  message: `Persisted reply ${index + 1}`, reply_to_name: 'Actual Reviewer', created_at: '2026-10-31T02:00:00Z',
}));
let saved = JSON.parse(localStorage.getItem(storageKey) || 'null') || initial;
let failNext = false;
let deny = false;
let requestCount = 0;
reviewLogService.getReplies = async (_id, { page = 1 } = {}) => {
  if (deny) throw { response: { status: 404 } };
  return { count: saved.length, current_page: page, next: saved.length > page * 20 ? 'next' : null, results: saved.slice((page - 1) * 20, page * 20) };
};
reviewLogService.createReply = async (_id, payload) => {
  requestCount += 1;
  await new Promise(resolve => setTimeout(resolve, 400));
  const found = saved.find(reply => reply.client_request_id === payload.client_request_id);
  if (found) return found;
  const reply = { ...payload, reply_id: crypto.randomUUID(), author_name: 'Original Student', author_role: 'student',
    author_image_url: avatar, reply_to_name: payload.parent_reply ? saved.find(item => item.reply_id === payload.parent_reply)?.author_name : 'Actual Reviewer', created_at: new Date().toISOString() };
  saved = [...saved, reply];
  localStorage.setItem(storageKey, JSON.stringify(saved));
  if (failNext) { failNext = false; throw { request: {}, isAxiosError: true }; }
  return reply;
};
const client = new QueryClient();
export default function Fixture() {
  const [viewer, setViewer] = useState(false);
  const [lost, setLost] = useState(false);
  const [notice, setNotice] = useState('');
  return <main style={{maxWidth:680, margin:'0 auto', padding:20}} className="font-inter text-[#142d55]">
    <h1 className="text-xl font-bold">Isolated reply QA</h1>
    <p style={{margin:'12px 0'}} className="text-sm">Synthetic data only. No backend requests. Reload retains the simulated server replies.</p>
    <div className="mb-4 flex flex-wrap gap-3 text-sm">
      <button className="rounded border p-2" onClick={() => { setViewer(value => !value); client.clear(); }}>Switch to {viewer ? 'participant' : 'view only'}</button>
      <button className="rounded border p-2" onClick={() => { failNext = true; setNotice('Next send simulates a lost response after persistence.'); }}>Fail next response</button>
      <button className="rounded border p-2" onClick={() => { deny = true; client.invalidateQueries(); }}>Lose access</button>
      <button className="rounded border p-2" onClick={() => setNotice(`${requestCount} create requests; ${saved.length} persisted replies`)}>Inspect requests</button>
    </div>
    <p role="status" className="mb-3">{notice}</p>
    {lost ? <p role="alert">Submission access was revoked. Private content removed.</p> : <section style={{padding:20,marginTop:16}} className="rounded-xl border border-gray-200 bg-white">
      <h2 className="font-bold">On Process <span className="rounded bg-[#ffc700] px-2 text-xs">Latest</span></h2>
      <p className="mt-3 font-semibold">Remarks &amp; feedback</p>
      <p>Please clarify the event date.</p>
      <ReviewReplyThread key={String(viewer)} log={{ log_id: 'fixture', changed_by_name: 'Actual Reviewer', can_reply: !viewer, reply_count: saved.length }} onAccessLost={() => setLost(true)} />
    </section>}
  </main>;
}
createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><Fixture /></QueryClientProvider>);
