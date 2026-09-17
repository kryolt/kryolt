import { Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UserProvider } from "./context/UserContext";

import DashboardDataProvider from "./context/DashboardDataProvider.jsx";
import { DashboardFilterProvider } from "./context/DashboardFilterContext.jsx";

import PremiumRoute from "./components/auth/PremiumRoute";
import PrivateRoute from "./components/auth/PrivateRoute";
import ScrollToTop from "./components/common/ScrollToTop";

import DashboardLayout from "./layouts/DashboardLayout";

// Public pages
import Home from "./pages/Home";
import Features from "./pages/website/Features";
import About from "./pages/website/About";
import Contact from "./pages/website/Contact";
import Pricing from "./pages/website/Pricing";
import FAQ from "./pages/website/FAQ";
import HelpCenter from "./pages/website/HelpCenter";
import Documentation from "./pages/website/Documentation";

// Legal pages
import PrivacyPolicy from "./pages/website/PrivacyPolicy";
import Terms from "./pages/website/Terms";
import CookiePolicy from "./pages/website/CookiePolicy";
import RefundPolicy from "./pages/website/RefundPolicy";

// Checkout
import CheckoutPage from "./pages/pricing/CheckoutPage";

// Dashboard pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import Upload from "./pages/dashboard/Upload";
import AIInsights from "./pages/dashboard/AIInsights";
import Reports from "./pages/dashboard/Reports";
import Customers from "./pages/dashboard/Customers";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <DashboardDataProvider>
            <DashboardFilterProvider>
              <ScrollToTop />

              <Routes>
                {/* ================= PUBLIC ================= */}
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/docs" element={<Documentation />} />

                {/* ================= LEGAL ================= */}
                <Route
                  path="/privacy"
                  element={<PrivacyPolicy />}
                />
                <Route
                  path="/terms"
                  element={<Terms />}
                />
                <Route
                  path="/cookies"
                  element={<CookiePolicy />}
                />
                <Route
                  path="/refund-policy"
                  element={<RefundPolicy />}
                />

                {/* ================= DASHBOARD ================= */}
                <Route element={<PrivateRoute />}>
                  <Route
                    path="/dashboard"
                    element={<DashboardLayout />}
                  >
                    <Route
                      index
                      element={<DashboardHome />}
                    />

                    <Route
                      path="upload"
                      element={<Upload />}
                    />

                    <Route
                      path="customers"
                      element={<Customers />}
                    />

                    <Route
                      path="settings"
                      element={<Settings />}
                    />

                    <Route
                      path="profile"
                      element={<Profile />}
                    />

                    <Route
                      path="insights"
                      element={
                        <PremiumRoute>
                          <AIInsights />
                        </PremiumRoute>
                      }
                    />

                    <Route
                      path="reports"
                      element={
                        <PremiumRoute>
                          <Reports />
                        </PremiumRoute>
                      }
                    />
                  </Route>
                </Route>
              </Routes>
            </DashboardFilterProvider>
          </DashboardDataProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;