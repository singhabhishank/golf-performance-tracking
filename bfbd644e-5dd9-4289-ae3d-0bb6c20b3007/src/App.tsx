import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { Dashboard } from './pages/Dashboard';
import { Scores } from './pages/Scores';
import { Charities } from './pages/Charities';
import { Draws } from './pages/Draws';
import { Subscription } from './pages/Subscription';
import { Profile } from './pages/Profile';
import { WinnerProof } from './pages/WinnerProof';
import { PublicCharities } from './pages/PublicCharities';
import { PublicDraws } from './pages/PublicDraws';
import { PublicPricing } from './pages/PublicPricing';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminWinners } from './pages/admin/AdminWinners';
import { AdminDraws } from './pages/admin/AdminDraws';
import { AdminCharities } from './pages/admin/AdminCharities';
import { AdminReports } from './pages/admin/AdminReports';
export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/explore-charities" element={<PublicCharities />} />
          <Route path="/draw-results" element={<PublicDraws />} />
          <Route path="/pricing" element={<PublicPricing />} />

          {/* Registered Subscriber Pages */}
          <Route
            path="/dashboard"
            element={
            <ProtectedRoute allowedRoles={['subscriber', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            } />
          
          <Route
            path="/scores"
            element={
            <ProtectedRoute allowedRoles={['subscriber', 'admin']}>
                <Scores />
              </ProtectedRoute>
            } />
          
          <Route
            path="/charities"
            element={
            <ProtectedRoute allowedRoles={['subscriber', 'admin']}>
                <Charities />
              </ProtectedRoute>
            } />
          
          <Route
            path="/draws"
            element={
            <ProtectedRoute allowedRoles={['subscriber', 'admin']}>
                <Draws />
              </ProtectedRoute>
            } />
          
          <Route
            path="/subscription"
            element={
            <ProtectedRoute allowedRoles={['subscriber', 'admin']}>
                <Subscription />
              </ProtectedRoute>
            } />
          
          <Route
            path="/profile"
            element={
            <ProtectedRoute allowedRoles={['subscriber', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } />
          
          <Route
            path="/winner-proof"
            element={
            <ProtectedRoute allowedRoles={['subscriber', 'admin']}>
                <WinnerProof />
              </ProtectedRoute>
            } />
          

          {/* Administrator Pages */}
          <Route
            path="/admin"
            element={
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          
          <Route
            path="/admin/users"
            element={
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
          
          <Route
            path="/admin/winners"
            element={
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminWinners />
              </ProtectedRoute>
            } />
          
          <Route
            path="/admin/draws"
            element={
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminDraws />
              </ProtectedRoute>
            } />
          
          <Route
            path="/admin/charities"
            element={
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminCharities />
              </ProtectedRoute>
            } />
          
          <Route
            path="/admin/reports"
            element={
            <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            } />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>);

}