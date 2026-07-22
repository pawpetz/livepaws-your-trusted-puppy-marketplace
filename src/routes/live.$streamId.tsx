import { createFileRoute, Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Send,
  Heart,
  Share2,
  Info,
  Lock,
  Sparkles,
} from 'lucide-react';
import { AgoraViewer } from '@/components/agora-viewer';
import { getBreederBySlug } from '@/lib/auth-store';
import { listPets, type Pet } from '@/lib/pets-store';
import { listMessages, sendMessage, type ChatMessage } from '@/lib/chat-store';

export const Route = createFileRoute('/live/$streamId')({
  loader: async ({ params }) => {
    const breeder = await getBreederBySlug({ data: { slug: params.streamId } });
    if (!breeder) return { breeder: null, pets: [] as Pet[] };
    const allPets = await listPets();
    const pets = allPets.filter((p) => p.breederName === breeder.businessName && p.status === 'Available');
    return { breeder, pets };
  },
  component: LiveStreamPage,
});

function LiveStreamPage() {
  const { streamId } = Route.useParams();
  const { breeder, pets } = Route.useLoaderData();
  const [chatMessage, setChatMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerName, setViewerName] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Ask for a display name once per browser, remember it after that.
  useEffect(() => {
    const saved = localStorage.getItem('livepaws_viewer_name');
    if (saved) setViewerName(saved);
  }, []);

  // Poll for new messages every 3s — a real shared chat, without needing
  // a persistent websocket connection (which doesn't fit Vercel's
  // serverless functions well).
  useEffect(() => {
    if (!streamId) return;
    let cancelled = false;
    const poll = async () => {
      const msgs = await listMessages({ data: { channelSlug: streamId } });
      if (!cancelled) setMessages(msgs);
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [streamId]);

  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    localStorage.setItem('livepaws_viewer_name', nameInput.trim());
    setViewerName(nameInput.trim());
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !viewerName) return;
    const text = chatMessage;
    setChatMessage('');
    const msg = await sendMessage({ data: { channelSlug: streamId, userName: viewerName, text, isBreeder: false } });
    setMessages((prev) => [...prev, msg]);
  };

  const pinnedMessage = messages.find((m) => m.pinned);

  if (!breeder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-center text-white">
        <div>
          <h1 className="text-xl font-bold">This stream isn't available</h1>
          <p className="mt-2 text-sm text-gray-400">
            No verified breeder matches this link — they may not have gone live yet.
          </p>
          <Link to="/explore" className="mt-4 inline-block text-sm font-semibold text-indigo-400">
            Browse live streams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-950 pb-16 pt-4 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stream Header Info */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <span className="flex animate-pulse items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-wide text-white">
                <span className="h-2 w-2 rounded-full bg-white" /> LIVE NOW
              </span>
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <ShieldCheck size={14} /> Verified Breeder
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white md:text-3xl">{breeder.businessName}</h1>
            <p className="mt-1 text-sm text-gray-400">Live nursery cam · USDA #{breeder.usdaLicense}</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-gray-800 p-2.5 text-gray-300 transition-colors hover:bg-gray-700">
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`rounded-xl p-2.5 transition-colors ${liked ? 'bg-rose-500/20 text-rose-400' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Main Grid: Video Player + Sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Video Viewport */}
          <div className="space-y-4 lg:col-span-2">
            <div className="group relative aspect-video overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
              <AgoraViewer channelName={streamId} onViewerCount={setViewerCount} />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                <Users size={14} className="text-indigo-400" />
                <span>{viewerCount + 1} watching</span>
              </div>
            </div>

            {/* Breeder & Escrow Trust Box */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/20 text-xl font-bold text-indigo-400">
                    {breeder.businessName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{breeder.businessName}</h3>
                    <p className="text-xs text-gray-400">Verified · USDA license #{breeder.usdaLicense}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-800 pt-4 text-xs text-gray-300 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" />
                  <span>Funds held in escrow until you confirm receipt</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Health certificate included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-indigo-400" />
                  <span>Reviews visible after confirmed sales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Available pets + chat */}
          <div className="flex h-full flex-col space-y-6">
            {/* Real available pets from this breeder */}
            <div className="space-y-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 via-violet-900/20 to-gray-900 p-5 shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Available now</span>
                <h4 className="mt-0.5 text-xl font-extrabold text-white">
                  {pets.length} {pets.length === 1 ? 'pet' : 'pets'} available
                </h4>
              </div>

              {pets.length === 0 ? (
                <p className="text-xs text-gray-400">Nothing currently listed as available from this breeder.</p>
              ) : (
                <div className="space-y-2">
                  {pets.map((pet) => (
                    <Link
                      key={pet.id}
                      to="/checkout/$puppyId"
                      params={{ puppyId: pet.id }}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3 transition-colors hover:border-indigo-500/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{pet.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {pet.saleTerms === 'full' ? 'Full payment' : `Reserve for $${pet.deposit}`}
                        </p>
                      </div>
                      <span className="ml-2 flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                        <Lock size={12} /> ${pet.price.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Live Stream Chat Panel */}
            <div className="flex h-[420px] flex-1 flex-col rounded-2xl border border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-800 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Live Nursery Chat</h3>
                </div>
              </div>

              {pinnedMessage && (
                <div className="border-b border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-400">📌 Featured question</p>
                  <p className="text-xs text-amber-100">
                    <span className="font-semibold">{pinnedMessage.userName}:</span> {pinnedMessage.text}
                  </p>
                </div>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto p-4 font-sans text-xs">
                {messages.length === 0 && (
                  <p className="text-center text-gray-500">No messages yet — ask the breeder a question!</p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl p-3 ${msg.isBreeder ? 'border border-indigo-500/30 bg-indigo-950/60 text-indigo-100' : 'bg-gray-800/60 text-gray-200'}`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`font-bold ${msg.isBreeder ? 'text-indigo-400' : 'text-gray-300'}`}>
                        {msg.userName}
                        {msg.isBreeder && ' (Breeder)'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.flagged && (
                      <p className="mt-1 text-[10px] text-amber-400">For your protection, contact sharing is disabled.</p>
                    )}
                  </div>
                ))}
              </div>

              {viewerName ? (
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-800 p-3">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask the breeder a question..."
                    className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button type="submit" className="rounded-xl bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-500">
                    <Send size={16} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSetName} className="flex gap-2 border-t border-gray-800 p-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name to join the chat"
                    className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button type="submit" className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
