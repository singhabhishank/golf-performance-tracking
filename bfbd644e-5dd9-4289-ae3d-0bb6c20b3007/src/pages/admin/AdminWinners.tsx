import React, { useMemo, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ImageIcon } from 'lucide-react';
import {
  fetchAdminWinners,
  type AdminWinner,
  updateAdminWinner,
} from '../../lib/adminService';

export function AdminWinners() {
  const [winners, setWinners] = React.useState<AdminWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedWinner, setExpandedWinner] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const loadWinners = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminWinners();
      setWinners(data);
      setNotesDraft(
        Object.fromEntries(data.map((w) => [w.id, w.admin_notes ?? '']))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load winners');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadWinners();
  }, [loadWinners]);

  const filteredWinners = useMemo(
    () =>
      winners.filter((w) => {
        const proofStatus = w.verified ? 'Approved' : 'Pending';
        return statusFilter === 'All' || proofStatus === statusFilter;
      }),
    [statusFilter, winners]
  );

  const getProofStatus = (w: AdminWinner) => (w.verified ? 'Approved' : 'Pending');

  const getProofStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Not Applicable':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const saveDecision = async (
    winner: AdminWinner,
    input: {
      verified?: boolean;
      payment_status?: 'Paid' | 'Pending' | 'Not Applicable';
    }
  ) => {
    setError('');
    try {
      await updateAdminWinner(winner.id, {
        ...input,
        admin_notes: notesDraft[winner.id] ?? '',
      });
      await loadWinners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
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
            Winners Verification
          </h1>
          <p className="text-slate-600 mb-4">
            Review and verify winner proof submissions
          </p>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        </motion.div>

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
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700">
              Filter by status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white">
              
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-slate-600">Loading winners...</div>
        ) : (
        <div className="space-y-4">
          {filteredWinners.map((winner, index) => {
            const isExpanded = expandedWinner === winner.id;
            const proofStatus = getProofStatus(winner);
            return (
              <motion.div
                key={winner.id}
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
                  delay: 0.2 + index * 0.05
                }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                
                <div
                  className="p-6 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() =>
                  setExpandedWinner(isExpanded ? null : winner.id)
                  }>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Winner</p>
                        <p className="font-semibold text-slate-900">{winner.email ?? winner.user_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Draw Date</p>
                        <p className="text-slate-900">
                          {new Date(winner.created_at).toLocaleDateString(
                            'en-GB',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Prize
                        </p>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          INR {Number(winner.prize_amount).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Proof Status
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getProofStatusBadge(proofStatus)}`}>
                          
                          {proofStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Payment</p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(winner.payment_status)}`}>
                          
                          {winner.payment_status}
                        </span>
                      </div>
                    </div>
                    <button className="ml-4 text-slate-400 hover:text-slate-600">
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {isExpanded &&
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0
                  }}
                  animate={{
                    opacity: 1,
                    height: 'auto'
                  }}
                  className="border-t border-slate-200 p-6 bg-slate-50">
                  
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">
                          Proof Screenshot
                        </h3>
                        <div className="bg-slate-200 rounded-lg h-48 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">{winner.proof_url ? 'Proof uploaded' : 'No proof uploaded'}</p>
                          </div>
                        </div>
                        {winner.proof_url && (
                          <a
                            href={winner.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 mt-2 inline-block"
                          >
                            Open proof
                          </a>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">
                          Admin Notes
                        </h3>
                        <textarea
                        value={notesDraft[winner.id] ?? ''}
                        onChange={(e) =>
                          setNotesDraft((prev) => ({ ...prev, [winner.id]: e.target.value }))
                        }
                        placeholder="Add notes about this submission..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                        rows={4} />
                      
                        {proofStatus === 'Pending' &&
                      <div className="flex space-x-3 mt-4">
                            <button
                          onClick={() => void saveDecision(winner, { verified: true, payment_status: 'Pending' })}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2">
                          
                              <CheckCircleIcon className="w-5 h-5" />
                              <span>Approve</span>
                            </button>
                            <button
                          onClick={() => void saveDecision(winner, { verified: false, payment_status: 'Not Applicable' })}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2">
                          
                              <XCircleIcon className="w-5 h-5" />
                              <span>Reject</span>
                            </button>
                          </div>
                      }
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => void saveDecision(winner, { payment_status: 'Pending' })}
                            className="px-3 py-2 text-sm rounded border border-slate-300"
                          >
                            Mark Pending
                          </button>
                          <button
                            onClick={() => void saveDecision(winner, { payment_status: 'Paid' })}
                            className="px-3 py-2 text-sm rounded bg-emerald-600 text-white"
                          >
                            Mark Paid
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                }
              </motion.div>);

          })}
        </div>
        )}

        {filteredWinners.length === 0 &&
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">
              No winners found matching your filter.
            </p>
          </div>
        }
      </div>
    </AdminLayout>);

}