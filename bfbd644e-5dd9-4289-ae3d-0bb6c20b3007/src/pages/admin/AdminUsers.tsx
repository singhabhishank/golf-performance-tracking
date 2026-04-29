import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { motion } from 'framer-motion';
import { SearchIcon, EditIcon, TrashIcon } from 'lucide-react';
import { fetchAdminUsers, type AdminUser } from '../../lib/adminService';

interface UserView {
  id: string;
  email: string;
  status: 'Active' | 'Inactive';
  joined: string;
}

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [users, setUsers] = useState<UserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const rows: AdminUser[] = await fetchAdminUsers();
        if (cancelled) return;
        setUsers(
          rows.map((u) => ({
            id: u.id,
            email: u.email ?? '(no email)',
            status: 'Active',
            joined: u.created_at,
          }))
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter((u) => {
      const matchesSearch = u.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, users]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
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
            User Management
          </h1>
          <p className="text-slate-600 mb-8">
            Manage all registered users and their subscriptions
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white">
              
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </motion.div>

        {/* Users Table */}
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
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Joined
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">
                    User ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-8 px-6 text-slate-500" colSpan={4}>
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
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
                      
                      <td className="py-4 px-6 text-slate-600">{user.email}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(user.status)}`}>
                          
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {new Date(user.joined).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-slate-500">
                          {user.id}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 &&
          <p className="text-slate-500 text-center py-12">
              No users found matching your criteria.
            </p>
          }
        </motion.div>
      </div>
    </AdminLayout>);

}