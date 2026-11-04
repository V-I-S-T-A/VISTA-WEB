import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/toastContext';
import { useCurrentUser } from './useAuth';
import { API_CONFIG } from '../config/api';
import { getAccessToken, refreshAccessToken } from '../lib/axios';
import { createRealtimeClient, tokenClaims, websocketUrl } from '../services/realtimeService';
import { REALTIME_UPDATE, refreshRealtimeQueries, createRealtimeQueryRefresher } from '../services/realtimeQueries';
import { accessScope } from '../utils/accessScope';
import { notificationService } from '../services/notificationService';
import { createNotificationToasts } from '../services/notificationToasts';

export default function useVistaRealtime() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);
  const { showToast, clearToasts } = useToast();
  const { data: user } = useCurrentUser();
  const scope = accessScope(user);
  const userId = user?.user_id;
  useEffect(() => {
    if (!userId || !localStorage.getItem('access_token')) return;
    const isCurrent = () => String(tokenClaims(localStorage.getItem('access_token') || '').user_id) === String(userId);
    const toastScope = `notifications:${userId}`;
    const personalToasts = user.role === 'student' ? createNotificationToasts({
      isCurrent,
      isVisible: () => !document.hidden,
      loadNotifications: ({ fresh = false } = {}) => queryClient.fetchQuery({
        queryKey: ['notifications', userId], queryFn: notificationService.getNotifications, staleTime: fresh ? 0 : 1000,
      }),
      show: item => showToast(item.message || 'A new submission update is available.', 'success', item.type === 'review_reply_created' ? 8000 : 5000, {
        scope: toastScope,
        variant: item.type === 'review_reply_created' ? 'reply' : 'default',
        actorName: item.actor_name,
        actorImageUrl: item.actor_image_url,
        submissionTitle: item.submission_title,
        onClick: async () => {
          if (!isCurrent()) return;
          try { await notificationService.markAsRead(item.notification_id); } catch { /* Keep detail navigation available. */ }
          if (!isCurrent()) return;
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
          clearToasts(toastScope);
          navigateRef.current(`/student/review-tracker/${item.submission_id}`);
        },
      }),
    }) : null;
    const refresh = events => refreshRealtimeQueries(queryClient, events, detail => {
      window.dispatchEvent(new CustomEvent(REALTIME_UPDATE, { detail }));
    });
    const trackerRefresh = personalToasts ? createRealtimeQueryRefresher(refresh, isCurrent) : null;
    const client = createRealtimeClient({
      url: websocketUrl(API_CONFIG.BASE_URL, window.location.href), userId,
      getToken: getAccessToken, refreshToken: refreshAccessToken, isCurrent,
      onStatus: status => window.dispatchEvent(new CustomEvent('vista:realtime-status', { detail: { status } })),
      onBatch: events => {
        if (!personalToasts) return refresh(events);
        // Tracker reads can be slow or retrying; they must not hold personal
        // alerts or the next socket batch behind an unrelated history request.
        trackerRefresh.enqueue(events);
        return personalToasts.receive(events);
      },
    });
    const sessionChanged = () => {
      if (!isCurrent()) {
        client.stop();
        personalToasts?.stop();
        trackerRefresh?.stop();
        clearToasts(toastScope);
      }
    };
    const visible = () => {
      if (!document.hidden) {
        void personalToasts?.reveal();
        client.recover();
      }
    };
    window.addEventListener('storage', sessionChanged);
    window.addEventListener('vista:session-changed', sessionChanged);
    window.addEventListener('online', visible);
    document.addEventListener('visibilitychange', visible);
    client.start();
    return () => {
      client.stop();
      personalToasts?.stop();
      trackerRefresh?.stop();
      clearToasts(toastScope);
      window.removeEventListener('storage', sessionChanged);
      window.removeEventListener('vista:session-changed', sessionChanged);
      window.removeEventListener('online', visible);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [queryClient, userId, user?.role, scope, showToast, clearToasts]);
  return null;
}
