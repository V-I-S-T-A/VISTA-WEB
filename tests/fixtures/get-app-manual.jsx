// Actual public route with isolated storage and no real API or Google requests.
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../../src/App';
import GetAppSkeleton from '../../src/components/loading/GetAppSkeleton';
import { ToastProvider } from '../../src/components/ToastProvider';
import apiClient from '../../src/lib/axios';
import '../../src/index.css';
import '../../src/responsive.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

localStorage.clear();
window.getAppManualFixture = { writes: [] };
apiClient.defaults.adapter = async config => {
  if (config.method !== 'get') {
    window.getAppManualFixture.writes.push(config.url);
    throw new Error('Writes prohibited in the public guide fixture');
  }
  return { config, status: 200, headers: {}, data: { results: [], count: 0 } };
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById('root')).render(new URLSearchParams(location.search).has('skeleton') ? <GetAppSkeleton /> : <QueryClientProvider client={client}><ToastProvider><BrowserRouter><App /></BrowserRouter></ToastProvider></QueryClientProvider>);
