import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ProfilePage from '@/features/auth/pages/ProfilePage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import AssetListPage from '@/features/assets/pages/AssetListPage';
import AssetDetailsPage from '@/features/assets/pages/AssetDetailsPage';
import BorrowRequestListPage from '@/features/assets/pages/BorrowRequestListPage';
import EquipmentServiceCounter from '@/features/assets/pages/EquipmentServiceCounter';
import ToolsetListPage from '@/features/assets/pages/ToolsetListPage';
import SparePartListPage from '@/features/assets/pages/SparePartListPage';
import MaintenanceSchedulePage from '@/features/maintenance/pages/MaintenanceSchedulePage';
import MaintenanceTicketPage from '@/features/maintenance/pages/MaintenanceTicketPage';
import FailureTicketPage from '@/features/maintenance/pages/FailureTicketPage';
import RepairTicketPage from '@/features/maintenance/pages/RepairTicketPage';
import CreateTaskPage from '@/features/tasks/pages/CreateTaskPage';
import TaskProgressPage from '@/features/tasks/pages/TaskProgressPage';
import MyTasksPage from '@/features/tasks/pages/MyTasksPage';
import UserManagementPage from '@/features/admin/pages/UserManagementPage';
import RoleManagementPage from '@/features/admin/pages/RoleManagementPage';
import ActivityLogPage from '@/features/admin/pages/ActivityLogPage';
import AccessManagementPage from '@/features/admin/pages/AccessManagementPage';
import AssetReportPage from '@/features/reports/pages/AssetReportPage';
import MaintenanceReportPage from '@/features/reports/pages/MaintenanceReportPage';
import TaskReportPage from '@/features/reports/pages/TaskReportPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/my-tasks',
    element: <MyTasksPage />,
  },
  {
    path: '/assets',
    element: <AssetListPage />,
  },
  {
    path: '/assets/:id',
    element: <AssetDetailsPage />,
  },
  {
    path: '/toolsets',
    element: <ToolsetListPage />,
  },
  {
    path: '/spare-parts',
    element: <SparePartListPage />,
  },
  {
    path: '/maintenance',
    children: [
      { path: 'schedule', element: <MaintenanceSchedulePage /> },
      { path: 'tickets', element: <MaintenanceTicketPage /> },
      { path: 'failures', element: <FailureTicketPage /> },
      { path: 'repairs', element: <RepairTicketPage /> },
    ]
  },
  {
    path: '/tasks',
    children: [
      { path: 'create', element: <CreateTaskPage /> },
      { path: 'progress', element: <TaskProgressPage /> },
    ]
  },
  {
    path: '/admin',
    children: [
      { path: 'users', element: <UserManagementPage /> },
      { path: 'roles', element: <RoleManagementPage /> },
      { path: 'activities', element: <ActivityLogPage /> },
      { path: 'access', element: <AccessManagementPage /> },
    ]
  },
  {
    path: '/reports',
    children: [
      { path: 'assets', element: <AssetReportPage /> },
      { path: 'maintenance', element: <MaintenanceReportPage /> },
      { path: 'tasks', element: <TaskReportPage /> },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
