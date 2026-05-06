import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageSeo } from "../hooks/usePageSeo";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import {
  SATHI_MERCHANT_NAME,
  SATHI_UPI_ID,
  buildQrCodeUrl,
  buildUpiUri,
  buildWhatsAppSupportUrl,
  isLikelyAndroid,
  launchUpiIntent,
  upiApps
} from "../utils/upiPayment";

const initialPatientForm = {
  customerName: "",
  customerPhone: "",
  patientName: "",
  patientPhone: "",
  patientAge: "",
  patientAddress: "",
  patientIssues: "",
  city: "",
  state: "",
  pincode: "",
  landmark: ""
};

export default function Checkout() {
  usePageSeo({
    title: "UPI Checkout | Sathi Homecare",
    description: "Complete your Sathi Homecare booking with a secure UPI payment flow, QR fallback, UTR submission and WhatsApp support."
  });

  const { cart, cartTotal, clearCart, addToCart, removeFromCart } = useCart();
  const { customer, addBooking, createPaymentOrder, verifyPayment } = useAuth();
  const [patientForm, setPatientForm] = useState(initialPatientForm);
  const [address, setAddress] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState("idle");
  const [orderError, setOrderError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [pendingBooking, setPendingBooking] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [selectedApp, setSelectedApp] = useState(upiApps[0]);
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);

  const tax = useMemo(() => Math.round(cartTotal * 0.05), [cartTotal]);
  const convenience = cart.length ? 99 : 0;
  const grandTotal = cartTotal + tax + convenience;
  const android = isLikelyAndroid();
  const activeUpiUri = paymentIntent?.upiUri || buildUpiUri({
    amount: paymentIntent?.amount || grandTotal,
    reference: paymentIntent?.gatewayOrderId,
    note: paymentIntent?.transactionNote
  });
  const qrCodeUrl = paymentIntent?.qrCodeUrl || buildQrCodeUrl(activeUpiUri);

  useEffect(() => {
    if (!customer) return;
    setPatientForm((prev) => ({
      ...prev,
      customerName: prev.customerName || customer.name || "",
      customerPhone: prev.customerPhone || customer.phone || ""
    }));
  }, [customer]);

  const handleInputChange = (field, value) => {
    setPatientForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateBookingDetails = () => {
    const requiredFields = [
      patientForm.customerName,
      patientForm.customerPhone,
      patientForm.patientName,
      patientForm.patientPhone,
      patientForm.patientAge,
      patientForm.patientAddress,
      patientForm.patientIssues,
      patientForm.city,
      patientForm.state,
      patientForm.pincode
    ];

    if (!cart.length || requiredFields.some((value) => !value?.trim?.())) {
      return "Please complete cart and fill all required details.";
    }
    if (cart.length > 1) {
      return "Backend currently supports one service per booking. Please keep only one service in the cart for checkout.";
    }
    if (!customer) {
      return "Please login before placing your booking.";
    }
    if (!policyAccepted) {
      return "Please accept the Privacy Policy, Terms & Conditions, and Refund Policy before placing the booking.";
    }
    if (!/^\d{10}$/.test(patientForm.customerPhone.trim()) || !/^\d{10}$/.test(patientForm.patientPhone.trim())) {
      return "Customer and patient phone numbers must be 10 digits.";
    }
    if (!/^\d{6}$/.test(patientForm.pincode.trim())) {
      return "Pincode must be 6 digits.";
    }
    const patientAge = Number(patientForm.patientAge);
    if (!Number.isFinite(patientAge) || patientAge <= 0) {
      return "Please enter a valid patient age.";
    }
    return "";
  };

  const handlePlaceOrder = async () => {
    const validationError = validateBookingDetails();
    if (validationError) {
      setOrderError(validationError);
      return;
    }

    setOrderLoading(true);
    setOrderError("");
    setOrderMessage("Creating your booking securely...");
    setPaymentStep("creating-booking");

    try {
      const selectedService = cart[0];
      const booking = pendingBooking || await addBooking({
        serviceId: selectedService?.id,
        service: selectedService?.name || "",
        addressLineOne: address || patientForm.patientAddress,
        addressLineTwo: patientForm.landmark,
        city: patientForm.city,
        state: patientForm.state,
        pincode: patientForm.pincode,
        landmark: patientForm.landmark,
        patientName: patientForm.patientName,
        patientPhone: patientForm.patientPhone,
        patientAge: patientForm.patientAge,
        patientAddress: patientForm.patientAddress,
        patientIssues: patientForm.patientIssues
      });

      setPendingBooking(booking);
      setPaymentStep("payment-ready");
      setOrderMessage("Choose a UPI app or scan the QR code to pay.");
      const intent = await createPaymentOrder(booking.id);
      setPaymentIntent(intent);
    } catch (err) {
      setPaymentStep("failed");
      setOrderError(err?.message || "Failed to place booking. Please try again.");
      setOrderMessage("");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleOpenUpiApp = (app) => {
    setSelectedApp(app);
    setPaymentStep("awaiting-payment");
    setOrderMessage(`Opening ${app.name}. Return here after payment and enter your UTR.`);
    launchUpiIntent(activeUpiUri, app);
    window.setTimeout(() => {
      setOrderMessage(`If ${app.name} did not open, scan the QR code or copy the UPI ID below.`);
    }, 1800);
  };

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(paymentIntent?.upiId || SATHI_UPI_ID);
      setOrderMessage("UPI ID copied. Use it in any UPI app to complete payment.");
    } catch {
      setOrderMessage(`Copy this UPI ID manually: ${paymentIntent?.upiId || SATHI_UPI_ID}`);
    }
  };

  const handleConfirmPayment = async (event) => {
    event.preventDefault();
    const cleanUtr = utrNumber.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9]{8,24}$/.test(cleanUtr)) {
      setOrderError("Enter a valid UPI transaction ID or UTR.");
      return;
    }
    if (screenshot && screenshot.size > 5 * 1024 * 1024) {
      setOrderError("Payment screenshot must be 5 MB or smaller.");
      return;
    }

    setOrderLoading(true);
    setOrderError("");
    setOrderMessage("Submitting payment proof and confirming your booking...");
    setPaymentStep("verifying");

    try {
      const response = await verifyPayment({
        bookingId: pendingBooking.id,
        gatewayOrderId: paymentIntent?.gatewayOrderId,
        utrNumber: cleanUtr,
        paymentApp: selectedApp?.name || "UPI",
        screenshot
      });
      const confirmed = {
        ...pendingBooking,
        amount: response?.amount || paymentIntent?.amount || grandTotal,
        utrNumber: response?.utrNumber || cleanUtr,
        paymentApp: selectedApp?.name || "UPI"
      };
      setSuccessBooking(confirmed);
      setPaymentStep("success");
      setOrderMessage("");
      setPendingBooking(null);
      setPaymentIntent(null);
      clearCart();
    } catch (err) {
      setPaymentStep("payment-ready");
      setOrderError(err?.message || "Payment proof submission failed. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!successBooking) return;
    const lines = [
      "SATHIHOMECARE Booking Receipt",
      `Booking ID: SHC-${successBooking.id}`,
      `Service: ${successBooking.service}`,
      `Amount Paid: Rs. ${successBooking.amount}`,
      `Payment App: ${successBooking.paymentApp}`,
      `UTR: ${successBooking.utrNumber}`,
      `Patient: ${patientForm.patientName}`,
      `Contact: ${patientForm.customerPhone}`,
      `Generated At: ${new Date().toLocaleString("en-IN")}`
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `sathi-receipt-${successBooking.id}.txt`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  if (successBooking) {
    return (
      <div style={pageStyle} className="page-padding upi-checkout-page">
        <a className="floating-whatsapp" href={buildWhatsAppSupportUrl(successBooking.id, successBooking.utrNumber)} target="_blank" rel="noreferrer">
          WhatsApp Support
        </a>
        <section style={successCard}>
          <p style={sectionEyebrow}>Payment submitted</p>
          <h1 style={successTitle}>Your care booking is confirmed</h1>
          <p style={successText}>
            We have recorded your UPI transaction details and sent the booking confirmation email if email delivery is configured.
          </p>
          <div style={successDetails}>
            <span>Booking ID: #{successBooking.id}</span>
            <span>Service: {successBooking.service}</span>
            <span>Amount paid: Rs. {successBooking.amount}</span>
            <span>Payment app: {successBooking.paymentApp}</span>
            <span>UTR: {successBooking.utrNumber}</span>
            <span>Patient: {patientForm.patientName}</span>
          </div>
          <div style={successActions}>
            <button type="button" onClick={handleDownloadReceipt} style={secondaryButton}>Download Receipt</button>
            <a href={buildWhatsAppSupportUrl(successBooking.id, successBooking.utrNumber)} target="_blank" rel="noreferrer" style={whatsappButton}>
              Contact Support on WhatsApp
            </a>
            <Link to="/user/dashboard" style={primaryLink}>View Dashboard</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="page-padding upi-checkout-page">
      <div style={shellStyle}>
        <div style={headerRow}>
          <div>
            <p style={sectionEyebrow}>SATHI UPI Checkout</p>
            <h1 style={pageTitle}>Complete your healthcare booking</h1>
            <p style={pageSubtitle}>Pay directly to {SATHI_MERCHANT_NAME} with UPI, then submit your UTR for confirmation.</p>
          </div>
          <Link to="/services" style={secondaryLink}>Add more services</Link>
        </div>

        {!customer ? (
          <div style={alertBox}>
            <p style={{ margin: 0, fontWeight: 800, color: "#102542" }}>Please login before booking a service.</p>
            <p style={{ margin: "6px 0 0", color: "#4a5b72" }}>You need an account to place bookings and view payment status later. <Link to="/login">Go to login</Link>.</p>
          </div>
        ) : null}

        <div style={checkoutGrid} className="checkout-grid">
          <div style={leftColumn}>
            <section style={cardStyle}>
              <h2 style={cardTitle}>Customer and Patient Details</h2>
              <div style={formGrid}>
                <Field label="Customer Name" value={patientForm.customerName} onChange={(value) => handleInputChange("customerName", value)} />
                <Field label="Customer Phone" value={patientForm.customerPhone} onChange={(value) => handleInputChange("customerPhone", value)} />
                <Field label="Patient Name" value={patientForm.patientName} onChange={(value) => handleInputChange("patientName", value)} />
                <Field label="Patient Phone" value={patientForm.patientPhone} onChange={(value) => handleInputChange("patientPhone", value)} />
                <Field label="Patient Age" value={patientForm.patientAge} onChange={(value) => handleInputChange("patientAge", value)} />
                <Field label="Patient Address" value={patientForm.patientAddress} onChange={(value) => handleInputChange("patientAddress", value)} />
              </div>
              <label style={labelStyle}>
                Patient Issues
                <textarea
                  value={patientForm.patientIssues}
                  onChange={(event) => handleInputChange("patientIssues", event.target.value)}
                  placeholder="Describe care needs, recovery details, health concerns, or specific instructions."
                  style={textareaStyle}
                />
              </label>
            </section>

            <section style={cardStyle}>
              <h2 style={cardTitle}>Service Address</h2>
              <div style={formGrid}>
                <Field label="Address" value={address} onChange={setAddress} />
                <Field label="City" value={patientForm.city} onChange={(value) => handleInputChange("city", value)} />
                <Field label="State" value={patientForm.state} onChange={(value) => handleInputChange("state", value)} />
                <Field label="Pincode" value={patientForm.pincode} onChange={(value) => handleInputChange("pincode", value)} />
              </div>
              <Field label="Landmark (optional)" value={patientForm.landmark} onChange={(value) => handleInputChange("landmark", value)} />
            </section>

            {paymentIntent ? (
              <PaymentPanel
                android={android}
                selectedApp={selectedApp}
                paymentIntent={paymentIntent}
                activeUpiUri={activeUpiUri}
                qrCodeUrl={qrCodeUrl}
                utrNumber={utrNumber}
                screenshot={screenshot}
                orderLoading={orderLoading}
                onSelectApp={handleOpenUpiApp}
                onCopyUpiId={handleCopyUpiId}
                onUtrChange={setUtrNumber}
                onScreenshotChange={setScreenshot}
                onConfirmPayment={handleConfirmPayment}
              />
            ) : (
              <section style={paymentIntroCard}>
                <p style={sectionEyebrow}>Direct UPI Payment</p>
                <h2 style={{ margin: "8px 0 0", fontSize: "28px", color: "#102542" }}>No payment gateway popup</h2>
                <p style={{ margin: "12px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
                  After your booking is saved, we will show Google Pay, PhonePe, Paytm, BHIM, QR scan, and copyable UPI ID options.
                </p>
              </section>
            )}
          </div>

          <aside style={summaryColumn} className="summary-column">
            <section style={cardStyle}>
              <h2 style={cardTitle}>Booking Summary</h2>
              {cart.length ? (
                <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={cartItem}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", color: "#102542" }}>{item.name}</h3>
                        <p style={{ margin: "6px 0 0", color: "#5b6878" }}>Rs. {item.price} each</p>
                      </div>
                      <div style={quantityBox}>
                        <button type="button" onClick={() => removeFromCart(item.id)} style={qtyButton}>-</button>
                        <span style={{ fontWeight: 800 }}>{item.quantity}</span>
                        <button type="button" onClick={() => addToCart(item)} style={qtyButton}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: "14px 0 0", color: "#5b6878" }}>No items selected yet.</p>
              )}

              <div style={totalsWrap}>
                <div style={totalRow}><span>Subtotal</span><span>Rs. {cartTotal}</span></div>
                <div style={totalRow}><span>Service tax</span><span>Rs. {tax}</span></div>
                <div style={totalRow}><span>Convenience fee</span><span>Rs. {convenience}</span></div>
                <div style={{ ...totalRow, fontWeight: 900, fontSize: "20px", color: "#102542" }}><span>Total</span><span>Rs. {grandTotal}</span></div>
              </div>

              <label style={consentCard}>
                <input type="checkbox" checked={policyAccepted} onChange={(event) => setPolicyAccepted(event.target.checked)} style={consentCheckbox} />
                <span style={{ color: "#475569", lineHeight: 1.7 }}>
                  I agree to the <Link to="/privacy-policy" target="_blank" rel="noreferrer" style={consentLink}>Privacy Policy</Link>,{" "}
                  <Link to="/terms-conditions" target="_blank" rel="noreferrer" style={consentLink}>Terms & Conditions</Link>, and{" "}
                  <Link to="/refund-cancellation-policy" target="_blank" rel="noreferrer" style={consentLink}>Refund & Cancellation Policy</Link>.
                </span>
              </label>

              {orderMessage ? <p style={infoMessage}>{orderMessage}</p> : null}
              {paymentStep !== "idle" ? (
                <div style={statusCard}>
                  <span style={statusLabel}>Payment Status</span>
                  <strong style={{ color: "#102542" }}>{getPaymentStepLabel(paymentStep)}</strong>
                </div>
              ) : null}
              {orderError ? <p style={errorMessage}>{orderError}</p> : null}

              {!paymentIntent ? (
                <button type="button" onClick={handlePlaceOrder} disabled={orderLoading || !customer} style={{
                  ...placeOrderButton,
                  opacity: orderLoading || !customer ? 0.65 : 1,
                  cursor: orderLoading || !customer ? "not-allowed" : "pointer"
                }}>
                  {orderLoading ? "Processing..." : pendingBooking ? "Resume UPI Payment" : customer ? "Place Order" : "Login to place order"}
                </button>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PaymentPanel({
  android,
  paymentIntent,
  activeUpiUri,
  qrCodeUrl,
  utrNumber,
  screenshot,
  orderLoading,
  onSelectApp,
  onCopyUpiId,
  onUtrChange,
  onScreenshotChange,
  onConfirmPayment
}) {
  return (
    <section style={paymentPanel}>
      <div style={paymentPanelHeader}>
        <div>
          <p style={sectionEyebrow}>Pay Rs. {paymentIntent.amount}</p>
          <h2 style={{ margin: "8px 0 0", fontSize: "30px", color: "#102542" }}>Choose your UPI app</h2>
          <p style={{ margin: "10px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
            {android ? "Tap a payment app to open it directly." : "Scan the QR from your phone, or open this page on mobile for direct app launch."}
          </p>
        </div>
        <div style={trustPill}>UPI ID: {paymentIntent.upiId || SATHI_UPI_ID}</div>
      </div>

      <div style={upiAppGrid}>
        {upiApps.map((app) => (
          <button key={app.id} type="button" onClick={() => onSelectApp(app)} style={{ ...upiAppButton, borderColor: app.accent }}>
            <span style={{ ...upiIcon, background: app.accent }}>{app.icon}</span>
            <span>
              <strong>{app.name}</strong>
              <small>Open payment app</small>
            </span>
          </button>
        ))}
      </div>

      <div style={fallbackGrid}>
        <div style={qrCard}>
          <img src={qrCodeUrl} alt="UPI QR code for SATHIHOMECARE payment" style={qrImage} />
          <p style={{ margin: "12px 0 0", color: "#475569", lineHeight: 1.6 }}>Scan with any UPI app on your phone.</p>
        </div>
        <div style={manualCard}>
          <p style={sectionEyebrow}>Fallback Payment</p>
          <h3 style={{ margin: "8px 0 0", color: "#102542", fontSize: "22px" }}>Manual UPI details</h3>
          <button type="button" onClick={onCopyUpiId} style={copyButton}>{paymentIntent.upiId || SATHI_UPI_ID}</button>
          <p style={{ margin: "12px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
            Pay to {paymentIntent.merchantName || SATHI_MERCHANT_NAME}, amount Rs. {paymentIntent.amount}, and use the note: {paymentIntent.transactionNote}
          </p>
          <a href={activeUpiUri} style={plainUpiLink}>Open with default UPI app</a>
        </div>
      </div>

      <form onSubmit={onConfirmPayment} style={proofForm}>
        <div>
          <p style={sectionEyebrow}>After payment</p>
          <h3 style={{ margin: "8px 0 0", color: "#102542", fontSize: "24px" }}>Submit transaction proof</h3>
        </div>
        <label style={labelStyle}>
          Transaction ID / UTR
          <input value={utrNumber} onChange={(event) => onUtrChange(event.target.value)} placeholder="Example: 412345678901" style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Screenshot or PDF proof (optional)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={(event) => onScreenshotChange(event.target.files?.[0] || null)}
            style={fileInputStyle}
          />
        </label>
        {screenshot ? <p style={{ margin: 0, color: "#475569" }}>Selected: {screenshot.name}</p> : null}
        <button type="submit" disabled={orderLoading} style={{ ...confirmButton, opacity: orderLoading ? 0.7 : 1 }}>
          {orderLoading ? "Confirming..." : "I Have Paid - Confirm Booking"}
        </button>
      </form>
    </section>
  );
}

function getPaymentStepLabel(step) {
  switch (step) {
    case "creating-booking":
      return "Creating booking";
    case "payment-ready":
      return "Waiting for UPI payment";
    case "awaiting-payment":
      return "Payment pending";
    case "verifying":
      return "Verifying transaction details";
    case "failed":
      return "Payment pending";
    case "success":
      return "Payment successful";
    default:
      return "Ready";
  }
}

function Field({ label, value, onChange }) {
  return (
    <label style={labelStyle}>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
    </label>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #fff8f3 0%, #f6f8fb 42%, #eef4fb 100%)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: "#102542",
  padding: "32px 24px 60px"
};
const shellStyle = { maxWidth: "1340px", margin: "0 auto" };
const headerRow = { display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "26px" };
const sectionEyebrow = { margin: 0, color: "#d7263d", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, fontSize: "13px" };
const pageTitle = { margin: "10px 0 0", fontSize: "clamp(2rem, 4vw, 3.4rem)", color: "#071b3a" };
const pageSubtitle = { margin: "12px 0 0", color: "#5b6878", lineHeight: 1.7, maxWidth: "760px" };
const secondaryLink = { display: "inline-flex", textDecoration: "none", background: "#071b3a", color: "#ffffff", padding: "12px 18px", borderRadius: "14px", fontWeight: 800 };
const alertBox = { width: "100%", marginBottom: "24px", padding: "18px 22px", borderRadius: "18px", background: "#fff7ed", border: "1px solid #fed7aa" };
const checkoutGrid = { display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.75fr)", gap: "22px", alignItems: "start" };
const leftColumn = { display: "grid", gap: "22px" };
const summaryColumn = { position: "sticky", top: "24px" };
const cardStyle = { background: "rgba(255,255,255,0.96)", borderRadius: "24px", padding: "24px", boxShadow: "0 18px 42px rgba(7, 27, 58, 0.09)", border: "1px solid rgba(215, 227, 239, 0.9)" };
const cardTitle = { margin: 0, fontSize: "26px", color: "#071b3a" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "20px" };
const labelStyle = { display: "grid", gap: "8px", color: "#334155", fontWeight: 700, marginTop: "18px" };
const inputStyle = { minHeight: "50px", borderRadius: "14px", border: "1px solid #d7e3ef", padding: "0 14px", fontSize: "15px", background: "#ffffff" };
const fileInputStyle = { ...inputStyle, padding: "12px 14px" };
const textareaStyle = { width: "100%", minHeight: "120px", borderRadius: "16px", border: "1px solid #d7e3ef", padding: "14px", fontSize: "15px", resize: "vertical" };
const paymentIntroCard = { ...cardStyle, background: "linear-gradient(145deg, #ffffff, #fff1f2)" };
const paymentPanel = { ...cardStyle, display: "grid", gap: "20px", background: "#ffffff" };
const paymentPanelHeader = { display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" };
const trustPill = { borderRadius: "999px", padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", fontWeight: 800 };
const upiAppGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" };
const upiAppButton = { minHeight: "82px", border: "1px solid", borderRadius: "18px", background: "#ffffff", padding: "14px", display: "flex", alignItems: "center", gap: "12px", textAlign: "left", boxShadow: "0 10px 24px rgba(7,27,58,0.08)" };
const upiIcon = { width: "42px", height: "42px", borderRadius: "14px", color: "#ffffff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flex: "0 0 auto" };
const fallbackGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "16px" };
const qrCard = { borderRadius: "20px", padding: "18px", background: "#f8fbff", border: "1px solid #d7e3ef", textAlign: "center" };
const qrImage = { width: "min(280px, 100%)", margin: "0 auto", borderRadius: "16px", background: "#ffffff", padding: "10px" };
const manualCard = { borderRadius: "20px", padding: "18px", background: "#fff7ed", border: "1px solid #fed7aa" };
const copyButton = { marginTop: "14px", width: "100%", border: "1px dashed #d7263d", borderRadius: "14px", background: "#ffffff", color: "#071b3a", padding: "14px", fontWeight: 900, fontSize: "17px" };
const plainUpiLink = { marginTop: "14px", display: "inline-flex", textDecoration: "none", color: "#d7263d", fontWeight: 900 };
const proofForm = { display: "grid", gap: "2px", borderRadius: "20px", padding: "20px", background: "#f8fbff", border: "1px solid #d7e3ef" };
const confirmButton = { marginTop: "16px", width: "100%", border: "none", borderRadius: "16px", background: "#d7263d", color: "#ffffff", padding: "16px 18px", fontWeight: 900, fontSize: "16px" };
const cartItem = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", paddingBottom: "14px", borderBottom: "1px solid #eef2f7" };
const quantityBox = { display: "flex", gap: "10px", alignItems: "center", background: "#f8fbff", borderRadius: "14px", padding: "8px 10px" };
const qtyButton = { width: "30px", height: "30px", borderRadius: "8px", border: "none", background: "#e0e7ff", fontWeight: 900 };
const totalsWrap = { marginTop: "20px", display: "grid", gap: "10px" };
const totalRow = { display: "flex", justifyContent: "space-between", color: "#5b6878", gap: "12px" };
const consentCard = { marginTop: "18px", display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px", borderRadius: "16px", background: "#f8fbff", border: "1px solid #d7e3ef" };
const consentCheckbox = { marginTop: "4px", width: "18px", height: "18px", accentColor: "#d7263d", flexShrink: 0 };
const consentLink = { color: "#b91c1c", fontWeight: 800, textDecoration: "none" };
const infoMessage = { marginTop: "18px", color: "#0f766e", fontWeight: 800, lineHeight: 1.6 };
const errorMessage = { marginTop: "18px", color: "#d7263d", fontWeight: 800, lineHeight: 1.6 };
const statusCard = { marginTop: "18px", borderRadius: "16px", padding: "16px", background: "#f8fbff", border: "1px solid #d7e3ef", display: "grid", gap: "6px" };
const statusLabel = { color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, fontSize: "12px" };
const placeOrderButton = { marginTop: "22px", width: "100%", border: "none", borderRadius: "16px", background: "#d7263d", color: "#ffffff", padding: "16px 18px", fontWeight: 900, fontSize: "16px" };
const successCard = { maxWidth: "780px", margin: "60px auto", background: "#ffffff", borderRadius: "28px", padding: "32px", boxShadow: "0 18px 42px rgba(7,27,58,0.1)", border: "1px solid #e6eef6" };
const successTitle = { margin: "10px 0 0", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#071b3a" };
const successText = { margin: "14px 0 0", color: "#5b6878", lineHeight: 1.7 };
const successDetails = { display: "grid", gap: "10px", marginTop: "20px", color: "#334155", padding: "18px", borderRadius: "18px", background: "#f8fbff" };
const successActions = { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "22px" };
const secondaryButton = { border: "none", borderRadius: "14px", background: "#071b3a", color: "#ffffff", padding: "12px 18px", fontWeight: 800 };
const whatsappButton = { display: "inline-flex", textDecoration: "none", borderRadius: "14px", background: "#16a34a", color: "#ffffff", padding: "12px 18px", fontWeight: 800 };
const primaryLink = { display: "inline-flex", textDecoration: "none", borderRadius: "14px", background: "#d7263d", color: "#ffffff", padding: "12px 18px", fontWeight: 800 };
