import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import MainLayout from "../components/layouts/MainLayout";

// 1. Lazy load components for Phase D Code-splitting
const LoginForm = lazy(() => import("../components/auth/LoginForm"));
const RegisterForm = lazy(() => import("../components/auth/RegisterForm"));
const ForgotPasswordForm = lazy(
  () => import("../components/auth/ForgotPasswordForm"),
);
const ResetPasswordForm = lazy(
  () => import("../components/auth/ResetPasswordForm"),
);

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Opportunities = lazy(() => import("../pages/Opportunities"));
const Tasks = lazy(() => import("../pages/Tasks"));
const Leads = lazy(() => import("../pages/Leads"));
const Payments = lazy(() => import("../pages/Payments"));
const Settings = lazy(() => import("../pages/Settings"));

// Loading fallbacks
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F9F5EE]">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-[#C89A3D] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-light text-sm">
        Đang tải tài nguyên hệ thống...
      </p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <LoginForm />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <RegisterForm />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ForgotPasswordForm />
      </Suspense>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ResetPasswordForm />
      </Suspense>
    ),
  },

  // Protected App Routes inside MainLayout
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin", "team_lead", "sales"]}>
            <Suspense fallback={<LoadingScreen />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "opportunities",
        element: (
          <ProtectedRoute allowedRoles={["admin", "team_lead", "sales"]}>
            <Suspense fallback={<LoadingScreen />}>
              <Opportunities />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "tasks",
        element: (
          <ProtectedRoute allowedRoles={["admin", "team_lead", "sales"]}>
            <Suspense fallback={<LoadingScreen />}>
              <Tasks />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "leads",
        element: (
          <ProtectedRoute
            allowedRoles={["admin", "team_lead", "sales", "accountant"]}
          >
            <Suspense fallback={<LoadingScreen />}>
              <Leads />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "payments",
        element: (
          <ProtectedRoute
            allowedRoles={["admin", "team_lead", "sales", "accountant"]}
          >
            <Suspense fallback={<LoadingScreen />}>
              <Payments />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Suspense fallback={<LoadingScreen />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 404 Wildcard redirect
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
