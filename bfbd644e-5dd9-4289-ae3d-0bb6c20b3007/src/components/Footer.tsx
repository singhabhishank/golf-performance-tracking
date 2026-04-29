import React from 'react';
import { Link } from 'react-router-dom';
export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-emerald-400 mb-4">
              GolfLottery
            </h3>
            <p className="text-slate-400">
              Play golf, support charities, and win big prizes every month.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/#how-it-works"
                  className="hover:text-emerald-400 transition">
                  
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/explore-charities"
                  className="hover:text-emerald-400 transition">
                  
                  Charities
                </Link>
              </li>
              <li>
                <Link
                  to="/draw-results"
                  className="hover:text-emerald-400 transition">
                  
                  Draw Results
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  to="/signin"
                  className="hover:text-emerald-400 transition">
                  
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="hover:text-emerald-400 transition">
                  
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-emerald-400 transition">
                  
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#" className="hover:text-emerald-400 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} GolfLottery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>);

}