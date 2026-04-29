import { AdminLayout } from '../../components/AdminLayout';
import { motion } from 'framer-motion';
import { CalendarIcon, CreditCardIcon, HeartIcon, TrophyIcon, UsersIcon } from 'lucide-react';
import { fetchAdminReports, type ReportsResponse } from '../../lib/adminService';

export function AdminReports() {
  const [data, setData] = React.useState<ReportsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        setData(await fetchAdminReports());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const summary = data?.summary;
  const subscription = data?.subscriptionBreakdown;

  const summaryStats = [
    {
      label: 'Total Users',
      value: String(summary?.totalUsers ?? 0),
      icon: UsersIcon,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Total Prize Pool',
      value: `INR ${(summary?.totalPrizePool ?? 0).toFixed(2)}`,
      icon: TrophyIcon,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Charity Contributions',
      value: `INR ${(summary?.totalCharity ?? 0).toFixed(2)}`,
      icon: HeartIcon,
      color: 'bg-rose-100 text-rose-700',
    },
    {
      label: 'Active Subscriptions',
      value: String(summary?.activeSubscriptions ?? 0),
      icon: CreditCardIcon,
      color: 'bg-indigo-100 text-indigo-700',
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports & Analytics</h1>
          <p className="text-slate-600 mb-4">Live data from users, draws, subscriptions, and donations.</p>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        </motion.div>

        {loading ? (
          <p className="text-slate-600">Loading reports...</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {summaryStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-green-600">Live</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <CreditCardIcon className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold text-slate-900">Subscription Breakdown</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-700 font-medium mb-1">Monthly</p>
                  <p className="text-2xl font-bold text-emerald-600">{subscription?.monthly ?? 0}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-medium mb-1">Yearly</p>
                  <p className="text-2xl font-bold text-blue-600">{subscription?.yearly ?? 0}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 font-medium mb-1">Inactive</p>
                  <p className="text-2xl font-bold text-slate-600">{subscription?.inactive ?? 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-900">Draw Statistics</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Month</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Prize Pool</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Winners</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.drawStats ?? []).map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {new Date(row.month).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{row.status}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">
                          INR {Number(row.prizePool).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{row.winners}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <HeartIcon className="w-6 h-6 text-rose-600" />
                <h2 className="text-xl font-semibold text-slate-900">Charity Contribution Totals</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Charity</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Total Contributed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.charityStats ?? []).map((charity) => (
                      <tr key={charity.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-900">{charity.name}</td>
                        <td className="py-3 px-4 font-semibold text-rose-600">
                          INR {Number(charity.totalContributed).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}