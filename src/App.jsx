import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import PartnerLogin from "./pages/partner/PartnerLogin";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import Admin from "./pages/Admin";
import KnowFounders from "./pages/KnowFounders";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsConditions from "./pages/legal/TermsConditions";
import RefundPolicy from "./pages/legal/RefundPolicy";
import Blogs from "./pages/Blogs";
import Faq from "./pages/Faq";
import CartBar from "./components/CartBar";
import ProtectedRoute from "./components/ProtectedRoute";
import SathiCareBot from "./components/SathiCareBot";

function App() {
  return (
    <BrowserRouter>
      <CartBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/founders" element={<KnowFounders />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/refund-cancellation-policy" element={<RefundPolicy />} />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute role="customer">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/dashboard"
          element={
            <ProtectedRoute role="partner">
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
      <SathiCareBot phone="+91 94517 64251" />
    </BrowserRouter>
  );
}

export default App;
