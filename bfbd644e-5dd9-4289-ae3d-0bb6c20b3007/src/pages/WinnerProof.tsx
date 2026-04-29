import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  UploadIcon,
  FileIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon } from
'lucide-react';
import { useAuth } from '../components/AuthContext';
import { fetchUserWinners, type WinnerRow } from '../lib/winnerService';
import { uploadWinnerProof } from '../lib/proofService';
type ProofStatus = 'pending' | 'approved' | 'rejected';
export function WinnerProof() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [selectedWinnerId, setSelectedWinnerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedWinner = useMemo(
    () => winners.find((w) => w.id === selectedWinnerId) ?? null,
    [winners, selectedWinnerId]
  );

  const submissionStatus: ProofStatus = selectedWinner?.verified
    ? 'approved'
    : selectedWinner?.proof_url
      ? 'pending'
      : 'pending';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) return;
      try {
        const rows = await fetchUserWinners(user.id);
        if (cancelled) return;
        setWinners(rows);
        setSelectedWinnerId(rows[0]?.id ?? '');
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load winners');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setError('Please sign in first.');
      return;
    }
    if (!selectedWinnerId) {
      setError('No winner record found for your account yet.');
      return;
    }
    if (!selectedFile) {
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await uploadWinnerProof({
        userId: user.id,
        winnerId: selectedWinnerId,
        file: selectedFile,
      });
      const rows = await fetchUserWinners(user.id);
      setWinners(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };
  const getStatusConfig = (status: ProofStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'bg-yellow-100 text-yellow-700',
          label: 'Pending Review'
        };
      case 'approved':
        return {
          icon: CheckCircleIcon,
          color: 'bg-green-100 text-green-700',
          label: 'Approved'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          color: 'bg-red-100 text-red-700',
          label: 'Rejected'
        };
    }
  };
  const statusConfig = getStatusConfig(submissionStatus);
  const StatusIcon = statusConfig.icon;
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
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
            Winner Proof Upload
          </h1>
          <p className="text-slate-600 mb-8">
            Upload proof of your winning score for verification
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Upload Section */}
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
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <UploadIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Upload Proof
              </h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Winner record
              </label>
              <select
                value={selectedWinnerId}
                onChange={(e) => setSelectedWinnerId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {winners.map((w) => (
                  <option key={w.id} value={w.id}>
                    {new Date(w.created_at).toLocaleDateString('en-GB')} — ₹
                    {Number(w.prize_amount).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
              {!user && (
                <p className="text-sm text-slate-500 mt-2">
                  Sign in to upload proof.
                </p>
              )}
              {user && winners.length === 0 && (
                <p className="text-sm text-slate-500 mt-2">
                  No winner record found yet for your account.
                </p>
              )}
            </div>

            {/* Drag and Drop Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-emerald-500 transition">
              <input
                type="file"
                id="file-upload"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileSelect}
                className="hidden" />
              
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center">
                
                <UploadIcon className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-lg font-semibold text-slate-700 mb-2">
                  Drag & drop your screenshot here
                </p>
                <p className="text-sm text-slate-500 mb-4">or</p>
                <span className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">
                  Browse Files
                </span>
              </label>
            </div>

            {/* File Format Note */}
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600">
                Accepted formats:{' '}
                <span className="font-semibold">PNG, JPG, PDF</span>
              </p>
              <p className="text-sm text-slate-600">
                Maximum file size: <span className="font-semibold">5MB</span>
              </p>
            </div>

            {/* File Preview */}
            {selectedFile &&
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              
                <div className="flex items-center space-x-3">
                  <FileIcon className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-slate-600">Ready to submit</p>
                  </div>
                </div>
                <button
                onClick={() => setSelectedFile(null)}
                className="text-red-600 hover:text-red-700 text-sm font-semibold">
                
                  Remove
                </button>
              </motion.div>
            }

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || submitting || !user || winners.length === 0}
              className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold transition ${selectedFile ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              
              {submitting ? 'Uploading...' : 'Submit Proof'}
            </button>
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          </motion.div>

          {/* Submission Status */}
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
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Submission Status
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-700 font-medium">
                  Current Status
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 ${statusConfig.color}`}>
                  
                  <StatusIcon className="w-4 h-4" />
                  <span>{statusConfig.label}</span>
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-700 font-medium">
                  Submission Date
                </span>
                <span className="text-slate-900">
                  {selectedWinner
                    ? new Date(selectedWinner.created_at).toLocaleDateString('en-GB')
                    : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-slate-700 font-medium">
                  Draw Reference
                </span>
                <span className="text-slate-900 font-mono">
                  {selectedWinner ? `#${selectedWinner.draw_id}` : '—'}
                </span>
              </div>

              {submissionStatus === 'rejected' &&
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Admin Notes
                  </p>
                  <p className="text-sm text-red-700">
                    The uploaded screenshot was not clear enough. Please upload
                    a higher quality image showing the full scorecard.
                  </p>
                </div>
              }

              {submissionStatus === 'approved' &&
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    Admin Notes
                  </p>
                  <p className="text-sm text-green-700">
                    Your proof has been verified. Prize payment will be
                    processed within 5-7 business days.
                  </p>
                </div>
              }

              {submissionStatus === 'pending' &&
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    Admin Notes
                  </p>
                  <p className="text-sm text-yellow-700">
                    Your submission is currently under review. We'll notify you
                    once the verification is complete.
                  </p>
                </div>
              }
            </div>

          </motion.div>
        </div>
      </div>
    </DashboardLayout>);

}