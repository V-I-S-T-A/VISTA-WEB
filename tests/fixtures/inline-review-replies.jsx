// Fictional local persistence and delivery only. Never contacts a real API.
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReviewReplyThread from '../../src/modules/shared/ReviewReplyThread';
import { reviewLogService } from '../../src/services/reviewLogService';
import '../../src/index.css';
import '../../src/workspace.css';

const role = new URLSearchParams(location.search).get('role') || 'student';
const storageKey = `vista-inline-reply-fixture-${role}`;
const initial = [
  { reply_id: 'first', author_name: 'Sample Student', message: 'Please clarify the activity date.' },
  { reply_id: 'second', author_name: 'Sample Staff', message: 'Use the date on the request form.', parent_reply: 'first', reply_to_name: 'Sample Student' },
  { reply_id: 'third', author_name: 'Another Student', message: 'Thank you. I will update the form.', parent_reply: 'second', reply_to_name: 'Sample Staff' },
  { reply_id: 'fourth', author_name: 'Sample Staff', message: 'The attachment has been received.' },
].map(reply => ({ ...reply, created_at: '2026-11-20T08:00:00Z' }));
let rows = JSON.parse(localStorage.getItem(storageKey) || 'null') || initial;
const fixture = { posts: [], reads: 0, loseNextResponse: false, get saved() { return rows; } };
window.inlineReplyFixture = fixture;
reviewLogService.getReplies = async () => {
  fixture.reads += 1;
  return { results: [...rows], count: rows.length, current_page: 1, total_pages: 1, next: null };
};
reviewLogService.createReply = async (_log, payload) => {
  fixture.posts.push(payload);
  await new Promise(resolve => setTimeout(resolve, 250));
  const existing = rows.find(reply => reply.client_request_id === payload.client_request_id);
  if (existing) return existing;
  const saved = { ...payload, reply_id: crypto.randomUUID(), author_name: 'Fixture Participant', reply_to_name: rows.find(reply => reply.reply_id === payload.parent_reply)?.author_name, created_at: new Date().toISOString() };
  rows = [...rows, saved];
  localStorage.setItem(storageKey, JSON.stringify(rows));
  if (fixture.loseNextResponse) { fixture.loseNextResponse = false; throw new Error('Simulated lost response after persistence'); }
  return saved;
};
const client = new QueryClient();
client.setQueryData(['current_user'], { user_id: `fixture-${role}`, role });
createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={client}>
    <main style={{ maxWidth: 760, margin: '24px auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Inline reply preview</h1>
      <section style={{ background: 'white', border: '1px solid #e1e8f0', borderRadius: 20, padding: 16, marginTop: 20 }}>
        <h2 style={{ fontWeight: 700 }}>Remarks &amp; feedback</h2>
        <p>Please verify the document details.</p>
        <ReviewReplyThread log={{ log_id: 'fixture', submission_id: 'fictional', reply_count: rows.length, can_reply: role !== 'viewer' }} canReply={role !== 'viewer'} />
      </section>
    </main>
  </QueryClientProvider>
);
