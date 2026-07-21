import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { 
  Video, 
  ShieldCheck, 
  DollarSign, 
  Plus, 
  Radio, 
  Settings, 
  CheckCircle, 
  Clock, 
  Copy,
  Camera,
  Layers,
  AlertCircle
} from 'lucide-react';

export const Route = createFileRoute('/breeder/dashboard')({
  component: BreederDashboardPage,
});

function BreederDashboardPage() {
  const [isLive, setIsLive] = useState(true);
  const [activeCamCount, setActiveCamCount] = useState<number>(2);
  const [streamTitle, setStreamTitle] = useState('Golden Retriever Litter — Sunday Playtime');

  const [cameras, setCameras] = useState([
    { id: 1, name: 'Cam 1: Main Nursery / Play Area', url: 'rtsp://live.oakwood.com/cam1', active: true },
    { id: 2, name: 'Cam 2: Sleeping Nook', url: 'rtsp://live.oakwood.com/cam2', active: true },
    { id: 3, name: 'Cam 3: Feeding Station', url: '', active: false },
  ]);

  const toggleCam = (id: number) => {
    setCameras(cameras.map(c => {
      if (c.id === id) {
        const nextState = !c.active;
        return { ...c, active: nextState };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-400">
              OK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Oakwood Kennels Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} /> Verified AKC
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">Manage nursery streams, live cameras, and buyer escrow reservations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsLive(!isLive)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                isLive 
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              <Radio size={16} className={isLive ? 'animate-pulse' : ''} />
              {isLive ? 'End Live Broadcast' : 'Go Live Now'}
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold">Active Escrow Balance</span>
              <DollarSign size={18} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">$2,550.00</p>
            <span className="text-[11px] text-emerald-400 mt-1 block">3 Deposits + 1 Full Purchase</span>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold">Live Stream Viewers</span>
              <Video size={18} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{isLive ? '428' : '0'}</p>
            <span className="text-[11px] text-indigo-400 mt-1 block">Peak 512 earlier today</span>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold">Active Cameras</span>
              <Camera size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">
              {cameras.filter(c => c.active).length} / 3
            </p>
            <span className="text-[11px] text-gray-400 mt-1 block">1 Camera minimum required</span>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-semibold">Available Puppies</span>
              <Layers size={18} className="text-violet-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">3 / 6</p>
            <span className="text-[11px] text-violet-400 mt-1 block">3 Reserved via Escrow</span>
          </div>
        </div>

        {/* Main Grid: Stream & Camera Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Camera Manager & Stream Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Broadcast Settings */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Radio className="text-indigo-400" size={20} /> Stream Control Panel
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Broadcast Title</label>
                  <input 
                    type="text" 
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">RTMP Stream Key / Mobile App Feed</span>
                    <span className="text-gray-500 font-mono">live_paws_key_89203_oakwood</span>
                  </div>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-1 text-[11px]">
                    <Copy size={14} /> Copy Key
                  </button>
                </div>
              </div>
            </div>

            {/* Nursery Camera Feeds Setup */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg text-white flex items-center gap-2">
                    <Camera className="text-indigo-400" size={20} /> Nursery Camera Angle Setup
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Toggle and configure your camera feeds for buyers</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {cameras.map((cam) => (
                  <div key={cam.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cam.active ? 'bg-emerald-500' : 'bg-gray-600'}`}></span>
                        <span className="font-bold text-xs text-white">{cam.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-500 block font-mono">
                        {cam.active ? (cam.url || 'Mobile App Feed Active') : 'Feed Offline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleCam(cam.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          cam.active 
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {cam.active ? 'Active' : 'Enable Camera'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Escrow Orders & Reservations */}
          <div className="space-y-6">
            
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <DollarSign className="text-emerald-400" size={20} /> Escrow Reservations
              </h2>

              <div className="space-y-3">
                {/* Reservation Item 1 */}
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-white block">Puppy #3 (Male - Dark Golden)</span>
                      <span className="text-gray-400 text-[11px]">Buyer: Marcus Vance</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      $1,800 Paid (Full)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-800/60">
                    <span>Pickup Date: Aug 12, 2026</span>
                    <span className="text-amber-400 flex items-center gap-1"><Clock size={12} /> Held in Escrow</span>
                  </div>
                </div>

                {/* Reservation Item 2 */}
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-white block">Puppy #1 (Female - Light Cream)</span>
                      <span className="text-gray-400 text-[11px]">Buyer: Sarah Miller</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold">
                      $250 Deposit Held
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-800/60">
                    <span>Pickup Date: Aug 15, 2026</span>
                    <span className="text-amber-400 flex items-center gap-1"><Clock size={12} /> Held in Escrow</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 text-[11px] text-indigo-300 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-indigo-400" />
                <p>Funds are automatically transferred to your bank account upon buyer pickup verification.</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default BreederDashboardPage;
