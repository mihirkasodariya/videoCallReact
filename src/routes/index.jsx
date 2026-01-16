import LandingPage from "../pages/LandingPage";
import React from 'react';
import VideoCallPage from "../pages/VideoCall";


export const ROUTES = [

];
export const REJECT_ROUTES = [
  { path: "/", exact: true, component: <LandingPage /> },
  { path: "/video-call", exact: true, component: <VideoCallPage /> },
  // { path: "/register", exact: true, component: <RegisterPage /> },
  // { path: "/login", exact: true, component: <SignUpPage /> },
  // { path: "/pricing", exact: true, component: <PricingPage /> },
  // { path: "/payment-method", exact: true, component: <PaymentPage /> },
  // { path: "/privacy-policy", exact: true, component: <PrivacyPolicyPage /> },
  // { path: "/terms-of-service", exact: true, component: <TermsOfServicePage /> },
  // { path: "/refund-policy", exact: true, component: <RefundPolicyPage /> },
  // { path: "/cookie-policy", exact: true, component: <CookiePolicyPage /> },
  // { path: "*", exact: false, component: <NotFoundPage /> },

];

export const REQUIRED_ROUTES = [
  // { path: "/plan-pricing", exact: true, component: < PlanPricingPage /> },
  // { path: "/profile", exact: true, component: <ProfilePage /> },
  // { path: "/change-password", exact: true, component: <ChangePasswordPage /> },
  // { path: "/dashboard", exact: true, component: <DashboardPage /> },
  // { path: "/websites", exact: true, component: <WebsitesPage /> },
  // { path: "/link-exchange", exact: true, component: <LinkExchangePage /> },
  // { path: "/link-tracking", exact: true, component: <LinkTrackingPage /> },
  // { path: "/chat", exact: true, component: <ChatPage /> },
  // { path: "/chat/:chatId", exact: true, component: <ChatPage /> },
  // { path: "/referrals", exact: true, component: <ReferralsPage /> },
  // { path: "/support", exact: true, component: <SupportPage /> },
  // { path: "/my-exchange", exact: true, component: <MyExchangePage /> },
  // { path: "/network", exact: true, component: <NetworkListPage /> },
  // { path: "/network-details/:id", exact: true, component: <NetworkDetails /> },
  // { path: "/my-exchange/viewdetails/:taskId/:id", exact: true, component: <ViewExchangeDetails /> },
  // { path: "/team-management", exact: true, component: <TeamManagementPage /> },
];