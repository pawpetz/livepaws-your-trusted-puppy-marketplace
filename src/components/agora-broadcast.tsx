import React, { useEffect, useRef, useState } from 'react';
import { Radio, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAgoraToken } from '@/lib/agora';

/* ------------------------------------------------------------
   Real Agora broadcast — replaces the old fake "stream key" box.

   The Agora Web SDK touches browser-only APIs (camera, mic,
   WebRTC), so it's loaded dynamically inside useEffect/handlers,
   never at the top of the file — importing it during server-side
   rendering would crash the page.

   NOT YET TESTABLE: this needs a real AGORA_APP_ID /
   AGORA_APP_CERTIFICATE in Vercel before it can actually connect.
   Until then, clicking "Start Live Camera" will show a clear error
   instead of pretending to work.
------------------------------------------------------------ */

export function AgoraBroadcast({ channelName }: { channelName: string }) {
  const [isLive, setIsLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);

  const goLive = async () => {
    setConnecting(true);
    setError(null);
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const uid = Math.floor(Math.random() * 100000);
      const { appId, token } = await getAgoraToken({
        data: { channelName, uid, role: 'host' },
      });

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      client.setClientRole('host');
      await client.join(appId, channelName, token, uid);

      const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      await client.publish([micTrack, camTrack]);

      if (videoRef.current) {
        camTrack.play(videoRef.current);
      }

      clientRef.current = client;
      localTracksRef.current = [micTrack, camTrack];
      setIsLive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the stream.');
    } finally {
      setConnecting(false);
    }
  };

  const stopLive = async () => {
    localTracksRef.current.forEach((track) => {
      track.stop();
      track.close();
    });
    localTracksRef.current = [];
    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current = null;
    }
    setIsLive(false);
  };

  useEffect(() => {
    return () => {
      // Best-effort cleanup if the breeder navigates away mid-stream
      localTracksRef.current.forEach((track) => {
        track.stop();
        track.close();
      });
      clientRef.current?.leave();
    };
  }, []);

  const toggleMic = () => {
    const micTrack = localTracksRef.current[0];
    if (micTrack) {
      micTrack.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCam = () => {
    const camTrack = localTracksRef.current[1];
    if (camTrack) {
      camTrack.setEnabled(!camOn);
      setCamOn(!camOn);
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={videoRef}
        className="relative aspect-video overflow-hidden rounded-xl border border-border bg-secondary/40"
      >
        {!isLive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Video size={28} />
            <p className="text-xs">Camera preview appears here once you go live</p>
          </div>
        )}
        {isLive && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-xs font-bold text-live-foreground">
            <span className="live-pulse h-1.5 w-1.5 rounded-full bg-live-foreground" /> LIVE
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {isLive ? (
          <>
            <Button size="sm" variant="outline" onClick={toggleMic}>
              {micOn ? <Mic size={14} /> : <MicOff size={14} />}
            </Button>
            <Button size="sm" variant="outline" onClick={toggleCam}>
              {camOn ? <Video size={14} /> : <VideoOff size={14} />}
            </Button>
            <Button size="sm" variant="destructive" onClick={stopLive}>
              End live stream
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={goLive} disabled={connecting}>
            <Radio size={14} /> {connecting ? 'Connecting…' : 'Start Live Camera'}
          </Button>
        )}
      </div>
    </div>
  );
}
