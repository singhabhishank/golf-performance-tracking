import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { TrophyIcon, EditIcon, TrashIcon, SaveIcon } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import {
  deleteUserScore,
  fetchUserScores,
  saveUserScore,
  type UserScore,
} from '../lib/scoreService';

interface ScoreView {
  id: string;
  date: string;
  score: number;
}

export function Scores() {
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreView[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    score: ''
  });
  const [errors, setErrors] = useState({
    date: '',
    score: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedScores = useMemo(
    () =>
      [...scores].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [scores]
  );

  const hydrateScores = (rows: UserScore[]) => {
    setScores(
      rows.map((row) => ({
        id: row.id,
        date: row.date,
        score: row.score,
      }))
    );
  };

  const loadScores = async () => {
    if (!user) {
      setScores([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const rows = await fetchUserScores(user.id);
      hydrateScores(rows);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const validateForm = () => {
    const newErrors = {
      date: '',
      score: ''
    };
    let isValid = true;
    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    } else if (!editingId && scores.some((s) => s.date === formData.date)) {
      newErrors.date = 'A score already exists for this date';
      isValid = false;
    } else if (
    editingId &&
    scores.some((s) => s.date === formData.date && s.id !== editingId))
    {
      newErrors.date = 'A score already exists for this date';
      isValid = false;
    }
    if (!formData.score) {
      newErrors.score = 'Score is required';
      isValid = false;
    } else if (parseInt(formData.score) < 1 || parseInt(formData.score) > 45) {
      newErrors.score = 'Score must be between 1 and 45';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    if (!user) {
      setServerError('Please sign in first');
      return;
    }

    setSubmitting(true);
    try {
      await saveUserScore(
        user.id,
        parseInt(formData.score, 10),
        formData.date,
        editingId
      );
      await loadScores();
      setEditingId(null);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Failed to save score'
      );
    } finally {
      setSubmitting(false);
    }

    setFormData({
      date: '',
      score: ''
    });
    setErrors({
      date: '',
      score: ''
    });
  };

  const handleEdit = (score: ScoreView) => {
    setFormData({
      date: score.date,
      score: score.score.toString()
    });
    setEditingId(score.id);
    setErrors({
      date: '',
      score: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this score?')) {
      setServerError('');
      try {
        await deleteUserScore(user.id, id);
        await loadScores();
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : 'Failed to delete score'
        );
      }
      if (editingId === id) {
        setFormData({
          date: '',
          score: ''
        });
        setEditingId(null);
      }
    }
  };
  const handleCancel = () => {
    setFormData({
      date: '',
      score: ''
    });
    setEditingId(null);
    setErrors({
      date: '',
      score: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
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
            Score Entry
          </h1>
          <p className="text-slate-600 mb-8">
            Track your Stableford scores and enter the monthly draw
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* Score Entry Form */}
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
                <TrophyIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? 'Edit Score' : 'Add New Score'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    date: e.target.value
                  })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.date ? 'border-red-500' : 'border-slate-300'}`} />
                
                {errors.date &&
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stableford Score (1-45)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={formData.score}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    score: e.target.value
                  })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.score ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="Enter score between 1 and 45" />
                
                {errors.score &&
                <p className="text-red-500 text-sm mt-1">{errors.score}</p>
                }
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center space-x-2">
                  
                  <SaveIcon className="w-5 h-5" />
                  <span>
                    {submitting
                      ? 'Saving...'
                      : editingId
                        ? 'Update Score'
                        : 'Save Score'}
                  </span>
                </button>
                {editingId &&
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition">
                  
                    Cancel
                  </button>
                }
              </div>
              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </form>
          </motion.div>

          {/* Recent Scores */}
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
            
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Recent Scores (Latest 5)
            </h2>

            {loading ? (
              <p className="text-slate-500 text-center py-8">Loading scores...</p>
            ) : sortedScores.length === 0 ?
            <p className="text-slate-500 text-center py-8">
                No scores recorded yet. Add your first score above!
              </p> :

            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedScores.map((score, index) =>
                  <motion.tr
                    key={score.id}
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
                    
                        <td className="py-3 px-4 text-slate-900">
                          {new Date(score.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
                            {score.score} points
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end space-x-2">
                            <button
                          onClick={() => handleEdit(score)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit score">
                          
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button
                          onClick={() => handleDelete(score.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete score">
                          
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                  )}
                  </tbody>
                </table>
              </div>
            }

            {sortedScores.length > 0 &&
            <p className="text-sm text-slate-500 mt-4">
                Only your latest 5 scores are kept. New scores will replace the
                oldest ones.
              </p>
            }
          </motion.div>
        </div>
      </div>
    </DashboardLayout>);

}