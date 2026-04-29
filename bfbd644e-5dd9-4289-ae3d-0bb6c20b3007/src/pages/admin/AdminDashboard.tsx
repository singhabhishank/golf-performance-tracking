import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CreditCardIcon,
  TrophyIcon,
  HeartIcon,
  EyeIcon,
  CalendarIcon,
  AwardIcon,
  DownloadIcon } from
'lucide-react';
const stats = [
{
  label: 'Total Users',
  value: '12,450',
  change: '+12%',
  trend: 'up'
},
{
  label: 'Total Prize Pool',
  value: '₹1.25 Cr',
  change: '+8%',
  trend: 'up'
},
{
  label: 'Charity Contributions',
  value: '₹45,23,000',
  change: '+15%',
  trend: 'up'
},
{
  label: 'Active Draws',
  value: '2',
  change: '0%',
  trend: 'neutral'
}];

const recentActivities = [
{
  id: '1',
  message: 'New user registered: Mike T.',
  timestamp: '2 hours ago'
},
{
  id: '2',
  message: 'Score submitted: John D. - 38 points',
  timestamp: '3 hours ago'
},
{
  id: '3',
  message: 'Subscription upgraded: Sarah M.',
  timestamp: '5 hours ago'
},
{
  id: '4',
  message: 'Winner proof submitted: Emma L.',
  timestamp: '6 hours ago'
},
{
  id: '5',
  message: 'Charity selection changed: David P.',
  timestamp: '8 hours ago'
},
{
  id: '6',
  message: 'New user registered: Sophie W.',
  timestamp: '10 hours ago'
}];

const quickActions = [
{
  label: 'View Users',
  icon: EyeIcon,
  color: 'bg-blue-600 hover:bg-blue-700',
  link: '/admin/users'
},
{
  label: 'Manage Draws',
  icon: CalendarIcon,
  color: 'bg-emerald-600 hover:bg-emerald-700',
  link: '#'
},
{
  label: 'Verify Winners',
  icon: AwardIcon,
  color: 'bg-amber-600 hover:bg-amber-700',
  link: '/admin/winners'
},
{
  label: 'Export Data',
  icon: DownloadIcon,
  color: 'bg-slate-600 hover:bg-slate-700',
  link: '#'
}];

export function AdminDashboard() {
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
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mb-8">
            Overview of platform statistics and recent activity
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
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
                  delay: 0.1 + index * 0.05
                }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </motion.div>);

          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
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
              delay: 0.3
            }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) =>
              <motion.div
                key={activity.id}
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
                  delay: 0.4 + index * 0.05
                }}
                className="flex items-start justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                
                  <p className="text-slate-700">{activity.message}</p>
                  <span className="text-sm text-slate-500 whitespace-nowrap ml-4">
                    {activity.timestamp}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
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
              delay: 0.4
            }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.a
                    key={action.label}
                    href={action.link}
                    initial={{
                      opacity: 0,
                      scale: 0.95
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1
                    }}
                    transition={{
                      duration: 0.3,
                      delay: 0.5 + index * 0.05
                    }}
                    className={`${action.color} text-white p-6 rounded-xl transition flex flex-col items-center justify-center text-center space-y-3`}>
                    
                    <Icon className="w-8 h-8" />
                    <span className="font-semibold">{action.label}</span>
                  </motion.a>);

              })}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>);

}