import React, { useEffect, useRef, useState } from 'react';
import { getAgoraToken } from '@/lib/agora';

/* ------------------------------------------------------------
   Real Agora playback — joins a channel as a silent viewer and
   renders whatever the breeder is broadcasting.

   Same SSR caution as the broadcast side: the SDK only loads
   client-side, inside useEffect.

   NOT YET TESTABLE without real Agora credentials — see agora.ts.
------------------------------------------------------------ */

export function AgoraViewer({
  channelName,
  onViewerCount,
}: {
  channelName: string;
  onViewerCount?: (count: number) => void;
}) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'offline' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    onViewerCount?.(viewerCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerCount]);

  useEffect(() => {
    let client: any;
    let cancelled = false;

    (async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        const uid = Math.floor(Math.random() * 100000);
        const { appId, token } = await getAgoraToken({
          data: { channelName, uid, role: 'audience' },
        });

        client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
        client.setClientRole('audience');

        client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video' && videoRef.current) {
            user.videoTrack?.play(videoRef.current);
            if (!cancelled) setStatus('live');
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        client.on('user-unpublished', () => {
          if (!cancelled) setStatus('offline');
        });

        client.on('user-joined', () => setViewerCount((c) => c + 1));
        client.on('user-left', () => setViewerCount((c) => Math.max(0, c - 1)));

        await client.join(appId, channelName, token, uid);
        if (!cancelled) setStatus('offline'); // becomes 'live' once user-published fires
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(err instanceof Error ? err.message : 'Could not connect to the stream.');
        }
      }
    })();

    return () => {
      cancelled = true;
      client?.leave();
    };
  }, [channelName]);

  return (
    <div ref={videoRef} className="relative h-full w-full bg-black">
      {status !== 'live' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
          {status === 'connecting' && <p className="text-sm">Connecting to stream…</p>}
          {status === 'offline' && <p className="text-sm">Waiting for the breeder to start the camera…</p>}
          {status === 'error' && <p className="max-w-xs text-center text-sm text-destructive">{errorMsg}</p>}
        </div>
      )}
    </div>
  );
}
