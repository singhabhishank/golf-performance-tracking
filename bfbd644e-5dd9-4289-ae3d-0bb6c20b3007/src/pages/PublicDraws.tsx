import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  CalendarIcon,
  AlertCircleIcon,
  ArrowRightIcon } from
'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
interface Draw {
  id: string;
  date: string;
  prizePool: number;
  winner: string;
  matchType: '5-Number Match' | '4-Number Match' | '3-Number Match' | 'No Match';
  status: 'Completed' | 'Upcoming';
  jackpotRollover: boolean;
}
const draws: Draw[] = [
{
  id: '1',
  date: '2025-06-30',
  prizePool: 50000,
  winner: 'Sarah M.',
  matchType: '5-Number Match',
  status: 'Completed',
  jackpotRollover: false
},
{
  id: '2',
  date: '2025-05-31',
  prizePool: 45000,
  winner: 'Michael T.',
  matchType: '4-Number Match',
  status: 'Completed',
  jackpotRollover: true
},
{
  id: '3',
  date: '2025-04-30',
  prizePool: 42000,
  winner: 'Emma L.',
  matchType: '3-Number Match',
  status: 'Completed',
  jackpotRollover: true
},
{
  id: '4',
  date: '2025-03-31',
  prizePool: 38000,
  winner: 'James R.',
  matchType: '5-Number Match',
  status: 'Completed',
  jackpotRollover: false
},
{
  id: '5',
  date: '2025-02-28',
  prizePool: 40000,
  winner: 'Olivia K.',
  matchType: '4-Number Match',
  status: 'Completed',
  jackpotRollover: true
},
{
  id: '6',
  date: '2025-07-31',
  prizePool: 55000,
  winner: 'TBD',
  matchType: 'No Match',
  status: 'Upcoming',
  jackpotRollover: true
}];

const drawHistory: Draw[] = [
{
  id: '1',
  date: 'May 31, 2025',
  prizePool: 5000000,
  winner: 'Sarah J.',
  matchType: '5-Number Match'
},
{
  id: '2',
  date: 'April 30, 2025',
  prizePool: 4500000,
  winner: 'Michael T.',
  matchType: '4-Number Match'
},
{
  id: '3',
  date: 'March 31, 2025',
  prizePool: 4200000,
  winner: 'David W.',
  matchType: '5-Number Match'
},
{
  id: '4',
  date: 'February 28, 2025',
  prizePool: 3800000,
  winner: 'Emma L.',
  matchType: '3-Number Match'
},
{
  id: '5',
  date: 'January 31, 2025',
  prizePool: 4000000,
  winner: 'James R.',
  matchType: '4-Number Match'
}];

const upcomingDraw = {
  date: 'June 30, 2025',
  prizePool: 5500000,
  entriesClose: 'June 28, 2025'
};
export function PublicDraws() {
  const latestDraw = draws.find((d) => d.status === 'Completed');
  const upcomingDraw = draws.find((d) => d.status === 'Upcoming');
  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case '5-Number Match':
        return 'bg-emerald-100 text-emerald-700';
      case '4-Number Match':
        return 'bg-blue-100 text-blue-700';
      case '3-Number Match':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };
  return (
    <div className="min-h-screen bg-white w-full">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
              duration: 0.6
            }}>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Draw Results
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See who's winning and how the prize pool is distributed every
              month.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* How Draws Work */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}
            className="mb-12">
            
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              How Draws Work
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-4xl font-bold text-emerald-600 mb-2">01</p>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Submit Scores
                </h3>
                <p className="text-sm text-slate-600">
                  Enter your last 5 Stableford golf scores (1–45 range) to
                  qualify for the monthly draw.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-4xl font-bold text-emerald-600 mb-2">02</p>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Monthly Draw
                </h3>
                <p className="text-sm text-slate-600">
                  Draws run once per month. Numbers are matched against your
                  scores using random or algorithmic logic.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-4xl font-bold text-emerald-600 mb-2">03</p>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Win Prizes
                </h3>
                <p className="text-sm text-slate-600">
                  Match 3, 4, or all 5 numbers to win. The jackpot rolls over if
                  no 5-number match is found.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Prize Pool Distribution */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}
            className="mb-12">
            
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Prize Pool Distribution
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                <p className="text-sm text-emerald-700 font-medium mb-1">
                  5-Number Match
                </p>
                <p className="text-4xl font-bold text-emerald-600">40%</p>
                <p className="text-xs text-emerald-600 mt-2">
                  Jackpot — rolls over if unclaimed
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <p className="text-sm text-blue-700 font-medium mb-1">
                  4-Number Match
                </p>
                <p className="text-4xl font-bold text-blue-600">35%</p>
                <p className="text-xs text-blue-600 mt-2">
                  Split equally among winners
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                <p className="text-sm text-amber-700 font-medium mb-1">
                  3-Number Match
                </p>
                <p className="text-4xl font-bold text-amber-600">25%</p>
                <p className="text-xs text-amber-600 mt-2">
                  Split equally among winners
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Draw */}
          {upcomingDraw &&
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white mb-12">
            
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Next Draw</p>
                  <p className="text-3xl font-bold mb-2">
                    {new Date(upcomingDraw.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  </p>
                  <div className="text-center md:text-right mt-4 md:mt-0">
                    <p className="text-emerald-100 mb-1">
                      Estimated Prize Pool:{' '}
                    </p>
                    <p className="text-4xl font-bold">
                      ₹{upcomingDraw.prizePool.toLocaleString('en-IN')}
                    </p>
                  </div>
                  {upcomingDraw.jackpotRollover &&
                <div className="flex items-center space-x-2 mt-2">
                      <AlertCircleIcon className="w-4 h-4 text-yellow-300" />
                      <p className="text-yellow-200 text-sm font-medium">
                        Includes jackpot rollover from previous month
                      </p>
                    </div>
                }
                </div>
                <Link
                to="/signup"
                className="inline-block px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-slate-100 transition shadow-lg">
                
                  Join to Enter
                </Link>
              </div>
            </motion.div>
          }

          {/* Latest Draw */}
          {latestDraw &&
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}
            className="mb-12">
            
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Latest Draw Result
              </h2>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <TrophyIcon className="w-8 h-8 text-emerald-600" />
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {latestDraw.status}
                  </span>
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
                    <p className="text-sm text-slate-600 mb-1">Prize Pool</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ₹{latestDraw.prizePool.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Jackpot Winner
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {latestDraw.winner}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Match Type</p>
                    <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getMatchTypeBadge(latestDraw.matchType)}`}>
                    
                      {latestDraw.matchType}
                    </span>
                  </div>
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
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Past Draws
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Prize Pool
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Winner
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Match Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Rollover
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawHistory.map((draw, index) =>
                    <motion.tr
                      key={draw.id}
                      initial={{
                        opacity: 0,
                        x: -20
                      }}
                      whileInView={{
                        opacity: 1,
                        x: 0
                      }}
                      viewport={{
                        once: true
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05
                      }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition">
                      
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
                        <td className="py-3 px-4 font-semibold text-emerald-600">
                          ₹{draw.prizePool.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-slate-900">
                          {draw.winner}
                        </td>
                        <td className="py-3 px-4">
                          <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getMatchTypeBadge(draw.matchType)}`}>
                          
                            {draw.matchType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {draw.jackpotRollover ?
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                              Yes
                            </span> :

                        <span className="text-slate-400 text-xs">—</span>
                        }
                        </td>
                      </motion.tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}
            className="mt-12 text-center">
            
            <p className="text-lg text-slate-700 mb-4">
              Want to enter the next draw?
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl">
              
              <span>Join Now</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>);

}