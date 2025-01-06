import { lazy } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import RouteGuard from "../components/auth/RouteGuard";
import { UserType } from "../types/auth.types";

const SignInPage = lazy(() => import("../pages/auth/SignInPage"));
const SignUpPage = lazy(() => import("../pages/auth/SignUpPage"));
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("../pages/creative/DashboardPage"));
const VideosPage = lazy(() => import("../pages/creative/VideosPage"));
const EventsPage = lazy(() => import("../pages/creative/EventsPageCreative"));
const AnalyticsPage = lazy(() => import("../pages/creative/AnalyticsPage"));
const SettingsPage = lazy(() => import("../pages/creative/SettingsPage"));
const MemoryManagerPage = lazy(
  () => import("../pages/creative/MemoryManagerPage")
);
const SearchPage = lazy(() => import("../pages/fan/SearchPage"));
const EventsPageFan = lazy(() => import("../pages/fan/EventsPageFan"));

export const routes = [
  {
    path: "/",
    element: <Navigate to="/auth/signin" replace />,
  },
  {
    path: "/auth",
    children: [
      {
        path: "signin",
        element: <SignInPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: "/creative",
    element: (
      <RouteGuard allowedUserTypes={[UserType.CREATIVE]}>
        <MainLayout />
      </RouteGuard>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "videos",
        element: <VideosPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "memories",
        element: <MemoryManagerPage />,
      },
    ],
  },
  {
    path: "/fan",
    element: (
      <RouteGuard allowedUserTypes={[UserType.FAN, UserType.CREATIVE]}>
        <MainLayout />
      </RouteGuard>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="search" replace />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "events",
        element: <EventsPageFan />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth/signin" replace />,
  },
];
