import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  PlayIcon,
  SettingsIcon,
  SendIcon,
  EyeIcon,
  AlertCircleIcon } from
'lucide-react';
type DrawLogic = 'random' | 'algorithmic';
interface SimulationResult {
  fiveMatch: number;
  fourMatch: number;
  threeMatch: number;
  noMatch: number;
  jackpotRollover: boolean;
}
import { apiJson } from '../../lib/apiClient';

export function AdminDraws() {
  const [drawLogic, setDrawLogic] = useState<DrawLogic>('random');
  const [drawDate, setDrawDate] = useState('2025-07-31');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] =
  useState<SimulationResult | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [draws, setDraws] = useState<Draw[]>([
  {
    id: '1',
    date: 'June 30, 2025',
    status: 'scheduled',
    entries: 12450,
    prizePool: 5500000,
    type: 'algorithmic'
  },
  {
    id: '2',
    date: 'July 31, 2025',
    status: 'scheduled',
    entries: 8320,
    prizePool: 6000000,
    type: 'random'
  },
  {
    id: '3',
    date: 'August 31, 2025',
    status: 'draft',
    entries: 0,
    prizePool: 0,
    type: 'algorithmic'
  }]
  );
  const scheduledDraws = [
  {
    id: '1',
    date: '2025-07-31',
    status: 'Scheduled',
    prizePool: 55000,
    subscribers: 1923
  },
  {
    id: '2',
    date: '2025-08-31',
    status: 'Scheduled',
    prizePool: 60000,
    subscribers: 1923
  },
  {
    id: '3',
    date: '2025-09-30',
    status: 'Scheduled',
    prizePool: 0,
    subscribers: 0
  }];

  const pastDraws = [
  {
    id: '4',
    date: '2025-06-30',
    status: 'Published',
    logic: 'Random',
    fiveMatch: 1,
    fourMatch: 3,
    threeMatch: 12
  },
  {
    id: '5',
    date: '2025-05-31',
    status: 'Published',
    logic: 'Random',
    fiveMatch: 0,
    fourMatch: 2,
    threeMatch: 8
  },
  {
    id: '6',
    date: '2025-04-30',
    status: 'Published',
    logic: 'Algorithmic',
    fiveMatch: 1,
    fourMatch: 5,
    threeMatch: 15
  }];

  const handleSimulate = async () => {
    setError('');
    setIsSimulating(true);
    try {
      const data = await apiJson<{
        winningNumbers: number[];
        counts: { fiveMatch: number; fourMatch: number; threeMatch: number; noMatch: number };
        jackpotRollover: boolean;
      }>('/admin/draws/simulate', {
        method: 'POST',
        body: JSON.stringify({ drawLogic, drawDate }),
      });
      setWinningNumbers(data.winningNumbers);
      setSimulationResult({
        fiveMatch: data.counts.fiveMatch,
        fourMatch: data.counts.fourMatch,
        threeMatch: data.counts.threeMatch,
        noMatch: data.counts.noMatch,
        jackpotRollover: data.jackpotRollover,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };
  const handlePublish = async () => {
    if (
    window.confirm(
      'Are you sure you want to publish this draw result? This action cannot be undone.'
    ))
    {
      setError('');
      try {
        await apiJson('/admin/draws/publish', {
          method: 'POST',
          body: JSON.stringify({ drawLogic, drawDate }),
        });
        setIsPublished(true);
        alert('Draw results published successfully!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Publish failed');
      }
    }
  };
  return (
    <AdminLayout>
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
            Draw Management
          </h1>
          <p className="text-slate-600 mb-8">
            Configure draw logic, run simulations, and publish results
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Draw Configuration */}
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
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Draw Configuration
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Draw Logic
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDrawLogic('random')}
                    className={`p-4 rounded-lg border-2 text-left transition ${drawLogic === 'random' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    
                    <p className="font-semibold text-slate-900">Random</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Standard lottery-style random generation
                    </p>
                  </button>
                  <button
                    onClick={() => setDrawLogic('algorithmic')}
                    className={`p-4 rounded-lg border-2 text-left transition ${drawLogic === 'algorithmic' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    
                    <p className="font-semibold text-slate-900">Algorithmic</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Weighted by most/least frequent scores
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Draw Date
                </label>
                <input
                  type="date"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cadence
                </label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-slate-900 font-medium">Monthly</p>
                  <p className="text-xs text-slate-600">
                    Draws are executed once per month on the last day
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Simulation Panel */}
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
              delay: 0.15
            }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PlayIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Simulation / Pre-Analysis
              </h2>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Run a simulation before publishing official results. This does not
              affect live data.
            </p>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${isSimulating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              
              <PlayIcon className="w-5 h-5" />
              <span>
                {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
              </span>
            </button>

            {simulationResult &&
            <motion.div
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="mt-6 space-y-3">
              
                <h3 className="text-sm font-semibold text-slate-900">
                  Simulation Results
                </h3>
                {winningNumbers.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-2">Winning numbers</p>
                    <div className="flex flex-wrap gap-2">
                      {winningNumbers.map((n) => (
                        <span key={n} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-sm font-semibold">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {simulationResult.fiveMatch}
                    </p>
                    <p className="text-xs text-emerald-700">5-Number Match</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {simulationResult.fourMatch}
                    </p>
                    <p className="text-xs text-blue-700">4-Number Match</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {simulationResult.threeMatch}
                    </p>
                    <p className="text-xs text-amber-700">3-Number Match</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-slate-600">
                      {simulationResult.noMatch}
                    </p>
                    <p className="text-xs text-slate-700">No Match</p>
                  </div>
                </div>
                {simulationResult.jackpotRollover &&
              <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <AlertCircleIcon className="w-5 h-5 text-orange-600" />
                    <p className="text-sm text-orange-700 font-medium">
                      Jackpot would roll over to next month (no 5-match winner)
                    </p>
                  </div>
              }
                <button
                onClick={handlePublish}
                disabled={isPublished}
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${isPublished ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                
                  <SendIcon className="w-5 h-5" />
                  <span>{isPublished ? 'Published ✓' : 'Publish Results'}</span>
                </button>
              </motion.div>
            }
          </motion.div>
        </div>

        {/* Scheduled Draws */}
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
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Upcoming Draws
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Est. Prize Pool
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Active Subscribers
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduledDraws.map((draw) =>
                <tr key={draw.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span>
                        {new Date(draw.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {draw.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {draw.prizePool > 0 ?
                    `₹${draw.prizePool.toLocaleString('en-IN')}` :
                    'TBD'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {draw.subscribers > 0 ?
                    draw.subscribers.toLocaleString() :
                    'TBD'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Past Draws */}
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
            delay: 0.25
          }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Published Draws
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Logic
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    5-Match
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    4-Match
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    3-Match
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {pastDraws.map((draw) =>
                <tr key={draw.id} className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      {new Date(draw.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        {draw.logic}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {draw.fiveMatch}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600">
                      {draw.fourMatch}
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-600">
                      {draw.threeMatch}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {draw.status}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>);

}