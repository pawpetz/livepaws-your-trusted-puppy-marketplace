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
  Cat,
  Dog
} from 'lucide-react';

export const Route = createFileRoute('/breeder/dashboard')({
  component: BreederDashboardPage,
});

function BreederDashboardPage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'documents' | 'stream' | 'escrow'>('listings');
  const [isLive, setIsLive] = useState(true);

  // Pet Listings (Dogs & Cats)
  const [pets, setPets] = useState([
    { id: '1', species: 'Dog', name: 'Puppy #1 (Light Cream)', sex: 'Female', collar: 'Pink Collar', price: 1800, deposit: 250, status: 'Available', microchip: '9851410029381' },
    { id: '2', species: 'Cat', name: 'Kitten #1 (Blue Point Ragdoll)', sex: 'Male', collar: 'Blue Collar', price: 1500, deposit: 200, status: 'Available', microchip: '9851410029399' },
    { id: '3', species: 'Dog', name: 'Puppy #3 (Dark Golden)', sex: 'Male', collar: 'Green Collar', price: 1800, deposit: 250, status: 'Reserved (Escrow Paid)', microchip: '9851410029383' },
  ]);

  // Document Vault
  const [documents] = useState([
    { id: '1', title: 'State Breeder License / Registration', type: 'PDF Document', status: 'Verified', date: '2026-01-15' },
    { id: '2', title: 'Vet Inspection & Health Certificates', type: 'PDF Document', status: 'Verified', date: '2026-06-20' },
  ]);

  // Form State
  const [newPet, setNewPet] = useState({ species: 'Dog', name: '', sex: 'Female', collar: '', price: '1500', microchip: '' });

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name) return;
    setPets([
      ...pets,
      {
        id: Date.now().toString(),
        species: newPet.species,
        name: newPet.name,
        sex: newPet.sex,
        collar: newPet.collar || 'No ID Tag',
        price: Number(newPet.price),
        deposit: 250,
        status: 'Available',
        microchip: newPet.microchip || 'Pending Microchip'
      }
    ]);
    setNewPet({ species: 'Dog', name: '', sex: 'Female', collar: '', price: '1500', microchip: '' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-400">
              LP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Oakwood Paws & Cattery Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} /> Verified Breeder
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">Manage litters (puppies & kittens), vet docs, stream feed, and escrow payouts</p>
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
              {isLive ? 'Nursery Camera Live' : 'Start Live Camera'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'listings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Dog size={16} /> Pet Listings ({pets.length})
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={16} /> Health & Vet Vault ({documents.length})
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'stream'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Camera size={16} /> Live Stream Feed
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'escrow'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign size={16} /> Escrow Sales ($2,050.00)
          </button>
        </div>

        {/* TAB 1: PET LISTINGS */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Simple Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Plus className="text-indigo-400" size={20} /> Add Puppy or Kitten
              </h2>

              <form onSubmit={handleAddPet} className="space-y-3 pt-1 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Pet Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPet({ ...newPet, species: 'Dog' })}
                      className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        newPet.species === 'Dog' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'border-gray-800 text-gray-400'
                      }`}
                    >
                      <Dog size={16} /> Dog / Puppy
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPet({ ...newPet, species: 'Cat' })}
                      className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        newPet.species === 'Cat' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'border-gray-800 text-gray-400'
                      }`}
                    >
                      <Cat size={16} /> Cat / Kitten
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Name or Tag</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Kitten #2 or Puppy #4" 
                    value={newPet.name}
                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Gender</label>
                    <select 
                      value={newPet.sex}
                      onChange={(e) => setNewPet({ ...newPet, sex: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Collar / Identifier</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Yellow Collar" 
                      value={newPet.collar}
                      onChange={(e) => setNewPet({ ...newPet, collar: e.target.value })}
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
                      value={newPet.price}
                      onChange={(e) => setNewPet({ ...newPet, price: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Microchip # (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="98514..." 
                      value={newPet.microchip}
                      onChange={(e) => setNewPet({ ...newPet, microchip: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
                >
                  <Plus size={16} /> Post Pet to Nursery
                </button>
              </form>
            </div>

            {/* Pet List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg text-white">Active Nursery Listings ({pets.length})</h2>

              <div className="space-y-3">
                {pets.map((p) => (
                  <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-gray-800 text-indigo-400">
                          {p.species === 'Dog' ? <Dog size={16} /> : <Cat size={16} />}
                        </span>
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status.includes('Reserved') 
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs pl-8">
                        {p.sex} • {p.collar} • Microchip: <span className="font-mono text-gray-300">{p.microchip}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-extrabold text-white text-sm">${p.price}</div>
                        <div className="text-[10px] text-gray-500">${p.deposit} Escrow Deposit</div>
                      </div>
                      <button 
                        onClick={() => setPets(pets.filter(item => item.id !== p.id))}
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

        {/* TAB 2: VET & HEALTH VAULT */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Upload className="text-indigo-400" size={20} /> Upload Health Record
              </h2>
              <p className="text-xs text-gray-400">Upload state breeder licenses, vet vaccination reports, or health guarantees.</p>

              <div className="border-2 border-dashed border-gray-800 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-gray-950 cursor-pointer">
                <Upload size={28} className="mx-auto text-indigo-400 mb-2" />
                <p className="text-xs font-semibold text-white">Upload PDF or Image</p>
                <p className="text-[10px] text-gray-500 mt-1">Up to 10MB</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-bold text-lg text-white">Verified Records ({documents.length})</h2>
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
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIMPLE SINGLE CAMERA STREAM SETUP */}
        {activeTab === 'stream' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 max-w-2xl">
            <div>
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Camera className="text-indigo-400" size={20} /> Single Nursery Camera Feed
              </h2>
              <p className="text-xs text-gray-400 mt-1">Connect your mobile camera or RTMP stream. Keep it simple and go live in seconds.</p>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3 text-xs">
              <div>
                <span className="font-bold text-white block mb-1">Your Unique Live Stream Key</span>
                <span className="text-gray-400 font-mono bg-gray-900 p-2 rounded-lg block border border-gray-800 overflow-x-auto">
                  rtmp://live.livepaws.health/app/oakwood_nursery_feed
                </span>
              </div>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold">
                <Copy size={14} /> Copy Stream Key
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ESCROW SALES LEDGER */}
        {activeTab === 'escrow' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={20} /> Escrow Sales & Payout Ledger
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
                    <Clock size={12} /> Held in Escrow
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
