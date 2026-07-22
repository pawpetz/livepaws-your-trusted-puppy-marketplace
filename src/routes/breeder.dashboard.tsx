import React, { useEffect, useRef, useState } from 'react';
import { Radio, Video, VideoOff, Mic, MicOff, Circle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

   RECORDING: uses the browser's built-in MediaRecorder on the same
   camera/mic tracks being streamed — this saves a file to the
   breeder's own device when they stop, entirely client-side. This
   is different from "cloud recording" (a paid, server-side Agora
   feature that would keep a permanent copy on a server) — that's a
   bigger, separate integration if it's ever needed later.
------------------------------------------------------------ */

export function AgoraBroadcast({
  channelName,
  onLive,
  onOffline,
}: {
  channelName: string;
  onLive?: () => void;
  onOffline?: () => void;
}) {
  const [isLive, setIsLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [recordSession, setRecordSession] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const goLive = async () => {
    setConnecting(true);
    setError(null);
    setRecordingUrl(null);
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
      onLive?.();

      if (recordSession && typeof MediaRecorder !== 'undefined') {
        try {
          const stream = new MediaStream([camTrack.getMediaStreamTrack(), micTrack.getMediaStreamTrack()]);
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
          recordedChunksRef.current = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
          };
          recorder.start(1000);
          recorderRef.current = recorder;
        } catch {
          // Recording is a nice-to-have, not critical — if it fails to start,
          // the stream itself should still go live fine.
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the stream.');
    } finally {
      setConnecting(false);
    }
  };

  const stopLive = async () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorderRef.current!.onstop = () => resolve();
        recorderRef.current!.stop();
      });
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setRecordingUrl(URL.createObjectURL(blob));
      recorderRef.current = null;
    }

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
    onOffline?.();
  };

  useEffect(() => {
    return () => {
      // Best-effort cleanup if the breeder navigates away mid-stream
      localTracksRef.current.forEach((track) => {
        track.stop();
        track.close();
      });
      clientRef.current?.leave();
      if (isLive) onOffline?.();
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {isLive && recorderRef.current && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
            <Circle size={8} className="fill-red-500 text-red-500" /> Recording
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          {error}
        </p>
      )}

      {!isLive && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox checked={recordSession} onCheckedChange={(v) => setRecordSession(!!v)} />
          Save a recording of this session to my device when I end it
        </label>
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

      {recordingUrl && (
        <div className="flex items-center justify-between rounded-lg border border-trust/30 bg-trust/10 p-2.5 text-xs">
          <span className="text-trust">Your recording is ready.</span>
          <a
            href={recordingUrl}
            download={`livepaws-stream-${Date.now()}.webm`}
            className="flex items-center gap-1 font-semibold text-trust underline"
          >
            <Download size={13} /> Download
          </a>
        </div>
      )}
    </div>
  );
}
