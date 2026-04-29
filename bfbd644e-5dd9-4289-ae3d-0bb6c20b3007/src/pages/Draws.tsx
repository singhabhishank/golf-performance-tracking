import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  SearchIcon,
  CalendarIcon,
  AlertCircleIcon } from
'lucide-react';
import { fetchDraws, type DrawRow } from '../lib/drawService';

interface DrawView {
  id: string;
  date: string;
  status: string;
  type: string;
  numbers: number[];
  winnersCount: number;
  jackpotRollover: boolean;
}

export function Draws() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState<DrawView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchDraws()
      .then((data: DrawRow[]) => {
        if (cancelled) return;
        setRows(
          data.map((d) => ({
            id: d.id,
            date: d.draw_date,
            status: d.status,
            type: d.type,
            numbers: d.result?.numbers ?? [],
            winnersCount: d.result?.winners_count ?? 0,
            jackpotRollover: Boolean(d.result?.jackpot_rollover),
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load draws');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const latestDraw = useMemo(
    () => rows.find((d) => d.status === 'published') ?? rows[0] ?? null,
    [rows]
  );

  const filteredDraws = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return rows.filter((d) => d.status.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
  }, [rows, searchQuery]);

  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case '5-Number Match':
        return 'bg-emerald-100 text-emerald-700';
      case '4-Number Match':
        return 'bg-blue-100 text-blue-700';
      case '3-Number Match':
        return 'bg-amber-100 text-amber-700';
      case 'No Match':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-600';
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
            Draw Results
          </h1>
          <p className="text-slate-600 mb-8">
            View the latest and past monthly draw results
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Prize Pool Distribution */}
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
            delay: 0.05
          }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Prize Pool Distribution
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <p className="text-sm text-emerald-700 font-medium mb-1">
                5-Number Match
              </p>
              <p className="text-3xl font-bold text-emerald-600">40%</p>
              <p className="text-xs text-emerald-600 mt-1">
                Jackpot — rolls over if unclaimed
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-700 font-medium mb-1">
                4-Number Match
              </p>
              <p className="text-3xl font-bold text-blue-600">35%</p>
              <p className="text-xs text-blue-600 mt-1">
                Split equally among winners
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-700 font-medium mb-1">
                3-Number Match
              </p>
              <p className="text-3xl font-bold text-amber-600">25%</p>
              <p className="text-xs text-amber-600 mt-1">
                Split equally among winners
              </p>
            </div>
          </div>
        </motion.div>

        {/* Latest Draw Result */}
        {latestDraw &&
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
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-lg border-2 border-emerald-200 p-8 mb-8">
          
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <TrophyIcon className="w-8 h-8 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Latest Draw Result
                  </h2>
                </div>
                <p className="text-slate-600">
                  Most recent monthly draw outcome
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {latestDraw.jackpotRollover &&
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center space-x-1">
                    <AlertCircleIcon className="w-3 h-3" />
                    <span>Jackpot Rolled Over</span>
                  </span>
              }
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(latestDraw.status)}`}>
                  {latestDraw.status}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Draw Date</p>
                <p className="text-xl font-bold text-slate-900">
                  {new Date(latestDraw.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Winning Numbers</p>
                <p className="text-xl font-bold text-slate-900">
                  {latestDraw.numbers.length ? latestDraw.numbers.join(', ') : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Winners</p>
                <p className="text-xl font-bold text-slate-900">
                  {latestDraw.winnersCount}
                </p>
              </div>
            </div>
          </motion.div>
        }

        {/* Past Draws Table */}
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
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 sm:mb-0">
              All Draws
            </h2>
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search draws..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Draw Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Rollover
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 px-4 text-slate-500" colSpan={4}>
                      Loading draws...
                    </td>
                  </tr>
                ) : (
                  filteredDraws.map((draw, index) => (
                    <motion.tr
                      key={draw.id}
                      initial={{
                        opacity: 0,
                        x: -20
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05
                      }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition">
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-900">
                            {new Date(draw.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                          {draw.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(draw.status)}`}>
                          
                          {draw.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {draw.jackpotRollover ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredDraws.length === 0 &&
          <p className="text-slate-500 text-center py-8">
              No draws found matching your search.
            </p>
          }
        </motion.div>
      </div>
    </DashboardLayout>);

}