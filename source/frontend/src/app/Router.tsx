import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ProfilePage from '@/features/auth/pages/ProfilePage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import AssetListPage from '@/features/assets/pages/AssetListPage';
import AssetHealthPage from '@/features/assets/pages/AssetHealthPage';
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
import StudentPortal from '@/features/student/pages/StudentPortal';
import StudentAssetListPage from '@/features/student/pages/StudentAssetListPage';
import BlockchainAuditPage from '@/features/admin/pages/BlockchainAuditPage';
import MaintenanceReportPage from '@/features/reports/pages/MaintenanceReportPage';
import TaskReportPage from '@/features/reports/pages/TaskReportPage';
import AuthGuard from '@/components/common/AuthGuard';
import StudentLayout from '@/components/layout/StudentLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import TimelineManagementPage from '@/features/communications/pages/TimelineManagementPage';
import AnnouncementManagementPage from '@/features/communications/pages/AnnouncementManagementPage';
import SurveyManagementPage from '@/features/communications/pages/SurveyManagementPage';

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
    element: <AuthGuard allowedRoles={[0, 1]} />, // Admin & Staff
    children: [
      {
        element: <AdminLayout><Outlet /></AdminLayout>, 
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/profile', element: <ProfilePage /> },
          {
            path: '/assets',
            children: [
              { path: '', element: <AssetListPage /> },
              { path: ':id', element: <AssetDetailsPage /> },
              { path: 'counter', element: <EquipmentServiceCounter /> },
              { path: 'health', element: <AssetHealthPage /> },
            ]
          },
          { path: '/toolsets', element: <ToolsetListPage /> },
          { path: '/spare-parts', element: <SparePartListPage /> },
          {
            path: '/maintenance',
            children: [
              { path: 'tickets', element: <MaintenanceTicketPage /> },
              { path: 'failures', element: <FailureTicketPage /> },
              { path: 'repairs', element: <RepairTicketPage /> },
            ]
          },
          { path: '/my-tasks', element: <MyTasksPage /> },
          {
            element: <AuthGuard allowedRoles={[0]} />,
            children: [
              { path: '/assets/requests', element: <BorrowRequestListPage /> },
              { path: '/maintenance/schedule', element: <MaintenanceSchedulePage /> },
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
                  { path: 'blockchain', element: <BlockchainAuditPage /> },
                ]
              }
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
          { path: '/timeline', element: <TimelineManagementPage /> },
          { path: '/announcements', element: <AnnouncementManagementPage /> },
          { path: '/surveys', element: <SurveyManagementPage /> },
        ]
      }
    ]
  },
  {
    element: <AuthGuard allowedRoles={[0, 1, 2, 3]} />, 
    children: [
      {
        element: <StudentLayout><Outlet /></StudentLayout>, 
        children: [
          { path: '/student/portal', element: <StudentPortal /> },
          // Students can also see assets via StudentLayout
          { path: '/student/assets', element: <StudentAssetListPage /> },
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
