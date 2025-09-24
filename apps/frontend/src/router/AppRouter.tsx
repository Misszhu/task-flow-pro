import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from 'src/pages/auth/Login';
import Dashboard from 'src/pages/dashboard/Dashboard';
import ProtectedRoute from './ProtectedRoute';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<Login />} />

      {/* 受保护路由 */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* 默认重定向 */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default AppRouter;