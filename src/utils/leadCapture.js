const viteEnv = typeof import.meta !== "undefined" ? import.meta.env || {} : {};

export const GOOGLE_SCRIPT_URL = (viteEnv.VITE_GOOGLE_SCRIPT_URL || "").trim();

export function isLeadCaptureConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(GOOGLE_SCRIPT_URL);
}

export async function submitLeadCapture(payload) {
  if (!isLeadCaptureConfigured()) {
    throw new Error("Google Apps Script lead capture URL is not configured.");
  }

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      page_url: payload.page_url || window.location.href
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Lead capture request failed.");
  }

  return data;
}

export function bookingToLeadPayload(booking, source, language = "en") {
  return {
    source,
    for_whom: booking.beneficiary || booking.forWhom || booking.for_whom || "",
    service_type: booking.service || booking.serviceName || booking.service_type || "",
    name: booking.name || booking.customerName || booking.patientName || "",
    phone: booking.mobile || booking.phone || booking.customerPhone || booking.patientPhone || "",
    location: [booking.city, booking.address || booking.patientAddress].filter(Boolean).join(", "),
    preferred_date: booking.date || booking.preferredDate || "",
    preferred_time: booking.duration || booking.time || booking.preferredTime || "",
    notes: booking.specialRequirements || booking.notes || booking.patientIssues || "",
    language
  };
}
