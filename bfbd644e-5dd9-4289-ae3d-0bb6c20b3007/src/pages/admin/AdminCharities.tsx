import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { motion } from 'framer-motion';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, SaveIcon, XIcon } from 'lucide-react';
import {
  createAdminCharity,
  deleteAdminCharity,
  fetchAdminCharities,
  type AdminCharity,
  updateAdminCharity,
} from '../../lib/adminService';

export function AdminCharities() {
  const [charities, setCharities] = useState<AdminCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });
  const loadCharities = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCharities(await fetchAdminCharities());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charities');
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    void loadCharities();
  }, [loadCharities]);
  const filteredCharities = charities.filter(
    (c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', image_url: '' });
    setShowForm(true);
  };
  const handleEdit = (charity: AdminCharity) => {
    setEditingId(charity.id);
    setFormData({
      name: charity.name,
      description: charity.description,
      image_url: charity.image_url ?? '',
    });
    setShowForm(true);
  };
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteAdminCharity(id);
        await loadCharities();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
      }
    }
  };
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Name and description are required');
      return;
    }
    try {
      if (editingId) {
        await updateAdminCharity(editingId, {
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url || null,
        });
      } else {
        await createAdminCharity({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url || null,
        });
      }
      await loadCharities();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
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
            Charity Management
          </h1>
          <p className="text-slate-600 mb-4">
            Add, edit, and manage charity listings
          </p>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        </motion.div>

        {/* Actions Bar */}
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
            <button
              onClick={handleAdd}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center space-x-2">
              
              <PlusIcon className="w-5 h-5" />
              <span>Add Charity</span>
            </button>
          </div>
        </motion.div>

        {/* Add/Edit Form */}
        {showForm &&
        <motion.div
          initial={{
            opacity: 0,
            y: -10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 p-6 mb-6">
          
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? 'Edit Charity' : 'Add New Charity'}
              </h2>
              <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600">
              
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="Charity name" />
              
              </div>
              <div />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                value={formData.description}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                rows={3}
                placeholder="Charity description" />
              
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <input
                type="text"
                value={formData.image_url}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  image_url: e.target.value
                })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              
              </div>
              <div>
                <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-500">
                  Store media URL in database now; bucket uploads can be added next.
                </div>
              </div>
              <div className="md:col-span-2" />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
              onClick={handleSave}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center space-x-2">
              
                <SaveIcon className="w-5 h-5" />
                <span>{editingId ? 'Update' : 'Add'} Charity</span>
              </button>
              <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition">
              
                Cancel
              </button>
            </div>
          </motion.div>
        }

        {/* Charities Table */}
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
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {loading ? (
            <div className="p-6 text-slate-600">Loading charities...</div>
          ) : <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Description
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Total Contributions
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Media
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCharities.map((charity, index) =>
                <motion.tr
                  key={charity.id}
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
                  
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-900">
                        {charity.name}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-slate-700">{charity.description}</td>
                    <td className="py-4 px-6 font-semibold text-emerald-600">
                      INR {Number(charity.total_contributions ?? 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {charity.image_url ? 'Configured' : 'Not set'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end space-x-2">
                        <button
                        onClick={() => handleEdit(charity)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit">
                        
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                        onClick={() => handleDelete(charity.id, charity.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete">
                        
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </tbody>
            </table>
          </div>}
          {filteredCharities.length === 0 &&
          <p className="text-slate-500 text-center py-12">
              No charities found.
            </p>
          }
        </motion.div>
      </div>
    </AdminLayout>);

}