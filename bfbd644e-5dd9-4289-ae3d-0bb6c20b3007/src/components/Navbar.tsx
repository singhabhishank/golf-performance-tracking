import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-emerald-400">
            GolfLottery
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-emerald-400 transition">
              Home
            </Link>
            <a
              href="/#how-it-works"
              className="hover:text-emerald-400 transition">
              
              How It Works
            </a>
            <Link
              to="/explore-charities"
              className="hover:text-emerald-400 transition">
              
              Charities
            </Link>
            <Link
              to="/draw-results"
              className="hover:text-emerald-400 transition">
              
              Draw Results
            </Link>
            <Link to="/pricing" className="hover:text-emerald-400 transition">
              Pricing
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/signin"
              className="px-4 py-2 rounded-lg hover:bg-slate-800 transition">
              
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition">
              
              Join Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            
            {mobileMenuOpen ?
            <XIcon className="w-6 h-6" /> :

            <MenuIcon className="w-6 h-6" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen &&
      <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 py-4 space-y-3">
            <Link
            to="/"
            className="block py-2 hover:text-emerald-400 transition"
            onClick={() => setMobileMenuOpen(false)}>
            
              Home
            </Link>
            <a
            href="/#how-it-works"
            className="block py-2 hover:text-emerald-400 transition"
            onClick={() => setMobileMenuOpen(false)}>
            
              How It Works
            </a>
            <Link
            to="/explore-charities"
            className="block py-2 hover:text-emerald-400 transition"
            onClick={() => setMobileMenuOpen(false)}>
            
              Charities
            </Link>
            <Link
            to="/draw-results"
            className="block py-2 hover:text-emerald-400 transition"
            onClick={() => setMobileMenuOpen(false)}>
            
              Draw Results
            </Link>
            <Link
            to="/pricing"
            className="block py-2 hover:text-emerald-400 transition"
            onClick={() => setMobileMenuOpen(false)}>
            
              Pricing
            </Link>
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <Link
              to="/signin"
              className="block py-2 text-center rounded-lg bg-slate-700 hover:bg-slate-600 transition"
              onClick={() => setMobileMenuOpen(false)}>
              
                Login
              </Link>
              <Link
              to="/signup"
              className="block py-2 text-center rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold transition"
              onClick={() => setMobileMenuOpen(false)}>
              
                Join Now
              </Link>
            </div>
          </div>
        </div>
      }
    </nav>);

}