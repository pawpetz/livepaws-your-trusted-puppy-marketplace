import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { 
  Video, 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  Send, 
  Heart, 
  Share2, 
  Info, 
  Lock,
  Sparkles,
  Camera,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Route = createFileRoute('/live/$streamId')({
  component: LiveStreamPage,
});

function LiveStreamPage() {
  const [activeCamera, setActiveCamera] = useState('cam-1');
  const [chatMessage, setChatMessage] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [selectedPuppy, setSelectedPuppy] = useState('Puppy #2 (Male - Golden)');

  const [messages, setMessages] = useState([
    { id: 1, user: 'Sarah M.', text: 'Are these Golden Retriever pups 6 weeks old now?', time: '12:04 PM', isBreeder: false },
    { id: 2, user: 'Oakwood Kennels (Breeder)', text: 'Hi Sarah! Yes, they turned 6 weeks old this past Tuesday!', time: '12:05 PM', isBreeder: true },
    { id: 3, user: 'David K.', text: 'They look so active today! ❤️', time: '12:06 PM', isBreeder: false },
  ]);

  const cameras = [
    { id: 'cam-1', name: 'Cam 1: Play Area', status: 'LIVE' },
    { id: 'cam-2', name: 'Cam 2: Sleeping Nook', status: 'LIVE' },
    { id: 'cam-3', name: 'Cam 3: Feeding Station', status: 'IDLE' },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now(), user: 'You', text: chatMessage, time: 'Just now', isBreeder: false }
    ]);
    setChatMessage('');
  };

  const handleCompletePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('success');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-4 pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stream Header Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span> LIVE NOW
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> AKC Verified Breeder
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Golden Retriever Litter — Sunday Morning Playtime
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Hosted by <span className="text-indigo-400 font-semibold">Oakwood Premium Kennels</span> • Canton, OH
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-rose-500 transition-colors">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* Main Grid: Video Player + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Video Viewport */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80" 
                alt="Live Puppy Nursery Feed" 
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10">
                <Users size={14} className="text-indigo-400" />
                <span>428 watching</span>
              </div>

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-gray-300">
                1080p 60fps HD
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-gray-200">
                    {cameras.find(c => c.id === activeCamera)?.name}
                  </span>
                </div>
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck size={14} /> Live Stream Audio Active
                </div>
              </div>
            </div>

            {/* Camera Switcher Bar */}
            <div className="grid grid-cols-3 gap-3">
              {cameras.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setActiveCamera(cam.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    activeCamera === cam.id 
                      ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Video size={16} className={activeCamera === cam.id ? 'text-indigo-400' : 'text-gray-500'} />
                    <span className="text-xs font-semibold block truncate">{cam.name}</span>
                  </div>
                  {cam.status === 'LIVE' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Breeder & Escrow Trust Box */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400">
                    OK
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Oakwood Kennels</h3>
                    <p className="text-xs text-gray-400">Verified Kennel License #OH-89203 • 5.0 ★ (42 reviews)</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-xl text-gray-200 transition-colors">
                  View Breeder Profile
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" />
                  <span>Funds held in Escrow until pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Includes 1-Year Health Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-indigo-400" />
                  <span>Vet inspection records attached</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Chat & Escrow Purchase Card */}
          <div className="space-y-6 flex flex-col h-full">
            
            {/* Direct Purchase & Escrow Card */}
            <div className="bg-gradient-to-br from-indigo-900/40 via-violet-900/20 to-gray-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Available Puppies</span>
                  <h4 className="text-xl font-extrabold text-white mt-0.5">3 Pups Remaining</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Full Price</span>
                  <p className="text-xl font-bold text-emerald-400">$1,800</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 mb-4">
                Reserve with a deposit or complete your purchase securely. All payments are protected by LivePaws Escrow.
              </p>

              <div className="space-y-2">
                <button 
                  onClick={() => { setCheckoutStep('form'); setIsCheckoutOpen(true); }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Lock size={18} /> Buy Now / Reserve with Escrow
                </button>
              </div>
            </div>

            {/* Live Stream Chat Panel */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 flex flex-col h-[480px]">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">Live Nursery Chat</h3>
                </div>
                <span className="text-xs text-gray-500">Moderated by LivePaws</span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-xl ${
                      msg.isBreeder 
                        ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-100' 
                        : 'bg-gray-800/60 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${msg.isBreeder ? 'text-indigo-400' : 'text-gray-300'}`}>
                        {msg.user}
                      </span>
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 flex gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask the breeder a question..." 
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit"
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>

      {/* COMPLETE PURCHASE / ESCROW MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={20} />
                <h3 className="font-bold text-white">LivePaws Escrow Checkout</h3>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {checkoutStep === 'form' ? (
              <form onSubmit={handleCompletePurchase} className="p-6 space-y-5 text-xs text-gray-300">
                
                {/* Select Puppy */}
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1.5">Select Puppy from Litter</label>
                  <select 
                    value={selectedPuppy}
                    onChange={(e) => setSelectedPuppy(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option>Puppy #1 (Female - Light Cream) - Available</option>
                    <option>Puppy #2 (Male - Golden) - Available</option>
                    <option>Puppy #4 (Female - Dark Golden) - Available</option>
                  </select>
                </div>

                {/* Select Payment Option */}
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1.5">Payment Option</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentType('deposit')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentType === 'deposit' 
                          ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                          : 'bg-gray-950 border-gray-800 text-gray-400'
                      }`}
                    >
                      <div className="font-bold text-emerald-400">$250 Deposit</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Hold puppy & pay rest at pickup</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType('full')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentType === 'full' 
                          ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                          : 'bg-gray-950 border-gray-800 text-gray-400'
                      }`}
                    >
                      <div className="font-bold text-emerald-400">$1,800 Full Payment</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Complete purchase into Escrow</div>
                    </button>
                  </div>
                </div>

                {/* Card Payment Details */}
                <div className="space-y-3 pt-2 border-t border-gray-800">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Jane Doe" 
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">Card Information</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required 
                        placeholder="4242 •••• •••• 4242" 
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 pr-10 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <CreditCard size={18} className="absolute right-3 top-2.5 text-gray-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">MM / YY</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="12/28" 
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">CVC</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="123" 
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Escrow Guarantee Notice */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex gap-2.5 items-start text-emerald-300">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>100% Escrow Protection:</strong> Funds are locked safely. Payment is released to Oakwood Kennels only after you inspect and confirm receipt of your puppy.
                  </p>
                </div>

                {/* Submit CTA */}
                <button 
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Lock size={16} /> Pay {paymentType === 'deposit' ? '$250.00' : '$1,800.00'} into Escrow
                </button>
              </form>
            ) : (
              /* ORDER CONFIRMATION SCREEN */
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={36} />
                </div>

                <h3 className="text-xl font-bold text-white">Escrow Payment Confirmed!</h3>
                <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                  Your payment of <strong className="text-emerald-400">{paymentType === 'deposit' ? '$250.00' : '$1,800.00'}</strong> for <strong className="text-white">{selectedPuppy}</strong> is securely locked in LivePaws Escrow.
                </p>

                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Escrow Txn ID:</span>
                    <span className="font-mono text-indigo-400">#LP-982031</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Breeder:</span>
                    <span className="text-white">Oakwood Kennels</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-semibold">Funds Held in Escrow</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500">
                  A receipt and breeder contact instructions have been sent to your email.
                </p>

                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Return to Live Stream
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default LiveStreamPage;
