import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../api";
import logo from "../assets/images/icons/logo.png";
import { servicesData } from "../data/servicesData";

const GROUPS = {
  nursing: { en: "Nursing", hi: "नर्सिंग" },
  therapy: { en: "Ayurvedic Therapy", hi: "आयुर्वेदिक थेरेपी" },
  counselling: { en: "Counselling", hi: "काउंसलिंग" }
};

const BOOKING_FIELDS = ["name", "age", "gender", "city", "address", "mobile", "date", "duration", "specialRequirements", "budget"];
const FIELD_NEXT = {
  name: "age",
  age: "gender",
  gender: "city",
  city: "address",
  address: "mobile",
  mobile: "date",
  date: "duration",
  duration: "specialRequirements",
  specialRequirements: "budget"
};

const COPY = {
  en: {
    hindi: "Hindi",
    english: "English",
    welcome: "Welcome to Sathi Homecare. I am Priya AI Care Assistant. How may I assist you today?",
    beneficiary: "Who is this service for?",
    help: "How can I help you today?",
    chooseSub: "Please choose the exact service. You can ask me for details, estimate, booking, WhatsApp, or a human expert.",
    detailsLead: "Here are the service details:",
    finalPrice: "Final pricing will be confirmed by care coordinator.",
    continueBooking: "Continue booking",
    talkHuman: "Talk to Human Expert",
    callNow: "Call Now",
    whatsapp: "WhatsApp",
    submitBooking: "Submit booking",
    editDetails: "Edit details",
    bookAnother: "Book another service",
    patientCare: "Patient Care",
    postSurgery: "Post Surgery Care",
    self: "Self",
    patient: "Patient",
    senior: "Senior Citizen",
    female: "Female",
    male: "Male",
    other: "Other",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeek: "This week",
    later: "I will decide later",
    oneVisit: "One visit",
    threeDays: "3 days",
    sevenDays: "7 days",
    fifteenDays: "15 days",
    monthly: "Monthly",
    noSpecial: "No special requirement",
    femaleCaregiver: "Need female caregiver",
    equipment: "Need medical equipment",
    prompts: {
      name: "Please share the patient or customer name.",
      age: "Please share age.",
      gender: "Please select gender.",
      city: "Which city do you need service in?",
      address: "Please share complete address or locality.",
      mobile: "Please share a valid 10-digit mobile number.",
      date: "Preferred date?",
      duration: "Preferred duration?",
      specialRequirements: "Any special requirements? For example medical condition, mobility, equipment, timing, or language preference.",
      budget: "What is your budget for this service?"
    },
    budgetLow: "Budget cannot be below the minimum service amount.",
    summary: "Here is your booking summary. Shall I submit it?",
    estimateLead: "Estimated price range:",
    human: "You can talk to our human care expert now.",
    sent: "Booking request received. Our care coordinator will contact you shortly.",
    error: "Booking could not be submitted right now. Please connect with our care coordinator.",
    offTopic: "I can help only with Sathi Homecare services, bookings, estimates, FAQs and healthcare support information. I cannot provide medical diagnosis.",
    voiceUnsupported: "Voice input is not supported in this browser.",
    placeholder: "Type your message...",
    privacy: "Your information is secure and used only to arrange better care.",
    voiceEnabled: "Voice enabled",
    leftCopy: "Understand services, get estimates and complete bookings.",
    voiceReady: "Voice ready",
    voiceLimited: "Voice limited",
    playWelcome: "Play Welcome",
    listening: "Listening..."
  },
  hi: {
    hindi: "हिंदी",
    english: "English",
    welcome: "नमस्ते, Sathi Homecare में आपका स्वागत है। मैं Priya AI Care Assistant हूँ। मैं आपकी किस प्रकार सहायता कर सकती हूँ?",
    beneficiary: "यह सेवा किसके लिए चाहिए?",
    help: "मैं आज आपकी कैसे सहायता कर सकती हूँ?",
    chooseSub: "कृपया सही सेवा चुनें। आप मुझसे सेवा की जानकारी, अनुमान, बुकिंग, WhatsApp या human expert की सहायता ले सकते हैं।",
    detailsLead: "सेवा की जानकारी:",
    finalPrice: "अंतिम कीमत care coordinator द्वारा confirm की जाएगी।",
    continueBooking: "बुकिंग जारी रखें",
    talkHuman: "Human Expert से बात करें",
    callNow: "अभी कॉल करें",
    whatsapp: "WhatsApp",
    submitBooking: "बुकिंग सबमिट करें",
    editDetails: "विवरण बदलें",
    bookAnother: "दूसरी सेवा बुक करें",
    patientCare: "Patient Care",
    postSurgery: "Post Surgery Care",
    self: "स्वयं",
    patient: "Patient",
    senior: "Senior Citizen",
    female: "महिला",
    male: "पुरुष",
    other: "अन्य",
    today: "आज",
    tomorrow: "कल",
    thisWeek: "इस सप्ताह",
    later: "बाद में तय करेंगे",
    oneVisit: "एक विजिट",
    threeDays: "3 दिन",
    sevenDays: "7 दिन",
    fifteenDays: "15 दिन",
    monthly: "मासिक",
    noSpecial: "कोई विशेष आवश्यकता नहीं",
    femaleCaregiver: "महिला caregiver चाहिए",
    equipment: "medical equipment चाहिए",
    prompts: {
      name: "कृपया patient या customer का नाम बताएं।",
      age: "कृपया उम्र बताएं।",
      gender: "कृपया gender चुनें।",
      city: "सेवा किस शहर में चाहिए?",
      address: "कृपया पूरा address या locality बताएं।",
      mobile: "कृपया valid 10-digit mobile number बताएं।",
      date: "Preferred date क्या रहेगी?",
      duration: "Preferred duration क्या रहेगी?",
      specialRequirements: "कोई विशेष आवश्यकता? जैसे medical condition, mobility, equipment, timing या language preference.",
      budget: "इस सेवा के लिए आपका budget क्या है?"
    },
    budgetLow: "Budget minimum service amount से कम नहीं हो सकता।",
    summary: "यह आपकी booking summary है। क्या इसे submit कर दूँ?",
    estimateLead: "अनुमानित कीमत:",
    human: "आप अभी हमारे human care expert से बात कर सकते हैं।",
    sent: "Booking request मिल गई है। हमारा care coordinator जल्द आपसे संपर्क करेगा।",
    error: "Booking अभी submit नहीं हो पा रही है। कृपया care coordinator से connect करें।",
    offTopic: "मैं केवल Sathi Homecare services, booking, estimate, FAQs और healthcare support information में सहायता कर सकती हूँ। मैं medical diagnosis नहीं देती।",
    voiceUnsupported: "इस browser में voice input supported नहीं है।",
    placeholder: "अपना message लिखें...",
    privacy: "आपकी जानकारी सुरक्षित है और केवल बेहतर care arrange करने के लिए उपयोग होगी।",
    voiceEnabled: "Voice enabled",
    leftCopy: "सेवाएँ समझें, estimate लें और booking complete करें।",
    voiceReady: "Voice ready",
    voiceLimited: "Voice limited",
    playWelcome: "Welcome सुनें",
    listening: "सुन रही हूँ..."
  }
};

const uid = () => Math.random().toString(36).slice(2) + Date.now();
const nowTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const phoneDigits = (value) => String(value || "").replace(/\D/g, "");

export default function SathiCareBot({
  brandName = "Sathi Homecare",
  agentName = "Priya AI",
  agentRole = "AI Care Assistant",
  phone = "+91 94517 64251"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [awaitingField, setAwaitingField] = useState(null);
  const [booking, setBooking] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const bodyEndRef = useRef(null);
  const initialised = useRef(false);
  const recognitionRef = useRef(null);
  const t = COPY[language];
  const cleanPhone = phoneDigits(phone);
  const whatsappUrl = `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent("Emergency booking request for Sathi Homecare. Please contact me.")}`;

  const catalog = useMemo(() => ({
    nursing: servicesData.nursing,
    therapy: servicesData.therapy,
    counselling: servicesData.counselling
  }), []);

  const beneficiaryChips = useMemo(() => [
    t.self,
    t.patient,
    t.senior
  ], [t.patient, t.self, t.senior]);

  const serviceStartChips = useMemo(() => [
    groupLabel("nursing", language),
    t.patientCare,
    groupLabel("therapy", language),
    t.postSurgery,
    groupLabel("counselling", language),
    t.talkHuman
  ], [language, t.patientCare, t.postSurgery, t.talkHuman]);

  const genderChips = useMemo(() => [t.female, t.male, t.other], [t.female, t.male, t.other]);
  const dateChips = useMemo(() => [t.today, t.tomorrow, t.thisWeek, t.later], [t.later, t.thisWeek, t.today, t.tomorrow]);
  const durationChips = useMemo(() => [t.oneVisit, t.threeDays, t.sevenDays, t.fifteenDays, t.monthly], [t.fifteenDays, t.monthly, t.oneVisit, t.sevenDays, t.threeDays]);
  const specialChips = useMemo(() => [t.noSpecial, t.femaleCaregiver, t.equipment], [t.equipment, t.femaleCaregiver, t.noSpecial]);

  useEffect(() => {
    bodyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(Boolean(SpeechRecognition));
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const pushBot = useCallback((text, chips = null, stepKey = null, extra = {}) => {
    setIsTyping(true);
    setAwaitingField(null);
    setTimeout(() => {
      setMessages((current) => [...current, { id: uid(), sender: "bot", text, chips, stepKey, time: nowTime(), ...extra }]);
      setIsTyping(false);
    }, 260);
  }, []);

  const pushUser = useCallback((text) => {
    setMessages((current) => [...current, { id: uid(), sender: "user", text, time: nowTime() }]);
  }, []);

  const startFlow = useCallback((withVoice = false) => {
    setIsOpen(true);
    setHasUnread(false);
    if (withVoice) speak(t.welcome);
    if (!initialised.current) {
      initialised.current = true;
      setTimeout(() => {
        pushBot(t.beneficiary, beneficiaryChips, "beneficiary", { variant: "cards" });
        setTimeout(() => pushBot(t.help, serviceStartChips, "serviceStart", { variant: "serviceGrid" }), 440);
      }, 220);
    }
  }, [beneficiaryChips, pushBot, serviceStartChips, speak, t.beneficiary, t.help, t.welcome]);

  useEffect(() => {
    const timer = window.setTimeout(() => startFlow(false), 2000);
    return () => window.clearTimeout(timer);
  }, [startFlow]);

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    const nextCopy = COPY[nextLanguage];
    setMessages((current) => current.length ? current : []);
    if (initialised.current) {
      pushBot(nextCopy.beneficiary, nextLanguage === "hi" ? [nextCopy.self, nextCopy.patient, nextCopy.senior] : [nextCopy.self, nextCopy.patient, nextCopy.senior], "beneficiary", { variant: "cards" });
    }
  };

  const detectLanguage = (text) => {
    if (/[\u0900-\u097F]/.test(text) || /\b(namaste|kripya|kaunsi|chahiye|bata|haan|nahi|seva|madad)\b/i.test(text)) {
      setLanguage("hi");
      return "hi";
    }
    if (/[a-z]/i.test(text)) {
      setLanguage("en");
      return "en";
    }
    return language;
  };

  const findService = (name) => Object.values(catalog).flat().find((service) => service.name.toLowerCase() === String(name).toLowerCase());
  const getMinimum = (serviceName) => findService(serviceName)?.price || 499;
  const serviceChips = (groupKey) => (catalog[groupKey] || []).slice(0, 10).map((service) => service.name);

  const markAnswered = (msgId, label) => {
    setMessages((current) => current.map((message) => (message.id === msgId ? { ...message, answered: label } : message)));
  };

  const pushHumanActions = () => {
    pushBot(t.human, [t.callNow, t.whatsapp, t.continueBooking], "human");
  };

  const showServiceDetails = (serviceName) => {
    const service = findService(serviceName);
    if (!service) return;
    setBooking((current) => ({ ...current, service: service.name }));
    pushBot(`${t.detailsLead}\n${service.name}\nStarting from Rs. ${service.price}\n${service.desc}\n\n${t.finalPrice}`, [t.continueBooking, t.talkHuman], "detailsChoice");
  };

  const askSubServices = (groupKey) => {
    setBooking((current) => ({ ...current, serviceGroup: groupKey }));
    pushBot(t.chooseSub, serviceChips(groupKey), "service");
  };

  const askNext = (field) => {
    if (!field) return;
    const chipMap = {
      gender: genderChips,
      date: dateChips,
      duration: durationChips,
      specialRequirements: specialChips
    };
    pushBot(t.prompts[field], chipMap[field] || null, field);
    if (!chipMap[field]) setAwaitingField(field);
  };

  const startBookingAfterService = () => {
    const firstMissing = BOOKING_FIELDS.find((field) => !booking[field]);
    askNext(firstMissing || "name");
  };

  const estimateText = (draft) => {
    const min = getMinimum(draft.service);
    const durationBoost = {
      [t.oneVisit]: 0,
      [t.threeDays]: 2,
      [t.sevenDays]: 5,
      [t.fifteenDays]: 10,
      [t.monthly]: 18
    }[draft.duration] || 1;
    const low = Math.max(min, Math.round(min * (1 + durationBoost * 0.72)));
    const high = Math.round(low * 1.35 + (draft.specialRequirements && draft.specialRequirements !== t.noSpecial ? 350 : 0));
    return `${t.estimateLead} Rs. ${low.toLocaleString("en-IN")} - Rs. ${high.toLocaleString("en-IN")}. ${t.finalPrice}`;
  };

  const handleChip = (msg, chipLabel) => {
    markAnswered(msg.id, chipLabel);
    pushUser(chipLabel);

    if (msg.stepKey === "beneficiary") {
      setBooking((current) => ({ ...current, beneficiary: chipLabel }));
      return;
    }

    if (msg.stepKey === "serviceStart") {
      if (chipLabel === t.talkHuman) {
        pushHumanActions();
        return;
      }
      if (chipLabel === t.patientCare) {
        showServiceDetails("Patient Care at Home");
        return;
      }
      if (chipLabel === t.postSurgery) {
        showServiceDetails("Post-Surgery Care");
        return;
      }
      const groupKey = groupKeyFromLabel(chipLabel, language);
      if (groupKey) askSubServices(groupKey);
      return;
    }

    if (msg.stepKey === "service") {
      showServiceDetails(chipLabel);
      return;
    }

    if (msg.stepKey === "detailsChoice") {
      if (chipLabel === t.talkHuman) {
        pushHumanActions();
      } else {
        startBookingAfterService();
      }
      return;
    }

    if (msg.stepKey === "human") {
      if (chipLabel === t.callNow) window.location.href = `tel:+91${cleanPhone.slice(-10)}`;
      if (chipLabel === t.whatsapp) window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (chipLabel === t.continueBooking) startBookingAfterService();
      return;
    }

    if (msg.stepKey === "confirm") {
      if (chipLabel === t.submitBooking) {
        submitBooking();
      } else {
        askNext("name");
      }
      return;
    }

    if (msg.stepKey === "postBooking") {
      if (chipLabel === t.bookAnother) restartFlow();
      if (chipLabel === t.talkHuman) pushHumanActions();
      if (chipLabel === t.whatsapp) window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (["gender", "date", "duration", "specialRequirements"].includes(msg.stepKey)) {
      setBooking((current) => ({ ...current, [msg.stepKey]: chipLabel }));
      askNext(FIELD_NEXT[msg.stepKey]);
    }
  };

  const restartFlow = () => {
    setBooking({});
    initialised.current = true;
    pushBot(t.beneficiary, beneficiaryChips, "beneficiary", { variant: "cards" });
    setTimeout(() => pushBot(t.help, serviceStartChips, "serviceStart", { variant: "serviceGrid" }), 420);
  };

  const completeField = (field, value) => {
    setBooking((current) => ({ ...current, [field]: value }));
    askNext(FIELD_NEXT[field]);
  };

  const submitText = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const detected = detectLanguage(trimmed);
    const activeCopy = COPY[detected];

    if (awaitingField) {
      pushUser(trimmed);
      if (awaitingField === "mobile") {
        const digitsOnly = phoneDigits(trimmed);
        if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
          pushBot(activeCopy.prompts.mobile);
          setAwaitingField("mobile");
          return;
        }
        completeField("mobile", digitsOnly);
        return;
      }
      if (awaitingField === "budget") {
        const amount = Number(phoneDigits(trimmed));
        const minimum = getMinimum(booking.service);
        if (!amount || amount < minimum) {
          pushBot(`${activeCopy.budgetLow} Minimum: Rs. ${minimum.toLocaleString("en-IN")}`, null, null);
          setAwaitingField("budget");
          return;
        }
        const updated = { ...booking, budget: amount };
        setBooking(updated);
        pushBot(estimateText(updated));
        pushBot(activeCopy.summary, [activeCopy.submitBooking, activeCopy.editDetails], "confirm", { type: "summary", summary: updated });
        return;
      }
      completeField(awaitingField, trimmed);
      return;
    }

    pushUser(trimmed);
    const lower = trimmed.toLowerCase();
    const matched = Object.values(catalog).flat().find((service) => lower.includes(service.name.toLowerCase().slice(0, 8)));
    if (matched) {
      showServiceDetails(matched.name);
      return;
    }
    if (/\b(price|cost|budget|estimate|rate|charge|कीमत|दाम|बजट)\b/i.test(trimmed) && booking.service) {
      pushBot(`${estimateText(booking)} Minimum amount: Rs. ${getMinimum(booking.service).toLocaleString("en-IN")}.`);
      return;
    }
    if (/\b(book|booking|submit|done|बुक|बुकिंग)\b/i.test(trimmed) && booking.service) {
      startBookingAfterService();
      return;
    }
    if (/\b(call|human|whatsapp|expert|contact|बात|कॉल|मानव)\b/i.test(trimmed)) {
      pushHumanActions();
      return;
    }
    if (/\b(diagnosis|medicine|tablet|dose|prescribe|इलाज|दवा|निदान)\b/i.test(trimmed)) {
      pushBot(activeCopy.offTopic);
      return;
    }
    pushBot(activeCopy.help, serviceStartChips, "serviceStart", { variant: "serviceGrid" });
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    submitText(inputValue);
    setInputValue("");
  };

  const startListening = () => {
    startFlow(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      pushBot(t.voiceUnsupported);
      return;
    }
    recognitionRef.current?.abort?.();
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) submitText(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const submitBooking = () => {
    setIsTyping(true);
    const payload = { ...booking, submittedAt: new Date().toISOString() };
    (async () => {
      try {
        const response = await apiFetch("/ai-receptionist/chat", {
          method: "POST",
          timeoutMs: 75000,
          retries: 2,
          body: JSON.stringify({
            messages: buildAiMessages(payload, language),
            draft: buildAiDraft(payload),
            confirmBooking: true
          })
        });
        const code = response?.booking?.bookingCode || `SC${Date.now().toString().slice(-7)}`;
        setMessages((current) => [...current, { id: uid(), sender: "bot", text: `${t.sent} Reference ID: ${code}. ${t.finalPrice}`, chips: [t.talkHuman, t.bookAnother, t.whatsapp], stepKey: "postBooking", time: nowTime() }]);
      } catch (error) {
        setMessages((current) => [...current, { id: uid(), sender: "bot", text: error?.message || t.error, chips: [t.callNow, t.whatsapp], stepKey: "human", time: nowTime() }]);
      } finally {
        setIsTyping(false);
      }
    })();
  };

  return (
    <div className="sathi-root">
      <style>{CSS}</style>

      {!isOpen && (
        <button className="sathi-launcher" onClick={() => startFlow(false)} aria-label="Chat with Priya AI">
          <span>Priya AI</span>
          {hasUnread && <span className="sathi-launcher-badge">1</span>}
        </button>
      )}

      {isOpen && (
        <div className="sathi-overlay">
          <div className="sathi-panel" role="dialog" aria-label="Priya AI Care Assistant">
            <button className="sathi-close" onClick={() => setIsOpen(false)} aria-label="Close">X</button>

            <aside className="sathi-left">
              <div className="sathi-left-brand">
                <button type="button" className={`sathi-logo-button ${isListening ? "is-listening" : ""}`} onClick={startListening} aria-label="Start voice chat">
                  <span className="sathi-ring sathi-ring-one" />
                  <span className="sathi-ring sathi-ring-two" />
                  <img src={logo} alt={brandName} />
                </button>
                <div>
                  <strong>{brandName}</strong>
                  <span>Care That Feels Like Family</span>
                </div>
              </div>

              <div className="sathi-ai-portrait" aria-label="Priya AI nurse assistant">
                <span className="care-orbit orbit-one" />
                <span className="care-orbit orbit-two" />
                <span className="care-symbol plus-one">+</span>
                <span className="care-symbol plus-two">+</span>
                <span className="care-symbol heart">♥</span>
                <span className="care-symbol home">⌂</span>
                <div className="nurse-head">
                  <span className="hair hair-left" />
                  <span className="hair hair-right" />
                  <span className="face">
                    <span className="eye eye-left" />
                    <span className="eye eye-right" />
                    <span className="nose" />
                    <span className="smile" />
                  </span>
                </div>
                <div className="nurse-body">
                  <span className="neck" />
                  <span className="scrub scrub-left" />
                  <span className="scrub scrub-right" />
                  <span className="badge-logo"><img src={logo} alt="" /></span>
                  <span className="stetho stetho-left" />
                  <span className="stetho stetho-right" />
                  <span className="arms" />
                </div>
                <div className="portrait-wave" />
                <button type="button" className="portrait-mic" onClick={startListening} aria-label="Start voice mode">Mic</button>
              </div>

              <div className="sathi-priya-card">
                <h2>Priya AI <span>{agentRole}</span></h2>
                <small>{t.voiceEnabled}</small>
                <p>{t.leftCopy}</p>
                <div className="sathi-human-actions">
                  <a href={`tel:+91${cleanPhone.slice(-10)}`}>{t.callNow}</a>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">{t.whatsapp}</a>
                </div>
              </div>
            </aside>

            <section className="sathi-right">
              <div className="sathi-topbar">
                <div className="sathi-agent-row">
                  <button type="button" className={`sathi-avatar sathi-avatar-lg ${isListening ? "is-listening" : ""}`} onClick={startListening} aria-label="Start voice mode">AI</button>
                  <div>
                    <div className="sathi-agent-name">{agentName}</div>
                    <div className="sathi-agent-role"><span />{agentRole}</div>
                  </div>
                </div>
                <div className="sathi-lang-pills" aria-label="Language selector">
                  <button className={language === "hi" ? "active" : ""} onClick={() => changeLanguage("hi")}>{t.hindi}</button>
                  <button className={language === "en" ? "active" : ""} onClick={() => changeLanguage("en")}>{t.english}</button>
                </div>
              </div>

              <div className="sathi-body">
                {messages.map((msg) => (
                  <div key={msg.id} className={`sathi-row sathi-row-${msg.sender}`}>
                    {msg.sender === "bot" && <Avatar />}
                    <div className="sathi-col">
                      <div className={`sathi-bubble sathi-bubble-${msg.sender}`}>
                        {msg.type === "summary" ? <SummaryCard data={msg.summary} /> : <p>{msg.text}</p>}
                      </div>
                      <div className={`sathi-time sathi-time-${msg.sender}`}>{msg.time}{msg.sender === "user" ? " seen" : ""}</div>

                      {msg.chips && (
                        <div className={`sathi-chips ${msg.variant === "cards" ? "sathi-cards" : ""} ${msg.variant === "serviceGrid" ? "sathi-service-grid" : ""}`}>
                          {msg.chips.map((chip) => {
                            const isAnswered = msg.answered;
                            const isThisOne = msg.answered === chip;
                            return (
                              <button
                                key={chip}
                                className={`sathi-chip ${isThisOne ? "sathi-chip-selected" : ""} ${isAnswered && !isThisOne ? "sathi-chip-faded" : ""}`}
                                disabled={Boolean(isAnswered) && !["human", "postBooking"].includes(msg.stepKey)}
                                onClick={() => handleChip(msg, chip)}
                              >
                                <span className="chip-icon">{chipIcon(chip, t)}</span>
                                <span>{chip}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="sathi-row sathi-row-bot">
                    <Avatar />
                    <div className="sathi-bubble sathi-bubble-bot sathi-typing"><span /><span /><span /></div>
                  </div>
                )}
                {isListening && <div className="sathi-listening"><span />{t.listening}</div>}
                <div ref={bodyEndRef} />
              </div>

              <div className="sathi-inputbox">
                <div className="sathi-inputbar">
                  <button className={`sathi-mic ${isListening ? "is-listening" : ""}`} type="button" onClick={startListening} aria-label="Voice input">Mic</button>
                  <input
                    className="sathi-input"
                    type="text"
                    placeholder={t.placeholder}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleSend()}
                  />
                  <button className="sathi-send" onClick={handleSend} aria-label="Send">Send</button>
                </div>
                <div className="sathi-voice-row">
                  <span className="voice-status">{voiceSupported ? t.voiceReady : t.voiceLimited}</span>
                  <button className="sathi-speak" type="button" onClick={() => speak(t.welcome)}>{t.playWelcome}</button>
                </div>
              </div>

              <div className="sathi-lock-note">{t.privacy}</div>
            </section>
            <div className="sathi-powered">Powered by <strong>Sathi Homecare</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

function groupLabel(key, language) {
  return GROUPS[key][language] || GROUPS[key].en;
}

function groupKeyFromLabel(label, language) {
  return Object.entries(GROUPS).find(([, value]) => value.en === label || value.hi === label || value[language] === label)?.[0];
}

function chipIcon(chip, t) {
  if ([t.self, t.patient, t.senior].includes(chip)) return "●";
  if (chip === t.patientCare) return "▣";
  if (chip === t.postSurgery) return "▤";
  if (chip === t.talkHuman) return "☎";
  if (chip === t.whatsapp) return "☏";
  if (chip === groupLabel("therapy", "en") || chip === groupLabel("therapy", "hi")) return "✥";
  if (chip === groupLabel("counselling", "en") || chip === groupLabel("counselling", "hi")) return "◉";
  return "✚";
}

function Avatar() {
  return <div className="sathi-avatar sathi-avatar-sm">AI<span className="sathi-online-dot" /></div>;
}

function SummaryCard({ data }) {
  const rows = [
    ["Service Type", data.service],
    ["For", data.beneficiary],
    ["Name", data.name],
    ["Age", data.age],
    ["Gender", data.gender],
    ["City", data.city],
    ["Address", data.address],
    ["Mobile", data.mobile],
    ["Preferred Date", data.date],
    ["Duration", data.duration],
    ["Special Requirements", data.specialRequirements],
    ["Budget", data.budget ? `Rs. ${Number(data.budget).toLocaleString("en-IN")}` : ""]
  ];
  return (
    <div className="sathi-summary">
      {rows.map(([label, value]) => value ? (
        <div className="sathi-summary-row" key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ) : null)}
    </div>
  );
}

function buildAiMessages(payload, language) {
  const instruction = language === "hi"
    ? "Respond in clear Hindi when user chooses Hindi. Respond in clear English when user chooses English. Do not use Hinglish unless user mixes both languages."
    : "Respond in clear English. Support booking completion and human escalation. Do not provide medical diagnosis.";
  const content = [
    "Priya AI booking request for Sathi Homecare.",
    instruction,
    "Answer only Sathi Homecare and healthcare support queries.",
    `Service Type: ${payload.service || ""}`,
    `Self/Patient/Senior Citizen: ${payload.beneficiary || ""}`,
    `Name: ${payload.name || ""}`,
    `Age: ${payload.age || ""}`,
    `Gender: ${payload.gender || ""}`,
    `City: ${payload.city || ""}`,
    `Address: ${payload.address || ""}`,
    `Mobile: ${payload.mobile || ""}`,
    `Preferred Date: ${payload.date || ""}`,
    `Duration: ${payload.duration || ""}`,
    `Special Requirements: ${payload.specialRequirements || ""}`,
    `Budget: ${payload.budget || ""}`
  ].join("\n");
  return [{ role: "user", content }];
}

function buildAiDraft(payload) {
  return {
    patientName: payload.name || "",
    age: Number(String(payload.age || "").match(/\d+/)?.[0] || 0) || null,
    location: [payload.city, payload.address].filter(Boolean).join(", "),
    serviceType: payload.service || "",
    preferredDate: dateToIso(payload.date),
    timeSlot: payload.duration || "",
    mobileNumber: payload.mobile || ""
  };
}

function dateToIso(value) {
  const date = new Date();
  if (String(value).includes("Tomorrow") || String(value).includes("कल")) date.setDate(date.getDate() + 1);
  if (String(value).includes("week") || String(value).includes("सप्ताह")) date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
}

const CSS = `
.sathi-root{ position:fixed; inset:auto 24px 24px auto; z-index:9999; font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif; }
.sathi-launcher{ min-width:96px; height:56px; border-radius:999px; border:none; cursor:pointer; background:#047a74; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(4,122,116,.34); position:relative; font-weight:900; padding:0 18px; }
.sathi-launcher-badge{ position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:11px; font-weight:700; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
.sathi-overlay{ position:fixed; inset:0; background:rgba(13,24,36,.46); backdrop-filter:blur(4px); display:grid; place-items:center; padding:14px; }
.sathi-panel{ position:relative; width:min(1120px,calc(100vw - 28px)); height:min(720px,calc(100vh - 28px)); background:#fff; border:1px solid #edf2f5; border-radius:20px; box-shadow:0 28px 80px rgba(0,0,0,.24); display:grid; grid-template-columns:410px minmax(0,1fr); grid-template-rows:minmax(0,1fr) 34px; overflow:hidden; animation:sathi-pop .22s ease; }
@keyframes sathi-pop{ from{ opacity:0; transform:translateY(16px) scale(.98);} to{ opacity:1; transform:translateY(0) scale(1);} }
.sathi-close{ position:absolute; top:18px; right:18px; z-index:4; background:#fff; border:1px solid #dbe7e3; color:#334155; width:38px; height:38px; border-radius:50%; cursor:pointer; font-weight:900; box-shadow:0 8px 20px rgba(15,23,42,.1); }
.sathi-left{ position:relative; min-width:0; background:linear-gradient(180deg,#f7fffd 0%,#eefdfa 17%,#047a74 72%,#075e5b 100%); overflow:hidden; padding:28px; }
.sathi-left-brand{ position:relative; display:flex; align-items:center; gap:12px; color:#075e5b; z-index:2; }
.sathi-left-brand strong{ display:block; font-size:18px; line-height:1; }
.sathi-left-brand span{ display:block; color:#047a74; font-size:11px; margin-top:4px; font-weight:800; }
.sathi-logo-button{ width:58px; height:58px; border:1px solid #d9f3ee; border-radius:17px; background:#fff; display:grid; place-items:center; position:relative; box-shadow:0 14px 28px rgba(15,118,110,.14); cursor:pointer; isolation:isolate; }
.sathi-logo-button img{ width:47px; height:47px; object-fit:contain; z-index:2; }
.sathi-ring{ position:absolute; inset:-6px; border:1px solid rgba(4,122,116,.28); border-radius:22px; animation:sathi-ring 2.2s infinite ease-out; }
.sathi-ring-two{ animation-delay:.7s; }
.sathi-logo-button.is-listening .sathi-ring{ border-color:#22c55e; }
@keyframes sathi-ring{ 0%{ transform:scale(.9); opacity:.9;} 100%{ transform:scale(1.42); opacity:0;} }
.sathi-ai-portrait{ position:relative; height:368px; margin-top:20px; border-radius:20px; overflow:hidden; background:radial-gradient(circle at 50% 36%,#d9fffb 0 22%,#a8ece8 23% 46%,#81d6d0 47% 100%); box-shadow:0 18px 42px rgba(5,95,91,.22); }
.care-orbit{ position:absolute; left:50%; top:42%; width:230px; height:230px; border:2px solid rgba(255,255,255,.6); border-radius:50%; transform:translate(-50%,-50%); animation:sathi-orbit 5s linear infinite; }
.orbit-two{ width:180px; height:180px; animation-direction:reverse; opacity:.74; }
@keyframes sathi-orbit{ to{ transform:translate(-50%,-50%) rotate(360deg); } }
.care-symbol{ position:absolute; width:34px; height:34px; border-radius:50%; border:2px solid rgba(255,255,255,.78); color:#fff; display:grid; place-items:center; font-size:22px; font-weight:800; text-shadow:0 2px 8px rgba(0,0,0,.12); }
.plus-one{ left:36px; top:88px; }.plus-two{ right:36px; top:92px; }.heart{ right:44px; top:172px; font-size:18px; }.home{ left:36px; top:190px; font-size:20px; }
.nurse-head{ position:absolute; left:50%; top:54px; width:142px; height:166px; transform:translateX(-50%); }
.hair{ position:absolute; background:#203443; z-index:1; }
.hair-left{ left:7px; top:0; width:68px; height:122px; border-radius:48px 22px 50px 34px; transform:rotate(10deg); }
.hair-right{ right:7px; top:0; width:68px; height:122px; border-radius:22px 48px 34px 50px; transform:rotate(-10deg); }
.face{ position:absolute; left:20px; top:22px; width:102px; height:126px; background:#ffd4bd; border-radius:48% 48% 46% 46%; z-index:2; box-shadow:inset 0 -9px 0 rgba(224,137,103,.11); }
.eye{ position:absolute; top:52px; width:11px; height:11px; background:#1f2937; border-radius:50%; }
.eye-left{ left:28px; }.eye-right{ right:28px; }
.nose{ position:absolute; left:49px; top:64px; width:6px; height:18px; border-radius:50%; background:rgba(210,123,91,.45); }
.smile{ position:absolute; left:37px; top:87px; width:30px; height:14px; border-bottom:4px solid #b85460; border-radius:0 0 30px 30px; }
.nurse-body{ position:absolute; left:50%; bottom:23px; width:230px; height:174px; transform:translateX(-50%); }
.neck{ position:absolute; left:91px; top:0; width:48px; height:48px; background:#f5c4ab; border-radius:0 0 20px 20px; z-index:1; }
.scrub{ position:absolute; top:28px; width:130px; height:150px; background:#058d86; z-index:2; box-shadow:inset 0 20px 30px rgba(255,255,255,.11); }
.scrub-left{ left:0; border-radius:56px 12px 0 0; transform:skewX(-10deg); }
.scrub-right{ right:0; border-radius:12px 56px 0 0; transform:skewX(10deg); }
.badge-logo{ position:absolute; right:42px; top:58px; z-index:4; width:32px; height:32px; border-radius:50%; background:#fff; display:grid; place-items:center; }
.badge-logo img{ width:28px; height:28px; object-fit:contain; }
.stetho{ position:absolute; top:47px; width:56px; height:82px; border:5px solid #dff7f4; border-top:none; border-radius:0 0 40px 40px; z-index:3; }
.stetho-left{ left:54px; transform:rotate(6deg); }
.stetho-right{ right:54px; transform:rotate(-6deg); }
.arms{ position:absolute; left:34px; right:34px; bottom:18px; height:36px; border-radius:999px; background:#f3b99e; z-index:5; box-shadow:0 10px 0 rgba(3,93,89,.18); }
.portrait-wave{ position:absolute; left:26px; right:26px; bottom:22px; height:34px; border-radius:999px; opacity:.75; background:repeating-linear-gradient(90deg,rgba(255,255,255,.9) 0 5px,transparent 5px 12px); animation:sathi-wave 1.2s infinite ease-in-out; }
@keyframes sathi-wave{ 50%{ transform:scaleY(.58); opacity:.55;} }
.portrait-mic{ position:absolute; left:50%; bottom:18px; transform:translateX(-50%); width:72px; height:72px; border-radius:50%; border:4px solid rgba(255,255,255,.9); background:#0bbdb4; color:#fff; font-weight:900; box-shadow:0 18px 32px rgba(4,122,116,.32); z-index:8; }
.sathi-priya-card{ position:absolute; left:28px; right:28px; bottom:28px; color:#fff; }
.sathi-priya-card h2{ display:flex; align-items:center; gap:10px; margin:0; font-size:28px; letter-spacing:0; }
.sathi-priya-card h2 span,.sathi-priya-card small{ display:inline-flex; align-items:center; min-height:28px; padding:5px 10px; border-radius:999px; background:rgba(255,255,255,.16); font-size:11px; font-weight:800; }
.sathi-priya-card small{ margin-top:12px; }
.sathi-priya-card p{ margin:14px 0 18px; max-width:285px; color:#e6fffb; font-size:14px; line-height:1.55; font-weight:700; }
.sathi-human-actions{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.sathi-human-actions a{ min-height:48px; border-radius:10px; border:1px solid rgba(255,255,255,.5); background:rgba(255,255,255,.08); color:#fff; display:flex; align-items:center; justify-content:center; padding:9px 13px; text-decoration:none; font-size:13px; font-weight:900; }
.sathi-human-actions a:nth-child(2){ background:#fff; color:#047a74; }
.sathi-right{ min-width:0; min-height:0; display:grid; grid-template-rows:70px minmax(0,1fr) auto auto; padding:24px 28px 0; background:#fff; }
.sathi-topbar{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding-right:50px; }
.sathi-agent-row{ display:flex; gap:12px; align-items:center; min-width:0; }
.sathi-agent-name{ font-size:16px; color:#1e2440; font-weight:900; }
.sathi-agent-role{ display:flex; align-items:center; gap:5px; font-size:11px; color:#697586; margin-top:3px; font-weight:700; }
.sathi-agent-role span{ width:7px; height:7px; border-radius:50%; background:#22c55e; }
.sathi-lang-pills{ display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
.sathi-lang-pills button{ min-height:34px; border:1px solid #91ccc7; border-radius:999px; padding:7px 14px; color:#047a74; font-size:11px; font-weight:900; background:#fff; }
.sathi-lang-pills button.active{ background:#047a74; color:#fff; border-color:#047a74; }
.sathi-avatar{ border:none; border-radius:50%; background:linear-gradient(135deg,#047a74,#0bbdb4); color:#fff; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }
.sathi-avatar-lg{ width:46px; height:46px; font-size:13px; cursor:pointer; }
.sathi-avatar-sm{ width:34px; height:34px; font-size:11px; }
.sathi-avatar.is-listening{ box-shadow:0 0 0 8px rgba(34,197,94,.16); }
.sathi-online-dot{ position:absolute; bottom:-1px; right:-1px; width:10px; height:10px; border-radius:50%; background:#22c55e; border:2px solid #fff; }
.sathi-body{ min-height:0; overflow-y:auto; padding:4px 6px 16px 0; display:flex; flex-direction:column; gap:12px; }
.sathi-row{ display:flex; gap:12px; max-width:100%; }
.sathi-row-user{ flex-direction:row-reverse; }
.sathi-col{ display:flex; flex-direction:column; max-width:92%; min-width:0; }
.sathi-row-user .sathi-col{ align-items:flex-end; }
.sathi-bubble{ padding:14px 16px; border-radius:14px; font-size:13px; line-height:1.55; white-space:pre-line; overflow-wrap:anywhere; }
.sathi-bubble p{ margin:0; }
.sathi-bubble-bot{ background:#f4f7f8; color:#202740; border-top-left-radius:5px; }
.sathi-bubble-user{ background:#dff7ef; color:#164e46; border-top-right-radius:5px; }
.sathi-time{ font-size:10px; color:#8e94a8; margin-top:4px; }
.sathi-time-user{ text-align:right; }
.sathi-chips{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:12px; padding:14px; border:1px solid #edf0f6; border-radius:16px; background:#fff; box-shadow:0 10px 28px rgba(24,28,50,.05); }
.sathi-cards{ grid-template-columns:repeat(3,minmax(0,1fr)); max-width:520px; }
.sathi-service-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); max-width:650px; }
.sathi-chip{ min-height:52px; border:1px solid #dfe8e5; background:#fff; color:#202740; font-size:12px; font-weight:900; padding:9px 12px; border-radius:10px; cursor:pointer; transition:.15s; display:flex; align-items:center; justify-content:center; gap:10px; white-space:normal; }
.sathi-cards .sathi-chip{ min-height:92px; flex-direction:column; }
.chip-icon{ width:32px; height:32px; border-radius:50%; background:#dcfbf5; color:#047a74; display:grid; place-items:center; flex:0 0 auto; font-size:16px; }
.sathi-chip:hover:not(:disabled){ border-color:#047a74; background:#f3fffb; }
.sathi-chip-selected{ background:#047a74; color:#fff; border-color:#047a74; }
.sathi-chip-selected .chip-icon{ background:rgba(255,255,255,.18); color:#fff; }
.sathi-chip-faded{ opacity:.42; }
.sathi-chip:disabled{ cursor:default; }
.sathi-summary{ display:flex; flex-direction:column; gap:7px; min-width:min(300px,100%); }
.sathi-summary-row{ display:flex; justify-content:space-between; gap:12px; font-size:12px; border-bottom:1px dashed #dfe3ec; padding-bottom:6px; }
.sathi-summary-row span{ color:#6b7280; }
.sathi-summary-row b{ color:#164e46; text-align:right; }
.sathi-typing{ display:flex; gap:4px; align-items:center; padding:13px; width:50px; }
.sathi-typing span{ width:6px; height:6px; border-radius:50%; background:#047a74; animation:sathi-bounce 1.1s infinite; }
.sathi-typing span:nth-child(2){ animation-delay:.15s; }
.sathi-typing span:nth-child(3){ animation-delay:.3s; }
@keyframes sathi-bounce{ 0%,60%,100%{ transform:translateY(0); opacity:.5; } 30%{ transform:translateY(-4px); opacity:1; } }
.sathi-listening{ align-self:center; display:flex; align-items:center; gap:10px; color:#047a74; font-size:12px; font-weight:900; }
.sathi-listening span{ width:80px; height:24px; border-radius:999px; background:repeating-linear-gradient(90deg,#047a74 0 5px,transparent 5px 11px); animation:sathi-wave 1s infinite ease-in-out; }
.sathi-inputbox{ border:1px solid #edf0f6; border-radius:18px; background:#fff; padding:14px 16px; box-shadow:0 8px 22px rgba(24,28,50,.04); }
.sathi-inputbar{ display:grid; grid-template-columns:46px minmax(0,1fr) 48px; align-items:center; gap:12px; }
.sathi-mic{ width:44px; height:44px; border:1px solid #cceee9; border-radius:50%; color:#047a74; background:#e7fbf6; font-size:11px; font-weight:900; cursor:pointer; }
.sathi-mic.is-listening{ background:#047a74; color:#fff; animation:sathi-pulse 1s infinite; }
@keyframes sathi-pulse{ 50%{ transform:scale(1.08); } }
.sathi-input{ width:100%; min-width:0; height:48px; border:1px solid #dfe8e5; border-radius:13px; padding:0 16px; font-size:13px; outline:none; }
.sathi-input:focus{ border-color:#047a74; }
.sathi-send{ width:48px; height:48px; border-radius:50%; border:none; background:#047a74; color:#fff; cursor:pointer; font-size:11px; font-weight:900; }
.sathi-voice-row{ display:flex; align-items:center; justify-content:center; gap:10px; margin-top:10px; flex-wrap:wrap; }
.voice-status,.sathi-speak{ min-height:30px; border-radius:999px; background:#e7fbf6; color:#047a74; padding:7px 13px; font-size:11px; font-weight:900; }
.sathi-speak{ border:1px solid #edf0f6; background:#fff; cursor:pointer; }
.sathi-lock-note{ text-align:center; font-size:11px; color:#7b8195; padding:9px 0 10px; background:#fff; }
.sathi-powered{ grid-column:1 / -1; display:flex; align-items:center; justify-content:center; gap:4px; color:#8b90a4; font-size:12px; background:#fff; border-top:1px solid #f1f3f8; }
.sathi-powered strong{ color:#047a74; }
@media (max-width:900px){
  .sathi-root{ inset:auto 12px 12px auto; }
  .sathi-overlay{ padding:8px; }
  .sathi-panel{ width:calc(100vw - 16px); height:calc(100dvh - 16px); grid-template-columns:1fr; grid-template-rows:178px minmax(0,1fr) 30px; border-radius:16px; }
  .sathi-left{ min-height:178px; padding:14px; }
  .sathi-left-brand{ gap:8px; }
  .sathi-logo-button{ width:46px; height:46px; border-radius:14px; }
  .sathi-logo-button img{ width:38px; height:38px; }
  .sathi-ai-portrait{ position:absolute; right:14px; top:68px; width:126px; height:82px; margin:0; border-radius:16px; }
  .care-orbit,.care-symbol,.nurse-body,.portrait-wave{ display:none; }
  .nurse-head{ transform:translateX(-50%) scale(.55); top:-2px; }
  .portrait-mic{ width:42px; height:42px; bottom:8px; font-size:10px; }
  .sathi-priya-card{ left:14px; right:154px; bottom:12px; }
  .sathi-priya-card h2{ font-size:19px; display:block; }
  .sathi-priya-card h2 span,.sathi-priya-card small,.sathi-priya-card p,.sathi-human-actions{ display:none; }
  .sathi-right{ padding:12px 12px 0; grid-template-rows:auto minmax(0,1fr) auto auto; }
  .sathi-topbar{ padding-right:40px; align-items:center; }
  .sathi-agent-role{ display:none; }
  .sathi-lang-pills button{ padding:6px 10px; }
  .sathi-chips,.sathi-cards,.sathi-service-grid{ grid-template-columns:1fr; max-width:none; }
  .sathi-cards .sathi-chip{ min-height:56px; flex-direction:row; }
  .sathi-col{ max-width:90%; }
  .sathi-inputbox{ padding:12px; }
  .sathi-inputbar{ grid-template-columns:44px minmax(0,1fr) 48px; gap:8px; }
}
`;
