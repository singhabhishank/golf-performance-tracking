import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SearchIcon,
  TreesIcon,
  BookOpenIcon,
  ActivityIcon,
  PawPrintIcon,
  WavesIcon,
  UtensilsIcon,
  BrainIcon,
  ZapIcon,
  ArrowRightIcon } from
'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
interface Charity {
  id: string;
  name: string;
  category: string;
  description: string;
  contributionPercentage: number;
  icon: any;
  color: string;
}
const charities: Charity[] = [
{
  id: '1',
  name: 'Green Earth Foundation',
  category: 'Environment',
  description:
  'Protecting forests and wildlife habitats through sustainable conservation programs.',
  contributionPercentage: 15,
  icon: TreesIcon,
  color: 'bg-green-100 text-green-600'
},
{
  id: '2',
  name: 'Kids Education Trust',
  category: 'Education',
  description:
  'Providing quality education and learning resources to underprivileged children.',
  contributionPercentage: 12,
  icon: BookOpenIcon,
  color: 'bg-blue-100 text-blue-600'
},
{
  id: '3',
  name: 'Health For All',
  category: 'Health',
  description:
  'Delivering essential healthcare services to communities in need worldwide.',
  contributionPercentage: 18,
  icon: ActivityIcon,
  color: 'bg-red-100 text-red-600'
},
{
  id: '4',
  name: 'Animal Care Society',
  category: 'Animals',
  description:
  'Rescuing and rehabilitating abandoned and injured animals across the country.',
  contributionPercentage: 10,
  icon: PawPrintIcon,
  color: 'bg-amber-100 text-amber-600'
},
{
  id: '5',
  name: 'Ocean Cleanup Initiative',
  category: 'Environment',
  description:
  'Removing plastic waste from oceans and protecting marine ecosystems.',
  contributionPercentage: 14,
  icon: WavesIcon,
  color: 'bg-cyan-100 text-cyan-600'
},
{
  id: '6',
  name: 'Community Food Bank',
  category: 'Health',
  description:
  'Fighting hunger by providing nutritious meals to families in need.',
  contributionPercentage: 16,
  icon: UtensilsIcon,
  color: 'bg-orange-100 text-orange-600'
},
{
  id: '7',
  name: 'Mental Health Alliance',
  category: 'Health',
  description:
  'Supporting mental health awareness and providing counseling services.',
  contributionPercentage: 13,
  icon: BrainIcon,
  color: 'bg-purple-100 text-purple-600'
},
{
  id: '8',
  name: 'Renewable Energy Fund',
  category: 'Environment',
  description:
  'Investing in clean energy solutions to combat climate change.',
  contributionPercentage: 11,
  icon: ZapIcon,
  color: 'bg-yellow-100 text-yellow-600'
}];

export function PublicCharities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = [
  'All',
  ...Array.from(new Set(charities.map((c) => c.category)))];

  const filteredCharities = charities.filter((charity) => {
    const matchesSearch = charity.name.
    toLowerCase().
    includes(searchQuery.toLowerCase());
    const matchesCategory =
    selectedCategory === 'All' || charity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const featuredCharity = charities[0];
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
              Our Partner Charities
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6">
              Every subscription supports a cause you care about. Explore the
              charities making a difference with GolfLottery members.
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl">
              
              Join & Start Giving
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Charity */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Featured Charity
            </h2>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div
                  className={`w-16 h-16 ${featuredCharity.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  
                  <featuredCharity.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {featuredCharity.name}
                    </h3>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                      {featuredCharity.category}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-3">
                    {featuredCharity.description}
                  </p>
                  <p className="text-sm text-slate-600">
                    Default contribution:{' '}
                    <span className="font-semibold text-emerald-600">
                      {featuredCharity.contributionPercentage}%
                    </span>{' '}
                    of subscription
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search charities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
              
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white">
              
              {categories.map((cat) =>
              <option key={cat} value={cat}>
                  {cat}
                </option>
              )}
            </select>
          </div>

          {filteredCharities.length === 0 ?
          <div className="text-center py-12">
              <p className="text-slate-500">
                No charities found matching your criteria.
              </p>
            </div> :

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCharities.map((charity, index) =>
            <motion.div
              key={charity.id}
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
                duration: 0.5,
                delay: index * 0.05
              }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
              
                  <div
                className={`w-12 h-12 ${charity.color} rounded-lg flex items-center justify-center mb-4`}>
                
                    <charity.icon className="w-6 h-6" />
                  </div>
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {charity.name}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
                      {charity.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {charity.description}
                  </p>
                  <p className="text-sm text-slate-500">
                    Contribution:{' '}
                    <span className="font-semibold text-emerald-600">
                      {charity.contributionPercentage}%
                    </span>
                  </p>
                </motion.div>
            )}
            </div>
          }

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
              Ready to support a charity while playing golf?
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