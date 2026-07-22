import { createServerFn } from '@tanstack/react-start';
import { RtcRole, RtcTokenBuilder } from 'agora-token';

/* ------------------------------------------------------------
   Agora video — token generation.

   Agora requires a signed token before a browser can join a video
   channel. Generating it needs the App Certificate, which is a
   secret and must never reach the browser — so this always has to
   happen server-side, which is exactly what this function is for.

   Needs two environment variables set in Vercel:
     AGORA_APP_ID          (not secret, but keep server-side for now)
     AGORA_APP_CERTIFICATE (secret — never expose this to the client)

   Get both from the Agora Console (agora.io) after creating a project.
------------------------------------------------------------ */

export const getAgoraToken = createServerFn({ method: 'POST' })
  .validator((input: { channelName: string; uid: number; role: 'host' | 'audience' }) => input)
  .handler(async ({ data }) => {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      throw new Error(
        'AGORA_APP_ID / AGORA_APP_CERTIFICATE are not set. Create a project at agora.io, then add both in Vercel -> Settings -> Environment Variables.',
      );
    }

    const expireSeconds = 3600; // token valid for 1 hour; rejoin fetches a fresh one
    const role = data.role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      data.channelName,
      data.uid,
      role,
      expireSeconds,
      expireSeconds,
    );

    return { appId, token, channelName: data.channelName, uid: data.uid };
  });
