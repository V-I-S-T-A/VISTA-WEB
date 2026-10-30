import api from '../lib/axios';

export async function prepareAttachment(file, signal, client = api) {
  if (!file) return file;
  try {
    const body = new FormData();
    body.append('file', file);
    const { data } = await client.post('/submissions/prepare-attachment/', body, {
      signal,
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data?.base64 && /\.webp$/i.test(data?.name || '') && (!data.type || data.type === 'image/webp')) {
      const bytes = Uint8Array.from(atob(data.base64), (char) => char.charCodeAt(0));
      if (String.fromCharCode(...bytes.slice(0, 4)) !== 'RIFF' || String.fromCharCode(...bytes.slice(8, 12)) !== 'WEBP') return file;
      return new File([bytes], data.name, { type: data.type || 'image/webp' });
    }
    return file;
  } catch (err) {
    if (signal?.aborted || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
      throw err;
    }
    console.warn('Attachment preparation/conversion unavailable; using original file:', err);
    return file;
  }
}
