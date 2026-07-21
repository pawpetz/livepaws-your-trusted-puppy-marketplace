import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Plus, 
  Radio, 
  Upload, 
  FileText, 
  Camera, 
  Clock, 
  Copy,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Dog,
  Lock
} from 'lucide-react';

export const Route = createFileRoute('/breeder/dashboard')({
  component: BreederDashboardPage,
});

function BreederDashboardPage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'documents' | 'stream' | 'escrow'>('listings');
  const [isLive, setIsLive] = useState(true);

  // Sample Puppy Listings State
  const [puppies, setPuppies] = useState([
    { id: '1', name: 'Puppy #1 (Light Cream)', sex: 'Female', collar: 'Pink Collar', price: 1800, deposit: 250, status: 'Available', microchip: '9851410029381' },
    { id: '2', name: 'Puppy #2 (Classic Golden)', sex: 'Male', collar: 'Blue Collar', price: 1800, deposit: 250, status: 'Available', microchip: '9851410029382' },
    { id: '3', name: 'Puppy #3 (Dark Golden)', sex: 'Male', collar: 'Green Collar', price: 1800, deposit: 250, status: 'Reserved (Escrow Paid)', microchip: '9851410029383' },
  ]);

  // Sample Documents State
  const [documents, setDocuments] = useState([
    { id: '1', title: 'AKC Breeder License Certificate', type: 'PDF Document', status: 'Verified', date: '2026-01-15' },
    { id: '2', title: 'Litter Vet Inspection & Health Check', type: 'PDF Document', status: 'Verified', date: '2026-06-20' },
    { id: '3', title: 'Parent Genetic Screening (Dam & Sire)', type: 'PDF Document', status: 'Verified', date: '2026-02-10' },
  ]);

  // New Puppy Form State
  const [newPuppy, setNewPuppy] = useState({ name: '', sex: 'Male', collar: '', price: '1800', microchip: '' });

  const handleAddPuppy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPuppy.name) return;
    setPuppies([
      ...puppies,
      {
        id: Date.now().toString(),
        name: newPuppy.name,
        sex: newPuppy.sex,
        collar: newPuppy.collar || 'Unassigned Collar',
        price: Number(newPuppy.price),
        deposit: 250,
        status: 'Available',
        microchip: newPuppy.microchip || 'Pending Tag'
      }
    ]);
    setNewPuppy({ name: '', sex: 'Male', collar: '', price: '1800', microchip: '' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-400">
              OK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Oakwood Kennels Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} /> Verified Breeder
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">Manage litter posts, health documents, cameras, and escrow sales</p>
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
              {isLive ? 'Nursery Stream Active' : 'Go Live Now'}
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex border-b border-gray-800 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'listings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Dog size={16} /> Puppy Listings & Litters ({puppies.length})
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={16} /> Vet & Health Vault ({documents.length})
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'stream'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Camera size={16} /> Nursery Stream & Cams
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'escrow'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign size={16} /> Escrow Ledger ($2,050.00)
          </button>
        </div>

        {/* TAB 1: PUPPY LISTINGS & POSTING FORM */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Post New Puppy Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Plus className="text-indigo-400" size={20} /> Post New Puppy
              </h2>
              <p className="text-xs text-gray-400">Add a new puppy to your active Golden Retriever litter.</p>

              <form onSubmit={handleAddPuppy} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Puppy Name / Identifier</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Puppy #4 (Dark Golden)" 
                    value={newPuppy.name}
                    onChange={(e) => setNewPuppy({ ...newPuppy, name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Sex</label>
                    <select 
                      value={newPuppy.sex}
                      onChange={(e) => setNewPuppy({ ...newPuppy, sex: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Collar ID Color</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Yellow Collar" 
                      value={newPuppy.collar}
                      onChange={(e) => setNewPuppy({ ...newPuppy, collar: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Price ($)</label>
                    <input 
                      type="number" 
                      required
                      value={newPuppy.price}
                      onChange={(e) => setNewPuppy({ ...newPuppy, price: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Microchip ID (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="98514..." 
                      value={newPuppy.microchip}
                      onChange={(e) => setNewPuppy({ ...newPuppy, microchip: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
                >
                  <Plus size={16} /> Add Puppy to Live Nursery
                </button>
              </form>
            </div>

            {/* Active Litter List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg text-white">Active Litter Listings ({puppies.length})</h2>

              <div className="space-y-3">
                {puppies.map((p) => (
                  <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status.includes('Reserved') 
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {p.sex} • {p.collar} • Microchip: <span className="font-mono text-gray-300">{p.microchip}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-extrabold text-white text-sm">${p.price}</div>
                        <div className="text-[10px] text-gray-500">${p.deposit} Escrow Deposit</div>
                      </div>
                      <button 
                        onClick={() => setPuppies(puppies.filter(item => item.id !== p.id))}
                        className="p-2 bg-gray-800 hover:bg-red-950 hover:text-red-400 rounded-xl transition-colors text-gray-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: VET & HEALTH DOCUMENTS VAULT */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upload Document Box */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Upload className="text-indigo-400" size={20} /> Upload Breeder Certificate
              </h2>
              <p className="text-xs text-gray-400">Upload state licenses, vet health check records, or health guarantees.</p>

              <div className="border-2 border-dashed border-gray-800 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-gray-950 cursor-pointer">
                <Upload size={28} className="mx-auto text-indigo-400 mb-2" />
                <p className="text-xs font-semibold text-white">Click or drag PDF files here</p>
                <p className="text-[10px] text-gray-500 mt-1">Supports PDF, JPG up to 10MB</p>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 text-[11px] text-indigo-300 flex items-start gap-2">
                <ShieldCheck size={16} className="shrink-0 mt-0.5 text-indigo-400" />
                <p>Verified records display an AKC/Vet Trust Badge on your live stream for buyers.</p>
              </div>
            </div>

            {/* Document Records List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg text-white">Verified Breeder Documents ({documents.length})</h2>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">{doc.title}</span>
                        <span className="text-[10px] text-gray-500">{doc.type} • Uploaded {doc.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: NURSERY STREAM & CAM SETUP */}
        {activeTab === 'stream' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Camera className="text-indigo-400" size={20} /> Nursery Camera Setup & Stream Keys
            </h2>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">RTMP Broadcast Key</span>
                <span className="text-gray-500 font-mono">rtmp://live.livepaws.health/app/oakwood_89203</span>
              </div>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center gap-1 text-[11px]">
                <Copy size={14} /> Copy RTMP Link
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl space-y-2">
                <span className="font-bold text-xs text-white">Cam 1: Play Area Feed</span>
                <input 
                  type="text" 
                  value="rtsp://live.oakwood.com/cam1" 
                  readOnly 
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-gray-400 font-mono" 
                />
              </div>

              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl space-y-2">
                <span className="font-bold text-xs text-white">Cam 2: Sleeping Nook Feed</span>
                <input 
                  type="text" 
                  value="rtsp://live.oakwood.com/cam2" 
                  readOnly 
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-gray-400 font-mono" 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ESCROW LEDGER */}
        {activeTab === 'escrow' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={20} /> Escrow Sales & Pending Payouts
            </h2>

            <div className="space-y-3">
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">Puppy #3 (Dark Golden)</span>
                  <span className="text-gray-400">Buyer: Marcus Vance • Escrow ID: #LP-982031</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 text-sm">$1,800.00 Paid</span>
                  <span className="text-[10px] text-amber-400 block flex items-center gap-1 justify-end">
                    <Clock size={12} /> Pending Pickup Release
                  </span>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">Puppy #1 (Light Cream)</span>
                  <span className="text-gray-400">Buyer: Sarah Miller • Escrow ID: #LP-982012</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-indigo-400 text-sm">$250.00 Deposit</span>
                  <span className="text-[10px] text-amber-400 block flex items-center gap-1 justify-end">
                    <Clock size={12} /> Held in Escrow
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default BreederDashboardPage;
