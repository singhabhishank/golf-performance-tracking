import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  SearchIcon,
  HeartIcon,
  CheckIcon } from
'lucide-react';
import { useAuth } from '../components/AuthContext';
import {
  fetchCharities,
  setUserCharitySelection,
  type CharityRow,
} from '../lib/charityService';

interface CharityView {
  id: string;
  name: string;
  description: string;
  totalContributions: number;
}

export function Charities() {
  const { user } = useAuth();
  const [charities, setCharities] = useState<CharityView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(
    user?.charityId ?? null
  );
  const [contributionPercent, setContributionPercent] = useState<number>(
    user?.charityPercent ?? 10
  );

  useEffect(() => {
    setSelectedCharityId(user?.charityId ?? null);
    setContributionPercent(user?.charityPercent ?? 10);
  }, [user?.charityId, user?.charityPercent]);

  const hydrate = (rows: CharityRow[]) => {
    setCharities(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? '',
        totalContributions: row.total_contributions ?? 0,
      }))
    );
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchCharities()
      .then((rows) => {
        if (!cancelled) hydrate(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCharities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return charities;
    return charities.filter((charity) =>
      charity.name.toLowerCase().includes(q)
    );
  }, [charities, searchQuery]);

  const featuredCharity = charities[0] ?? null;

  const handleSelect = async (charityId: string) => {
    setSelectedCharityId(charityId);
    if (!user) {
      setError('Please sign in to save your charity selection.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await setUserCharitySelection({
        charityId,
        contributionPercent: Math.max(10, Math.min(50, contributionPercent)),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save selection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5
          }}>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Choose Your Charity
          </h1>
          <p className="text-slate-600 mb-8">
            Select a charity to support with your monthly contributions
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            delay: 0.1
          }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search charities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-slate-700">
              Charity contribution %
            </label>
            <input
              type="number"
              min={10}
              max={50}
              value={contributionPercent}
              onChange={(e) => setContributionPercent(parseInt(e.target.value) || 10)}
              className="w-full sm:w-40 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
            <span className="text-sm text-slate-500">
              Minimum 10% (you can increase up to 50%)
            </span>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </motion.div>

        {/* Featured Charity */}
        {featuredCharity &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            delay: 0.2
          }}
          className="mb-8">
          
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Featured Charity
            </h2>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border-2 border-emerald-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HeartIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {featuredCharity.name}
                      </h3>
                    </div>
                    <p className="text-slate-700 mb-4">
                      {featuredCharity.description}
                    </p>
                    <p className="text-sm text-slate-600">
                      Current contribution:{' '}
                      <span className="font-semibold text-emerald-600">
                        {Math.max(10, Math.min(50, contributionPercent))}%
                      </span>{' '}
                      of your subscription
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        }

        {/* Charities Grid */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            All Charities
          </h2>
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-500">Loading charities...</p>
            </div>
          ) : filteredCharities.length === 0 ?
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-500">
                No charities found matching your criteria.
              </p>
            </div> :

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharities.map((charity, index) => {
              const isSelected = selectedCharityId === charity.id;
              return (
                <motion.div
                  key={charity.id}
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + index * 0.05
                  }}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 transition hover:shadow-md ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'}`}>
                  
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                      <HeartIcon className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {charity.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Total contributed: ₹{charity.totalContributions.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 mb-4">
                      {charity.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">
                        Contribution percentage
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        {Math.max(10, Math.min(50, contributionPercent))}%
                      </p>
                    </div>

                    <button
                    onClick={() => handleSelect(charity.id)}
                    disabled={saving}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    
                      {isSelected && <CheckIcon className="w-5 h-5" />}
                      <span>
                        {saving && isSelected ? 'Saving...' : isSelected ? 'Selected' : 'Select Charity'}
                      </span>
                    </button>
                  </motion.div>);

            })}
            </div>
          }
        </div>

        {/* Independent Donation */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.5,
            delay: 0.5
          }}
          className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-6">
          
          <div className="flex items-center space-x-3 mb-4">
            <HeartIcon className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Independent Donation
            </h2>
          </div>
          <p className="text-slate-600 mb-4">
            Want to give more? Make an independent donation to your selected
            charity — not tied to gameplay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                ₹
              </span>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              
            </div>
            <button
              onClick={() =>
              alert('Donation submitted! (Stripe integration coming soon)')
              }
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">
              
              Donate Now
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Payment processing via Stripe — coming soon.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>);

}