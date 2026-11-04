import test from 'node:test';
import assert from 'node:assert/strict';
import { composeReply, replyUrl, replySegments } from '../src/utils/replyContent.js';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

test('message-only, link-only and combined replies reuse one nonblank message',()=>{
  for(const [text,link,message] of [[' Text ','','Text'],['  ',' https://example.test/?x=1 ','https://example.test/?x=1'],['Text','https://example.test/a','Text\nhttps://example.test/a']]){
    const result=composeReply(text,link);assert.equal(result.message,message);assert.equal(result.canSend,true);
  }
  assert.equal(composeReply('  ',' ').canSend,false);
});
test('invalid or unsafe optional URLs cannot silently send and valid text remains editable',()=>{
  for(const link of ['javascript:alert(1)','data:text/html,test','file:///private','ftp://example.test/a','https://','https://a.test/a b','https://user:pass@a.test','https://a.test/\npath']){
    assert.equal(replyUrl(link),null);assert.equal(composeReply('Keep this draft',link).canSend,false);
  }
  assert.equal(composeReply('Keep this draft','').canSend,true);
});
test('the existing 4000-codepoint limit counts both message, separator and URL',()=>{
  assert.equal(composeReply('😀'.repeat(4000)).canSend,true);
  assert.equal(composeReply('😀'.repeat(4001)).canSend,false);
  assert.equal(composeReply('x'.repeat(3990),'https://a.test').canSend,false);
});
test('safe link segments preserve message whitespace, literal HTML and exact standalone URL paths',()=>{
  const raw='Normal <script>alert(1)</script>\nhttps://example.test/a?x=1&y=2';
  const parts=replySegments(raw);assert.equal(parts.map(part=>part.text).join(''),raw);
  assert.deepEqual(parts.filter(part=>part.href),[{text:'https://example.test/a?x=1&y=2',href:'https://example.test/a?x=1&y=2'}]);
  assert.equal(replySegments('javascript:alert(1)').filter(part=>part.href).length,0);
  assert.equal(replySegments('https://example.test/a.')[0].href,'https://example.test/a.');
  assert.equal(replySegments('Visit https://example.test/a. Thanks.').find(part=>part.href).href,'https://example.test/a');
});

test('conversation renderer emits safe new-tab anchors while escaping ordinary message text',async()=>{
  const server=await createServer({configFile:false,plugins:[react()],cacheDir:'node_modules/.vite-tests/reply-link-render',server:{middlewareMode:true,hmr:false},optimizeDeps:{noDiscovery:true,entries:[],include:[]},logLevel:'error'});
  try {
    const {default:Message}=await server.ssrLoadModule('/src/components/ReplyMessage.jsx');
    const markup=renderToStaticMarkup(createElement(Message,{message:'<script>alert(1)</script>\nhttps://example.test/?x=1&y=2'}));
    assert.match(markup,/&lt;script&gt;/);assert.doesNotMatch(markup,/<script>/);
    assert.match(markup,/href="https:\/\/example.test\/\?x=1&amp;y=2"/);
    assert.match(markup,/target="_blank"/);assert.match(markup,/rel="noopener noreferrer"/);
  } finally {await server.close();}
});
