import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { UserIcon, SaveIcon, CheckCircleIcon } from 'lucide-react';
const charities = [
'Green Earth Foundation',
'Kids Education Trust',
'Health For All',
'Animal Care Society',
'Ocean Cleanup Initiative',
'Community Food Bank',
'Mental Health Alliance',
'Renewable Energy Fund'];

export function Profile() {
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+44 7700 900000',
    selectedCharity: 'Green Earth Foundation',
    contributionPercentage: 15
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    contributionPercentage: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      contributionPercentage: ''
    };
    let isValid = true;
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }
    if (formData.contributionPercentage < 10) {
      newErrors.contributionPercentage =
      'Contribution percentage must be at least 10%';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Simulate save
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
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
            Profile & Settings
          </h1>
          <p className="text-slate-600 mb-8">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Success Alert */}
        {showSuccess &&
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -20
          }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
          
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-green-900 font-semibold">
                Changes saved successfully!
              </p>
              <p className="text-green-700 text-sm">
                Your profile has been updated.
              </p>
            </div>
          </motion.div>
        }

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
          
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Account Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  fullName: e.target.value
                })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.fullName ? 'border-red-500' : 'border-slate-300'}`}
                placeholder="Enter your full name" />
              
              {errors.fullName &&
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              }
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                placeholder="Enter your email" />
              
              {errors.email &&
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              }
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value
                })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${errors.phone ? 'border-red-500' : 'border-slate-300'}`}
                placeholder="Enter your phone number" />
              
              {errors.phone &&
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              }
            </div>

            {/* Selected Charity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Selected Charity
              </label>
              <select
                value={formData.selectedCharity}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  selectedCharity: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white">
                
                {charities.map((charity) =>
                <option key={charity} value={charity}>
                    {charity}
                  </option>
                )}
              </select>
            </div>

            {/* Contribution Percentage Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Charity Contribution Percentage
                </label>
                <span className="text-2xl font-bold text-emerald-600">
                  {formData.contributionPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={formData.contributionPercentage}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  contributionPercentage: parseInt(e.target.value)
                })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
              
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>10% (Minimum)</span>
                <span>50% (Maximum)</span>
              </div>
              {errors.contributionPercentage &&
              <p className="text-red-500 text-sm mt-1">
                  {errors.contributionPercentage}
                </p>
              }
              <p className="text-sm text-slate-600 mt-2">
                This percentage of your subscription will go to your selected
                charity.
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center space-x-2">
              
              <SaveIcon className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>);

}