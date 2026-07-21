import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dog, 
  Cat, 
  Video, 
  ShieldCheck, 
  HelpCircle, 
  BookOpen, 
  Briefcase, 
  User, 
  LayoutDashboard, 
  ShieldAlert,
  ChevronDown,
  Search,
  Menu,
  X
} from 'lucide-react';

export const SiteNav: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                🐾
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                LivePaws
              </span>
            </Link>

            {/* Desktop Navigation Dropdowns */}
            <nav className="hidden md:flex items-center gap-6">
              
              {/* Explore Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('explore')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors py-2"
                >
                  Explore <ChevronDown size={16} />
                </button>

                {activeDropdown === 'explore' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50">
                    <Link to="/explore?species=dog" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                      <Dog size={18} className="text-indigo-500" /> Browse Puppies
                    </Link>
                    <Link to="/explore?species=cat" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                      <Cat size={18} className="text-indigo-500" /> Browse Kittens
                    </Link>
                    <Link to="/live" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                      <Video size={18} className="text-red-500" /> Live Streams Schedule
                    </Link>
                  </div>
                )}
              </div>

              {/* Learn & Trust Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('learn')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors py-2"
                >
                  Learn & Trust <ChevronDown size={16} />
                </button>

                {activeDropdown === 'learn' && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50">
                    <Link to="/about" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                      <ShieldCheck size={18} className="text-emerald-500" /> About LivePaws & Escrow
                    </Link>
                    <Link to="/how-it-works" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                      <HelpCircle size={18} className="text-indigo-500" /> How Deposit Escrow Works
                    </Link>
                    <Link to="/blog" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                      <BookOpen size={18} className="text-amber-500" /> Adoption & Pet Care Blog
                    </Link>
                  </div>
                )}
              </div>

              {/* For Breeders Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('breeders')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors py-2"
                >
                  For Breeders <ChevronDown size={16} />
                </button>

                {activeDropdown === 'breeders' && (
                  <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50">
                    <Link to="/breeder/apply" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                      <Briefcase size={18} className="text-indigo-500" /> Apply for Verification
                    </Link>
                    <Link to="/breeder/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                      <LayoutDashboard size={18} className="text-violet-500" /> Breeder Studio Portal
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Quick Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search breeds or kennels..." 
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/auth" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
            >
              <User size={16} /> Sign In
            </Link>

            <Link 
              to="/admin" 
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
              title="Super Admin Portal"
            >
              <ShieldAlert size={14} className="text-amber-600" /> Admin
            </Link>

            <Link 
              to="/live" 
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              Watch Live
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>
    </header>
  );
};

export default SiteNav;
