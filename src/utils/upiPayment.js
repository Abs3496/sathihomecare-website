export const SATHI_UPI_ID = "8090806731@ybl";
export const SATHI_MERCHANT_NAME = "SATHIHOMECARE";
export const SATHI_SUPPORT_WHATSAPP = "918090806731";

export const upiApps = [
  { id: "gpay", name: "Google Pay", scheme: "gpay://upi/pay", icon: "G", accent: "#1a73e8" },
  { id: "phonepe", name: "PhonePe", scheme: "phonepe://pay", icon: "Pe", accent: "#5f259f" },
  { id: "paytm", name: "Paytm", scheme: "paytmmp://pay", icon: "P", accent: "#00baf2" },
  { id: "bhim", name: "BHIM", scheme: "bhim://upi/pay", icon: "भ", accent: "#f97316" }
];

export function isLikelyAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

export function buildUpiUri({
  base = "upi://pay",
  upiId = SATHI_UPI_ID,
  merchantName = SATHI_MERCHANT_NAME,
  amount,
  reference,
  note
}) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: formatUpiAmount(amount),
    cu: "INR",
    tn: note || `SATHIHOMECARE booking ${reference || ""}`.trim()
  });

  if (reference) params.set("tr", reference);
  return `${base}?${params.toString()}`;
}

export function buildQrCodeUrl(upiUri) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiUri)}`;
}

export function launchUpiIntent(upiUri, app) {
  if (typeof window === "undefined") return;
  const appUri = app?.scheme ? upiUri.replace("upi://pay", app.scheme) : upiUri;
  window.location.href = appUri;
}

export function buildWhatsAppSupportUrl(bookingId, utrNumber = "") {
  const message = [
    "Hello SATHIHOMECARE support, I need help with my payment.",
    bookingId ? `Booking ID: ${bookingId}` : "",
    utrNumber ? `UTR: ${utrNumber}` : ""
  ].filter(Boolean).join("\n");

  return `https://wa.me/${SATHI_SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function formatUpiAmount(amount) {
  const numeric = Number(amount || 0);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
}
