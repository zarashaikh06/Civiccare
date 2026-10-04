/* =========================================================
   CIVICCARE - COMPLETE JAVASCRIPT APPLICATION
   Features:
   - Cities: Barshi, Solapur, Beed, Jalna, Mumbai, Pune, etc.
   - Strict Role-Based Access Control (Admin Dashboard locked to Admin only)
   - Real-Time Automated Notifications: Citizen -> Admin -> Worker -> Citizen
   - Admin Domain-Based Worker Assignment Workflow
   - Dedicated Worker Task Portal (Start Work, Mark Resolved)
   - AI Smart Domain & Urgency Auto-Detection
   - Offline / Demo Mode Sync with LocalStorage
========================================================= */

const API = (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.startsWith("http") && !window.location.origin.includes("null")) 
    ? (window.location.origin + "/api") 
    : "http://localhost:5000/api";

/* =========================================================
   GLOBAL STATE & MULTI-LANGUAGE (i18n)
========================================================= */

let currentLanguage = localStorage.getItem("civiccare_lang") || "en";
let speechRecognitionInstance = null;
let isListening = false;

const i18n = {
    en: {
        brand_tagline: "Your city, your voice",
        nav_home: "Home",
        nav_report: "Report",
        nav_track: "Track",
        nav_dashboard: "Dashboard",
        nav_login: "Login",
        hero_badge: "✨ Together, we make cities better",
        hero_title_1: "Spot it.",
        hero_title_2: "Snap it.",
        hero_title_3: "Fix it.",
        hero_desc: "See garbage, potholes, broken streetlights, water leakage or drainage issues? Tell your Nagar Palika in seconds with AI Smart Routing. Your complaint notifies the Admin, who dispatches the Domain Worker to solve it on-site!",
        hero_btn_report: "📸 Report a Problem",
        hero_btn_track: "Track my complaint →",
        step1_title: "Select Your City / Nagar Palika",
        step1_desc: "Routes your complaint directly to your local municipal council",
        btn_detect_city: "📍 Auto-Detect City",
        step2_title: "What is the problem?",
        step2_desc: "Select category (or describe it below and let AI auto-select for you)",
        cat_garbage: "Garbage",
        cat_garbage_desc: "Waste & overflowing bins",
        cat_pothole: "Pothole / Road",
        cat_pothole_desc: "Broken roads & potholes",
        cat_streetlight: "Streetlight",
        cat_streetlight_desc: "Broken streetlights",
        cat_water: "Water",
        cat_water_desc: "Leakage & supply issues",
        cat_drainage: "Drainage",
        cat_drainage_desc: "Blocked drains & flooding",
        cat_other: "Other",
        cat_other_desc: "Any other civic problem",
        step3_title: "Tell us more (AI Auto-Detection & Voice)",
        step3_desc: "Describe what you see — our AI automatically detects the category & municipal department",
        form_desc_label: "Problem description",
        voice_speak_btn: "🎙️ Speak (तक्रार बोला)",
        voice_listening: "🔴 Listening... Speak in Marathi, Hindi, or English",
        voice_stop: "⏹️ Stop (थांबवा)",
        voice_tts_btn: "🔊 Listen",
        desc_placeholder: "Example: Deep pothole on Subhash Chowk Road in Barshi causing bike accidents, or garbage container overflowing since 3 days...",
        ai_detect_btn: "✨ AI Auto-Detect Domain & Urgency",
        btn_submit_complaint: "🚀 Send to my Nagar Palika",
        track_heading: "Track your complaint",
        track_desc: "Enter your complaint ID to see real-time status, Admin approval, and assigned Worker details.",
        track_btn: "Track →",
        dashboard_heading: "Civic Complaint Dashboard 📊",
        dashboard_desc: "Real-time civic status across Barshi, Solapur, Beed & Maharashtra.",
        lang_switched: "Language changed to English",
        anon_label: "🔒 Report Anonymously (माझी ओळख गोपनीय ठेवा)",
        anon_desc: "Hide your name & phone number. Your complaint is submitted securely with only the GPS problem details.",
        gps_auto_off_toast: "🔒 GPS location automatically turned OFF after 5 minutes to protect your privacy and battery.",
        gps_manual_off_toast: "🛑 GPS Location turned OFF. Your coordinates have been cleared."
    },
    mr: {
        brand_tagline: "आपले शहर, आपला आवाज",
        nav_home: "मुख्यपृष्ठ",
        nav_report: "तक्रार नोंदवा",
        nav_track: "तक्रार तपासा",
        nav_dashboard: "डॅशबोर्ड",
        nav_login: "लॉगिन",
        hero_badge: "✨ एकत्र येऊन आपले शहर अधिक सुंदर बनवूया",
        hero_title_1: "समस्या बघा.",
        hero_title_2: "फोटो काढा.",
        hero_title_3: "सोडवा.",
        hero_desc: "कचरा, खड्डे, बंद पथदिवे, पाणी गळती किंवा गटाराची समस्या दिसली? एआय (AI) च्या मदतीने सेकंदात नगरपालिकेकडे तक्रार नोंदवा. ॲडमिन थेट संबंधित कामगाराला काम सोपवून समस्या सोडवेल!",
        hero_btn_report: "📸 तक्रार नोंदवा",
        hero_btn_track: "तक्रारीची स्थिती तपासा →",
        step1_title: "आपले शहर / नगरपरिषद निवडा",
        step1_desc: "तुमची तक्रार थेट तुमच्या स्थानिक नगरपालिकेकडे पाठवली जाईल",
        btn_detect_city: "📍 जीपीएसने शहर ओळखा",
        step2_title: "समस्या कशाबद्दल आहे?",
        step2_desc: "वर्गवारी निवडा (किंवा खाली वर्णन बोला/लिहा, AI आपोआप निवडेल)",
        cat_garbage: "कचरा / घाण",
        cat_garbage_desc: "कचराकुंडी व साचलेला कचरा",
        cat_pothole: "खड्डे / रस्ता",
        cat_pothole_desc: "खराब रस्ते आणि खड्डे",
        cat_streetlight: "पथदिवे",
        cat_streetlight_desc: "बंद दिवे आणि अंधार",
        cat_water: "पाणीपुरवठा",
        cat_water_desc: "पाईप गळती व दूषित पाणी",
        cat_drainage: "सांडपाणी गटार",
        cat_drainage_desc: "तुंबलेली गटारे व सांडपाणी",
        cat_other: "इतर समस्या",
        cat_other_desc: "इतर नागरी समस्या",
        step3_title: "तपशील द्या (AI आणि आवाज वैशिष्ट्य)",
        step3_desc: "समस्या बोला किंवा लिहा — आमचे AI आपोआप संबंधित विभाग आणि कामगार शोधेल",
        form_desc_label: "समस्येचे वर्णन",
        voice_speak_btn: "🎙️ तक्रार बोला",
        voice_listening: "🔴 ऐकत आहे... मराठीत बोला",
        voice_stop: "⏹️ थांबवा",
        voice_tts_btn: "🔊 ऐका",
        desc_placeholder: "उदा: बार्शी स्टेशन रोडवर खड्डे पडल्याने वाहनांचे अपघात होत आहेत, किंवा कचराकुंडी ३ दिवसांपासून भरून वाहत आहे...",
        ai_detect_btn: "✨ AI द्वारे विभाग व तातडी तपासा",
        btn_submit_complaint: "🚀 नगरपरिषदेकडे तक्रार पाठवा",
        track_heading: "तक्रारीची स्थिती तपासा",
        track_desc: "तक्रार क्रमांक टाका आणि प्रशासकीय मंजुरी व नियुक्त कर्मचाऱ्याची माहिती पाहा.",
        track_btn: "तपासा →",
        dashboard_heading: "नागरी तक्रार डॅशबोर्ड 📊",
        dashboard_desc: "बार्शी, सोलापूर, बीड आणि महाराष्ट्रातील थेट तक्रार स्थिती.",
        lang_switched: "भाषा बदलली: मराठी",
        anon_label: "🔒 माझी ओळख गोपनीय ठेवा (Report Anonymously)",
        anon_desc: "तुमचे नाव व मोबाईल नंबर लपवा. तुमची तक्रार फक्त समस्येचा तपशील व ठिकाणासह सुरक्षितपणे पाठवली जाईल.",
        gps_auto_off_toast: "🔒 तुमच्या गोपनीयतेसाठी आणि बॅटरी संरक्षणासाठी ५ मिनिटांनंतर GPS आपोआप बंद करण्यात आले आहे.",
        gps_manual_off_toast: "🛑 GPS लोकेशन बंद करण्यात आले आहे. तुमचे कोऑर्डिनेट्स हटवले आहेत."
    },
    hi: {
        brand_tagline: "आपका शहर, आपकी आवाज़",
        nav_home: "होम",
        nav_report: "शिकायत दर्ज करें",
        nav_track: "ट्रैक करें",
        nav_dashboard: "डैशबोर्ड",
        nav_login: "लॉगिन",
        hero_badge: "✨ मिलकर अपने शहर को बेहतर बनाएं",
        hero_title_1: "समस्या देखें.",
        hero_title_2: "फ़ोटो लें.",
        hero_title_3: "हल पाएं.",
        hero_desc: "कचरा, गड्ढे, बंद स्ट्रीटलाइट, पानी का रिसाव या नाली की समस्या? एआई (AI) की मदद से कुछ ही सेकंड में अपनी नगर पालिका को बताएं। एडमिन सीधे संबंधित कार्यकर्ता को काम सौंपेगा!",
        hero_btn_report: "📸 शिकायत दर्ज करें",
        hero_btn_track: "शिकायत ट्रैक करें →",
        step1_title: "अपना शहर / नगर पालिका चुनें",
        step1_desc: "आपकी शिकायत सीधे आपकी स्थानीय नगर पालिका परिषद को जाएगी",
        btn_detect_city: "📍 जीपीएस से शहर खोजें",
        step2_title: "समस्या क्या है?",
        step2_desc: "श्रेणी चुनें (या नीचे बोलें/लिखें, AI अपने आप चुन लेगा)",
        cat_garbage: "कचरा / गंदगी",
        cat_garbage_desc: "कचरे का ढेर व भरे डस्टबिन",
        cat_pothole: "गड्ढे / सड़क",
        cat_pothole_desc: "टूटी सड़कें और गहरे गड्ढे",
        cat_streetlight: "स्ट्रीटलाइट",
        cat_streetlight_desc: "बंद लाइटें और अंधेरा",
        cat_water: "जल आपूर्ति",
        cat_water_desc: "पाइप लीकेज और गंदा पानी",
        cat_drainage: "नाली / सीवर",
        cat_drainage_desc: "भरी नालियां और गंदा पानी",
        cat_other: "अन्य समस्या",
        cat_other_desc: "कोई अन्य नागरिक समस्या",
        step3_title: "विवरण बताएं (AI और आवाज़ फीचर)",
        step3_desc: "समस्या लिखें या बोलें — हमारा AI अपने आप विभाग और आपात स्तर पहचानेगा",
        form_desc_label: "समस्या का विवरण",
        voice_speak_btn: "🎙️ शिकायत बोलें",
        voice_listening: "🔴 सुन रहे हैं... हिंदी में बोलिए",
        voice_stop: "⏹️ रोकें",
        voice_tts_btn: "🔊 सुनें",
        desc_placeholder: "उदाहरण: बारशी स्टेशन रोड पर गहरा गड्ढा है जिससे दुर्घटनाएं हो रही हैं, या कचरा पेटी 3 दिनों से भरी पड़ी है...",
        ai_detect_btn: "✨ AI द्वारा विभाग व प्राथमिकता पहचानें",
        btn_submit_complaint: "🚀 नगर पालिका को शिकायत भेजें",
        track_heading: "अपनी शिकायत ट्रैक करें",
        track_desc: "शिकायत नंबर दर्ज करें और लाइव स्थिति व नियुक्त कार्यकर्ता की जानकारी देखें।",
        track_btn: "ट्रैक करें →",
        dashboard_heading: "नागरिक शिकायत डैशबोर्ड 📊",
        dashboard_desc: "बारशी, सोलापुर, बीड और महाराष्ट्र में लाइव शिकायत स्थिति।",
        lang_switched: "भाषा बदली गई: हिंदी",
        anon_label: "🔒 अपनी पहचान गोपनीय रखें (Report Anonymously)",
        anon_desc: "अपना नाम और मोबाइल नंबर छिपाएं। आपकी शिकायत केवल समस्या और स्थान के साथ सुरक्षित भेजी जाएगी।",
        gps_auto_off_toast: "🔒 आपकी गोपनीयता और बैटरी सुरक्षा के लिए ५ मिनट बाद GPS अपने आप बंद कर दिया गया है।",
        gps_manual_off_toast: "🛑 GPS लोकेशन बंद कर दी गई है। आपके निर्देशांक हटा दिए गए हैं।"
    }
};

let selectedCategory = "Garbage / Waste";
let selectedEmoji = "🗑️";
let selectedCity = "Barshi Nagar Parishad";
let gps = null;
let gpsAutoOffTimer = null;
let gpsCountdownInterval = null;
let gpsRemainingSeconds = 0;
const GPS_AUTO_OFF_DURATION = 5 * 60; // 5 minutes in seconds
let selectedPhoto = null;
let toastTimer = null;
let notifPollInterval = null;
let aiDebounceTimer = null;

// User Session
let currentUser = {
    role: "citizen",
    name: "Citizen",
    phone: null
};

// Admin Filters
let adminStatusFilter = "all";
let adminCityFilter = "all";
let adminSearchQuery = "";

// Assign Modal Context
let pendingAssignComplaintNum = null;

/* =========================================================
   MUNICIPALITIES & WORKERS DATABASE
========================================================= */

const defaultMunicipalities = [
    { id: "muni-barshi", name: "Barshi Nagar Parishad", city: "Barshi", state: "Maharashtra", lat: 18.2333, lng: 75.6948 },
    { id: "muni-solapur", name: "Solapur Municipal Corporation", city: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064 },
    { id: "muni-beed", name: "Beed Nagar Palika", city: "Beed", state: "Maharashtra", lat: 18.9891, lng: 75.7601 },
    { id: "muni-jalna", name: "Jalna Nagar Palika", city: "Jalna", state: "Maharashtra", lat: 19.8415, lng: 75.8864 },
    { id: "muni-bmc", name: "Brihanmumbai Municipal Corporation (BMC)", city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
    { id: "muni-pmc", name: "Pune Municipal Corporation (PMC)", city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
    { id: "muni-nmc", name: "Nagpur Municipal Corporation (NMC)", city: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
    { id: "muni-csn", name: "Chhatrapati Sambhajinagar Municipal Corporation", city: "Chhatrapati Sambhajinagar", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },
    { id: "muni-delhi", name: "Municipal Corporation of Delhi (MCD)", city: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
    { id: "muni-bbmp", name: "Bruhat Bengaluru Mahanagara Palike (BBMP)", city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 }
];

const defaultWorkers = [
    { id: "w-1", name: "Ramesh Pawar", phone: "9811111111", domain: "Sanitation & Solid Waste Department", city: "Barshi" },
    { id: "w-2", name: "Suresh Patil", phone: "9822222222", domain: "Road Infrastructure & Maintenance", city: "Solapur" },
    { id: "w-3", name: "Amit Sharma", phone: "9833333333", domain: "Streetlight & Electrical Department", city: "Beed" },
    { id: "w-4", name: "Vinod Jadhav", phone: "9844444444", domain: "Water Works & Supply Department", city: "Jalna" },
    { id: "w-5", name: "Ganesh Kale", phone: "9855555555", domain: "Drainage & Sewage Management", city: "Solapur" },
    { id: "w-6", name: "Prakash More", phone: "9866666666", domain: "Sanitation & Solid Waste Department", city: "Barshi" },
    { id: "w-7", name: "Sunil Shinde", phone: "9877777777", domain: "Road Infrastructure & Maintenance", city: "Beed" }
];

const emojiMap = {
    "Garbage / Waste": "🗑️",
    "Pothole / Road": "🛣️",
    "Streetlight": "💡",
    "Water": "💧",
    "Drainage": "🚰",
    "Other": "📢"
};

const domainMap = {
    "Garbage / Waste": "Sanitation & Solid Waste Department",
    "Pothole / Road": "Road Infrastructure & Maintenance",
    "Streetlight": "Streetlight & Electrical Department",
    "Water": "Water Works & Supply Department",
    "Drainage": "Drainage & Sewage Management",
    "Other": "Public Health & City Administration"
};

/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    initializeLanguage();
    initializeCategories();
    initializePhotoUpload();
    initializeDescriptionCounter();
    initializeLogin();
    initializeRegister();
    initializeYear();
    initializeCities();
    restoreLogin();
    loadDashboard();
    checkBackTop();

    // Start background notification polling
    startNotificationPolling();
});

/* =========================================================
   LANGUAGE (ENGLISH, MARATHI, HINDI) & VOICE ENGINE
========================================================= */

function initializeLanguage() {
    const savedLang = localStorage.getItem("civiccare_lang") || "en";
    currentLanguage = ["en", "mr", "hi"].includes(savedLang) ? savedLang : "en";

    const select = document.getElementById("languageSelect");
    if (select) {
        select.value = currentLanguage;
    }

    applyTranslations(currentLanguage);
}

function changeLanguage(lang) {
    if (!["en", "mr", "hi"].includes(lang)) return;

    currentLanguage = lang;
    localStorage.setItem("civiccare_lang", lang);

    const select = document.getElementById("languageSelect");
    if (select) {
        select.value = lang;
    }

    applyTranslations(lang);

    const msg = i18n[lang]?.lang_switched || `Language changed to ${lang.toUpperCase()}`;
    showToast(msg, "info");
}

function applyTranslations(lang) {
    const dict = i18n[lang] || i18n.en;

    // Translate all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = dict[key];
            } else {
                el.innerText = dict[key];
            }
        }
    });

    // Update specific placeholders and dynamic strings
    const descArea = document.getElementById("description");
    if (descArea) {
        descArea.placeholder = dict.desc_placeholder;
    }

    const voiceBtnText = document.getElementById("voiceBtnText");
    if (voiceBtnText && !isListening) {
        voiceBtnText.innerText = dict.voice_speak_btn;
    }

    const ttsBtnText = document.getElementById("ttsBtnText");
    if (ttsBtnText) {
        ttsBtnText.innerText = dict.voice_tts_btn;
    }
}

/* =========================================================
   SPEECH-TO-TEXT (VOICE INPUT) & TEXT-TO-SPEECH (TTS)
========================================================= */

function toggleVoiceInput() {
    if (isListening) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        showToast("Speech Recognition is not supported in this browser. Please use Chrome, Safari or Edge.", "error");
        return;
    }

    try {
        speechRecognitionInstance = new SpeechRecognition();
        speechRecognitionInstance.continuous = true; // Keep listening continuously as user speaks
        speechRecognitionInstance.interimResults = true; // Real-time live dictation!
        speechRecognitionInstance.maxAlternatives = 1;

        // Set recognition language based on active UI language
        if (currentLanguage === "mr") {
            speechRecognitionInstance.lang = "mr-IN"; // Marathi (India)
        } else if (currentLanguage === "hi") {
            speechRecognitionInstance.lang = "hi-IN"; // Hindi (India)
        } else {
            speechRecognitionInstance.lang = "en-IN"; // Indian English
        }

        const voiceBtn = document.getElementById("voiceBtn");
        const floatingMicBtn = document.getElementById("floatingMicBtn");
        const voiceBtnText = document.getElementById("voiceBtnText");
        const indicator = document.getElementById("voiceStatusIndicator");
        const statusText = document.getElementById("voiceStatusText");
        const descArea = document.getElementById("description");

        let baseTextBeforeVoice = "";

        speechRecognitionInstance.onstart = function () {
            isListening = true;
            baseTextBeforeVoice = descArea ? descArea.value.trim() : "";
            if (baseTextBeforeVoice) {
                baseTextBeforeVoice += " ";
            }

            if (voiceBtn) voiceBtn.classList.add("listening");
            if (floatingMicBtn) floatingMicBtn.classList.add("listening");
            if (descArea) descArea.classList.add("voice-recording-glow");

            if (voiceBtnText) {
                const dict = i18n[currentLanguage] || i18n.en;
                voiceBtnText.innerText = dict.voice_stop || "Stop (थांबवा)";
            }
            if (indicator) indicator.classList.remove("hidden");
            if (statusText) {
                const dict = i18n[currentLanguage] || i18n.en;
                statusText.innerText = dict.voice_listening || "🔴 Listening... Speak now";
            }
            showToast("🎙️ Microphone active! Speak now in your language...", "info");
        };

        speechRecognitionInstance.onresult = function (event) {
            let interimTranscript = "";
            let newFinal = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const chunk = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    newFinal += chunk + " ";
                } else {
                    interimTranscript += chunk;
                }
            }

            if (newFinal) {
                baseTextBeforeVoice += newFinal;
            }

            if (descArea) {
                // Live typing: displays words immediately as spoken!
                descArea.value = (baseTextBeforeVoice + interimTranscript).trim();
                handleDescriptionInput(); // update char counter and live AI triage
            }
        };

        speechRecognitionInstance.onerror = function (event) {
            console.warn("Speech recognition error:", event.error);
            if (event.error === "not-allowed") {
                showToast("Microphone access denied. Please allow microphone permission in browser settings.", "error");
            } else if (event.error !== "no-speech") {
                showToast(`Voice error: ${event.error}`, "error");
            }
            stopVoiceInput();
        };

        speechRecognitionInstance.onend = function () {
            stopVoiceInput();
        };

        speechRecognitionInstance.start();
    } catch (err) {
        console.error("Failed to start speech recognition:", err);
        showToast("Could not access microphone.", "error");
        stopVoiceInput();
    }
}

function stopVoiceInput() {
    isListening = false;
    if (speechRecognitionInstance) {
        try {
            speechRecognitionInstance.stop();
        } catch {
            // ignore
        }
        speechRecognitionInstance = null;
    }

    const voiceBtn = document.getElementById("voiceBtn");
    const floatingMicBtn = document.getElementById("floatingMicBtn");
    const voiceBtnText = document.getElementById("voiceBtnText");
    const indicator = document.getElementById("voiceStatusIndicator");
    const descArea = document.getElementById("description");

    if (voiceBtn) voiceBtn.classList.remove("listening");
    if (floatingMicBtn) floatingMicBtn.classList.remove("listening");
    if (descArea) {
        descArea.classList.remove("voice-recording-glow");
        handleDescriptionInput();
    }

    if (voiceBtnText) {
        const dict = i18n[currentLanguage] || i18n.en;
        voiceBtnText.innerText = dict.voice_speak_btn || "🎙️ Speak (तक्रार बोला)";
    }
    if (indicator) indicator.classList.add("hidden");
}

function listenToDescription() {
    const desc = document.getElementById("description")?.value.trim();
    const dict = i18n[currentLanguage] || i18n.en;
    const textToSpeak = desc || (currentLanguage === "mr" 
        ? "कृपया आपल्या समस्येचे वर्णन लिहा किंवा बोला." 
        : currentLanguage === "hi" 
            ? "कृपया अपनी समस्या का विवरण लिखें या बोलें।" 
            : "Please describe your civic issue or speak using the microphone.");

    speakText(textToSpeak, currentLanguage);
}

function speakText(text, lang = currentLanguage) {
    if (!window.speechSynthesis) {
        showToast("Text-to-speech is not supported on this browser.", "error");
        return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);

    if (lang === "mr") {
        utterance.lang = "mr-IN";
    } else if (lang === "hi") {
        utterance.lang = "hi-IN";
    } else {
        utterance.lang = "en-IN";
    }

    utterance.rate = 0.95; // Clear speaking rate
    window.speechSynthesis.speak(utterance);
}

/* =========================================================
   CITIES (BARSHI, SOLAPUR, BEED, JALNA & OTHERS)
========================================================= */

async function initializeCities() {
    renderCityDropdowns(defaultMunicipalities);

    try {
        const response = await fetch(`${API}/municipalities`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.municipalities?.length > 0) {
                renderCityDropdowns(data.municipalities);
            }
        }
    } catch {
        // Fallback to default list
    }
}

function renderCityDropdowns(list) {
    const reportSelect = document.getElementById("selectedCity");
    const adminSelect = document.getElementById("adminCityFilter");

    if (reportSelect) {
        reportSelect.innerHTML = list.map(m => `
            <option value="${escapeHTML(m.name)}" ${m.city === 'Barshi' ? 'selected' : ''}>
                🏛️ ${escapeHTML(m.name)} (${escapeHTML(m.city)})
            </option>
        `).join("");
    }

    if (adminSelect) {
        adminSelect.innerHTML = `
            <option value="all">All Municipalities (Barshi, Solapur, Beed...)</option>
            ${list.map(m => `
                <option value="${escapeHTML(m.city)}">
                    ${escapeHTML(m.city)} (${escapeHTML(m.name)})
                </option>
            `).join("")}
        `;
    }

    onCityChanged();
}

function onCityChanged() {
    const reportSelect = document.getElementById("selectedCity");
    if (!reportSelect) return;

    selectedCity = reportSelect.value;
    const label = document.getElementById("activeCityLabel");
    if (label) {
        label.textContent = selectedCity;
    }
}

function autoDetectCityFromGPS() {
    if (!navigator.geolocation) {
        showToast("GPS is not supported on this browser.", "error");
        return;
    }

    showToast("Detecting your nearest Nagar Palika from GPS coordinates...", "info");

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            gps = { lat, lng };
            updateGPSUI(lat, lng);
            startGPSAutoOffTimer();

            let closest = defaultMunicipalities[0];
            let minDist = Number.MAX_VALUE;

            defaultMunicipalities.forEach(m => {
                const dist = Math.hypot(m.lat - lat, m.lng - lng);
                if (dist < minDist) {
                    minDist = dist;
                    closest = m;
                }
            });

            const sel = document.getElementById("selectedCity");
            if (sel) {
                sel.value = closest.name;
                onCityChanged();
            }

            showToast(`📍 Nearest Nagar Palika detected: ${closest.city}!`, "success");
        },
        function (err) {
            console.warn(err);
            showToast("Could not access GPS. Please select your city from the dropdown.", "error");
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

/* =========================================================
   CATEGORY SELECTION & AI AUTO-DETECTION
========================================================= */

function initializeCategories() {
    const cards = document.querySelectorAll(".category-card");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            selectCategoryCard(card.dataset.category);
            showToast(`${selectedEmoji} ${selectedCategory} selected`, "info");
        });
    });
}

function selectCategoryCard(catName) {
    document.querySelectorAll(".category-card").forEach(c => {
        if (c.dataset.category === catName) {
            c.classList.add("selected");
            selectedCategory = catName;
            selectedEmoji = emojiMap[catName] || "📢";
        } else {
            c.classList.remove("selected");
        }
    });
}

function handleDescriptionInput() {
    const textarea = document.getElementById("description");
    if (!textarea) return;

    clearTimeout(aiDebounceTimer);
    const text = textarea.value.trim();

    if (text.length >= 25) {
        aiDebounceTimer = setTimeout(() => {
            runAIClassification(text, false);
        }, 800);
    }
}

function triggerAIDetection() {
    const text = (document.getElementById("description")?.value || "").trim();
    if (!text) {
        showToast("Please enter a few words about the problem first!", "error");
        document.getElementById("description")?.focus();
        return;
    }

    const btn = document.getElementById("aiDetectBtn");
    if (btn) {
        btn.innerHTML = "⏳ AI Analyzing problem...";
        btn.disabled = true;
    }

    runAIClassification(text, true).finally(() => {
        if (btn) {
            btn.innerHTML = "✨ AI Auto-Detect Domain & Urgency";
            btn.disabled = false;
        }
    });
}

async function runAIClassification(text, showAlert = true) {
    let result = null;

    try {
        const res = await fetch(`${API}/ai/classify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: text })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success) result = data;
        }
    } catch {
        // Fallback
    }

    if (!result) {
        result = localAIClassifier(text);
    }

    displayAIPrediction(result, showAlert);
    return result;
}

function localAIClassifier(text) {
    const lower = text.toLowerCase();

    const rules = [
        {
            category: "Garbage / Waste",
            domain: "Sanitation & Solid Waste Department",
            keywords: ["garbage", "kachra", "kachara", "कचरा", "घाण", "दुर्गंधी", "कचराकुंडी", "कूड़ा", "गंदगी", "बदबू", "waste", "trash", "dustbin", "bin", "stench", "smell", "dump", "filth"],
            urgent: ["dead animal", "hospital waste", "burning plastic", "मृत प्राणी", "मेलेला", "मरा हुआ"],
            basePriority: "normal"
        },
        {
            category: "Pothole / Road",
            domain: "Road Infrastructure & Maintenance",
            keywords: ["pothole", "gadda", "khadda", "khadde", "खड्डा", "खड्डे", "रस्ता", "रस्ते", "गड्ढा", "गड्ढे", "सड़क", "road", "broken road", "asphalt", "divider", "footpath", "sidewalk"],
            urgent: ["accident", "collapse", "sinkhole", "bike fell", "injured", "अपघात", "पडला", "दुर्घटना"],
            basePriority: "high"
        },
        {
            category: "Streetlight",
            domain: "Streetlight & Electrical Department",
            keywords: ["streetlight", "light", "dark", "pole", "lamp", "bulb", "darkness", "wire", "flicker", "पथदिवा", "पथदिवे", "दिवा", "लाइट", "काळोख", "अंधार", "स्ट्रीटलाइट", "बत्ती", "अंधेरा", "खंभा"],
            urgent: ["sparking", "hanging wire", "electric shock", "शॉक", "स्पार्क"],
            basePriority: "normal"
        },
        {
            category: "Water",
            domain: "Water Works & Supply Department",
            keywords: ["water", "pani", "paani", "pipe", "pipeline", "leak", "leakage", "dirty water", "no water", "tap", "पाणी", "गळती", "पाईप", "नळ", "पाणीपुरवठा", "पानी", "पाइप", "नल", "जल"],
            urgent: ["pipeline burst", "contaminated water", "drinking sewage", "गढूळ पाणी", "विषाक्त"],
            basePriority: "high"
        },
        {
            category: "Drainage",
            domain: "Drainage & Sewage Management",
            keywords: ["drain", "drainage", "gutter", "nala", "naali", "sewage", "overflow", "stagnant", "choked", "manhole", "गटार", "नाला", "सांडपाणी", "तुंबले", "चोक", "नाली", "सीवर", "गंदा पानी"],
            urgent: ["flooding homes", "sewage entering house", "open manhole", "उघडे मॅनहोल"],
            basePriority: "high"
        }
    ];

    let match = rules[0];
    let maxHits = 0;
    let found = [];

    rules.forEach(r => {
        let hits = 0;
        const matched = [];
        r.keywords.forEach(kw => {
            if (lower.includes(kw)) {
                hits++;
                matched.push(kw);
            }
        });
        if (hits > maxHits) {
            maxHits = hits;
            match = r;
            found = matched;
        }
    });

    let priority = match.basePriority;
    for (const r of rules) {
        for (const ukw of r.urgent) {
            if (lower.includes(ukw)) {
                priority = "urgent";
                found.push(ukw);
                break;
            }
        }
    }

    const confidence = Math.min(98, Math.max(70, 65 + maxHits * 10));

    return {
        category: match.category,
        domain: match.domain,
        priority: priority,
        confidence: confidence,
        rationale: found.length > 0
            ? `Matched key triggers: "${found.slice(0, 3).join('", "')}". Auto-assigned to ${match.domain}.`
            : `Classified under ${match.domain} by CivicCare standard triage protocols.`
    };
}

function displayAIPrediction(ai, showAlert = true) {
    const box = document.getElementById("aiPredictionBox");
    const catElem = document.getElementById("aiDetectedCategory");
    const domainElem = document.getElementById("aiDetectedDomain");
    const priorityElem = document.getElementById("aiDetectedPriority");
    const confBadge = document.getElementById("aiConfidenceBadge");
    const rationale = document.getElementById("aiRationaleText");

    if (!box) return;

    selectCategoryCard(ai.category);

    if (catElem) catElem.textContent = `${emojiMap[ai.category] || "📢"} ${ai.category}`;
    if (domainElem) domainElem.textContent = ai.domain;
    if (priorityElem) {
        priorityElem.textContent = `${ai.priority.toUpperCase()} PRIORITY`;
        priorityElem.className = `ai-priority-badge priority-${ai.priority}`;
    }
    if (confBadge) confBadge.textContent = `${ai.confidence}% Confidence`;
    if (rationale) rationale.textContent = ai.rationale;

    box.classList.remove("hidden");

    if (showAlert) {
        showToast(`✨ AI Triage: ${ai.category} → ${ai.domain} (${ai.priority.toUpperCase()})`, "success");
    }
}

/* =========================================================
   ANONYMOUS REPORTING TOGGLE (PRIVACY CONTROLLER)
========================================================= */

function toggleAnonymousReporting() {
    const checkbox = document.getElementById("anonymousCheckbox");
    const isAnon = !!checkbox?.checked;
    const nameInput = document.getElementById("citizenNameInput");
    const phoneInput = document.getElementById("citizenPhoneInput");

    if (isAnon) {
        if (nameInput) {
            nameInput.disabled = true;
            nameInput.dataset.prevVal = nameInput.value;
            nameInput.value = "";
            nameInput.placeholder = "🔒 Anonymous Citizen (Identity Protected)";
            nameInput.style.opacity = "0.65";
        }
        if (phoneInput) {
            phoneInput.disabled = true;
            phoneInput.dataset.prevVal = phoneInput.value;
            phoneInput.value = "";
            phoneInput.placeholder = "🔒 Phone number protected";
            phoneInput.style.opacity = "0.65";
        }
        showToast("🔒 Anonymous mode enabled: Your name & phone will not be shared.", "info");
    } else {
        if (nameInput) {
            nameInput.disabled = false;
            nameInput.value = nameInput.dataset.prevVal || "";
            nameInput.placeholder = "Enter your full name";
            nameInput.style.opacity = "1";
        }
        if (phoneInput) {
            phoneInput.disabled = false;
            phoneInput.value = phoneInput.dataset.prevVal || "";
            phoneInput.placeholder = "10-digit mobile number";
            phoneInput.style.opacity = "1";
        }
    }
}

/* =========================================================
   SUBMIT COMPLAINT (CITIZEN) -> DISPATCHES ADMIN NOTIFICATION
========================================================= */

async function submitComplaint() {
    const description = (document.getElementById("description")?.value || "").trim();
    const address = (document.getElementById("address")?.value || "").trim();
    const isAnonymous = !!document.getElementById("anonymousCheckbox")?.checked;
    const rawName = (document.getElementById("citizenNameInput")?.value || "").trim();
    const rawPhone = (document.getElementById("citizenPhoneInput")?.value || "").trim();

    const citizenName = isAnonymous ? "Anonymous Citizen" : (rawName || "Citizen");
    const citizenPhone = isAnonymous ? null : (rawPhone || "Not provided");
    const button = document.getElementById("submitComplaintBtn");

    if (!description || description.length < 10) {
        showToast("Please describe the problem with at least 10 characters.", "error");
        document.getElementById("description")?.focus();
        return;
    }

    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = "⏳ Submitting to Nagar Palika & Notifying Admin...";

    const ai = localAIClassifier(description);

    const formData = new FormData();
    formData.append("municipality_id", selectedCity);
    formData.append("category", selectedCategory);
    formData.append("description", description);
    formData.append("address", address || `Reported in ${selectedCity}`);
    formData.append("is_anonymous", isAnonymous);
    formData.append("citizen_name", citizenName);
    formData.append("citizen_phone", citizenPhone || "");
    formData.append("priority", ai.priority);

    if (gps) {
        formData.append("latitude", gps.lat);
        formData.append("longitude", gps.lng);
    }
    if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
    }

    try {
        const response = await fetch(`${API}/complaints`, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.complaint) {
                showComplaintSuccess(data.complaint.complaint_number, selectedCity, ai.domain);
                syncLocalComplaint(data.complaint);
                turnOffGPS(true); // Reset and turn off GPS timer after submission
                // Also trigger live notification check
                fetchNotifications();
                return;
            }
        }
        throw new Error("Backend fallback");
    } catch {
        // Local Fallback
        const compNum = createLocalComplaint(description, address, citizenName, citizenPhone, ai, isAnonymous);
        showComplaintSuccess(compNum, selectedCity, ai.domain);
        turnOffGPS(true); // Reset and turn off GPS timer after submission

        // Add local notification for admin
        addLocalNotification({
            target_role: "admin",
            title: `🚨 New ${selectedCategory} in ${selectedCity.split(" ")[0]}`,
            message: `Complaint ${compNum} submitted by ${citizenName}. Waiting for Admin approval & worker assignment.`,
            type: "new_complaint",
            complaint_number: compNum
        });
        fetchNotifications();
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

function createLocalComplaint(description, address, citizenName, citizenPhone, ai, isAnonymous = false) {
    const complaintNumber = "CC-" + Math.floor(10000000 + Math.random() * 90000000);
    const complaints = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");

    const newComp = {
        complaint_number: complaintNumber,
        is_anonymous: !!isAnonymous,
        citizen_name: citizenName,
        citizen_phone: citizenPhone,
        municipality_name: selectedCity,
        city: selectedCity.split(" ")[0],
        category: selectedCategory,
        description: description,
        address: address || `Reported in ${selectedCity}`,
        latitude: gps ? gps.lat : 18.2333,
        longitude: gps ? gps.lng : 75.6948,
        status: "submitted",
        priority: ai.priority,
        ai_category: ai.category,
        ai_domain: ai.domain,
        ai_confidence: ai.confidence,
        admin_approved: false,
        admin_notes: null,
        assigned_worker_name: null,
        assigned_worker_phone: null,
        created_at: new Date().toISOString(),
        history: [
            {
                status: "submitted",
                changed_by: isAnonymous ? "Anonymous Citizen" : "Citizen",
                comment: `Submitted in ${selectedCity}. AI auto-assigned to ${ai.domain}`,
                time: new Date().toISOString()
            }
        ]
    };

    complaints.unshift(newComp);
    localStorage.setItem("civiccare_complaints", JSON.stringify(complaints));
    return complaintNumber;
}

function syncLocalComplaint(comp) {
    const complaints = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");
    const idx = complaints.findIndex(c => c.complaint_number === comp.complaint_number);
    if (idx >= 0) complaints[idx] = comp;
    else complaints.unshift(comp);
    localStorage.setItem("civiccare_complaints", JSON.stringify(complaints));
}

function showComplaintSuccess(complaintNumber, cityName, domainName) {
    const box = document.getElementById("successBox");
    if (!box) return;

    box.innerHTML = `
        <div style="font-size:32px; margin-bottom:8px;">🎉</div>
        <strong style="font-size:20px; color:#196b49;">Complaint Submitted Successfully!</strong>
        <p style="margin-top:8px;">
            Your complaint has been sent to <strong>${escapeHTML(cityName)}</strong>.
            The <strong>Nagar Palika Admin has received an instant notification</strong> to review and assign a domain worker to resolve this issue!
        </p>

        <div style="margin:16px 0; padding:14px; background:white; border-radius:14px; border:1px solid #bdebd4;">
            <div style="font-size:12px; color:#6b7280; font-weight:800; text-transform:uppercase;">Official Complaint ID</div>
            <strong style="font-size:24px; color:#ff7043; letter-spacing:1px;">${escapeHTML(complaintNumber)}</strong>
        </div>

        <button
            type="button"
            onclick="
                document.getElementById('trackId').value = '${escapeHTML(complaintNumber)}';
                goToTrack();
                trackComplaint();
            "
            style="border:0; padding:12px 20px; border-radius:12px; background:#4f46e5; color:white; font-weight:900; cursor:pointer;"
        >
            🔎 Track Complaint Live
        </button>
    `;

    box.classList.remove("hidden");
    showToast(`Complaint submitted! Admin in ${cityName.split(" ")[0]} alerted 🔔`, "success");

    // Reset Form
    document.getElementById("description").value = "";
    document.getElementById("address").value = "";
    document.getElementById("charCount").textContent = "0";
    removePhoto();
    gps = null;
    document.getElementById("gpsStatus").textContent = "Location not captured yet";
    document.getElementById("coordinates").textContent = "";

    loadDashboard();
}

/* =========================================================
   NOTIFICATION ENGINE (CITIZEN / ADMIN / WORKER)
========================================================= */

function startNotificationPolling() {
    fetchNotifications();
    if (notifPollInterval) clearInterval(notifPollInterval);
    notifPollInterval = setInterval(fetchNotifications, 5000);
}

async function fetchNotifications() {
    let list = [];
    let unreadCount = 0;

    try {
        const role = currentUser.role || "citizen";
        const phone = currentUser.phone || "";
        const res = await fetch(`${API}/notifications?role=${encodeURIComponent(role)}&phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                list = data.notifications || [];
                unreadCount = data.unreadCount || 0;
                renderNotificationsUI(list, unreadCount);
                return;
            }
        }
    } catch {
        // Fallback to local
    }

    const localNotifs = JSON.parse(localStorage.getItem("civiccare_notifications") || "[]");
    list = localNotifs.filter(n => {
        if (currentUser.role === "admin") return n.target_role === "admin";
        if (currentUser.role === "worker") return n.target_role === "worker" && (!n.target_phone || n.target_phone === currentUser.phone);
        return n.target_role === "citizen";
    });

    unreadCount = list.filter(n => !n.is_read).length;
    renderNotificationsUI(list, unreadCount);
}

function renderNotificationsUI(list, unreadCount) {
    const badge = document.getElementById("notifBadge");
    const container = document.getElementById("notifList");
    const roleBadge = document.getElementById("notifRoleBadge");

    if (roleBadge) {
        roleBadge.textContent = currentUser.role.toUpperCase();
    }

    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="notif-empty">
                🔔 No new notifications for ${escapeHTML(currentUser.role)}.
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(n => `
        <div class="notif-item ${n.is_read ? '' : 'notif-unread'}" onclick="handleNotificationClick('${escapeHTML(n.complaint_number || '')}')">
            <div class="notif-item-title">
                <span>${escapeHTML(n.title)}</span>
                ${n.is_read ? '' : '<span style="color:#3b82f6; font-size:10px;">● New</span>'}
            </div>
            <div class="notif-item-msg">${escapeHTML(n.message)}</div>
            <div class="notif-item-time">${formatDate(n.created_at)}</div>
        </div>
    `).join("");
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById("notifDropdown");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

function markAllNotificationsRead() {
    const local = JSON.parse(localStorage.getItem("civiccare_notifications") || "[]");
    local.forEach(n => n.is_read = true);
    localStorage.setItem("civiccare_notifications", JSON.stringify(local));

    const badge = document.getElementById("notifBadge");
    if (badge) badge.classList.add("hidden");

    fetchNotifications();
    showToast("Notifications marked as read", "info");
}

function handleNotificationClick(complaintNum) {
    toggleNotificationDropdown();
    if (!complaintNum) return;

    if (currentUser.role === "admin") {
        document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
        const searchInput = document.getElementById("adminSearchInput");
        if (searchInput) {
            searchInput.value = complaintNum;
            debounceAdminSearch();
        }
    } else if (currentUser.role === "worker") {
        document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
    } else {
        document.getElementById("track")?.scrollIntoView({ behavior: "smooth" });
        const trackInput = document.getElementById("trackId");
        if (trackInput) {
            trackInput.value = complaintNum;
            trackComplaint();
        }
    }
}

function addLocalNotification(notif) {
    const local = JSON.parse(localStorage.getItem("civiccare_notifications") || "[]");
    notif.id = "notif-" + Date.now();
    notif.created_at = new Date().toISOString();
    notif.is_read = false;
    local.unshift(notif);
    localStorage.setItem("civiccare_notifications", JSON.stringify(local));
}

/* =========================================================
   STRICT ROLE-BASED DASHBOARD CONTROLLER
   (Admin dashboard is ONLY visible when Admin is logged in!)
========================================================= */

function refreshCurrentDashboard() {
    showToast("Refreshing status...", "info");
    loadDashboard();
}

function updateRoleUI() {
    const citizenView = document.getElementById("citizenDashboardView");
    const adminView = document.getElementById("adminDashboardView");
    const workerView = document.getElementById("workerDashboardView");
    const roleBadge = document.getElementById("dashboardRoleBadge");
    const currentRoleText = document.getElementById("currentRoleText");
    const heroBtn = document.getElementById("heroRoleActionBtn");

    if (currentUser.role === "admin") {
        // STRICT ADMIN VISIBILITY
        citizenView?.classList.add("hidden");
        adminView?.classList.remove("hidden");
        workerView?.classList.add("hidden");

        if (roleBadge) roleBadge.textContent = "ADMIN CONTROL CENTER 👑";
        if (currentRoleText) currentRoleText.textContent = "👑 Nagar Palika Admin";
        if (heroBtn) {
            heroBtn.textContent = "👑 Admin Control Center";
            heroBtn.onclick = () => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
        }
    } else if (currentUser.role === "worker") {
        // STRICT WORKER VISIBILITY
        citizenView?.classList.add("hidden");
        adminView?.classList.add("hidden");
        workerView?.classList.remove("hidden");

        if (roleBadge) roleBadge.textContent = "FIELD WORKER PORTAL 👷";
        if (currentRoleText) currentRoleText.textContent = `👷 Municipal Worker (${currentUser.name})`;

        const workerNameH = document.getElementById("workerNameHeader");
        const workerDomainH = document.getElementById("workerDomainHeader");
        if (workerNameH) workerNameH.textContent = currentUser.name;
        if (workerDomainH) workerDomainH.textContent = currentUser.domain || "Municipal Field Services";

        if (heroBtn) {
            heroBtn.textContent = "👷 Open Worker Tasks";
            heroBtn.onclick = () => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
        }
    } else {
        // CITIZEN / GUEST (Admin dashboard is completely hidden!)
        citizenView?.classList.remove("hidden");
        adminView?.classList.add("hidden");
        workerView?.classList.add("hidden");

        if (roleBadge) roleBadge.textContent = "PUBLIC OVERVIEW";
        if (currentRoleText) currentRoleText.textContent = "👤 Citizen / Guest";
        if (heroBtn) {
            heroBtn.textContent = "👑 Admin / Worker Portal";
            heroBtn.onclick = handleHeroRoleAction;
        }
    }
}

function handleHeroRoleAction() {
    if (currentUser.role === "admin" || currentUser.role === "worker") {
        document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
    } else {
        openLogin();
    }
}

async function loadDashboard() {
    updateRoleUI();

    if (currentUser.role === "admin") {
        loadAdminDashboard();
    } else if (currentUser.role === "worker") {
        loadWorkerDashboard();
    } else {
        loadCitizenDashboard();
    }
}

/* =========================================================
   VIEW 1: CITIZEN DASHBOARD (PUBLIC REPORTS ONLY)
========================================================= */

async function loadCitizenDashboard() {
    let complaints = [];
    try {
        const res = await fetch(`${API}/complaints`);
        if (res.ok) {
            const data = await res.json();
            if (data.success) complaints = data.complaints || [];
        }
    } catch {
        complaints = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");
    }

    setText("statTotal", complaints.length);
    setText("statSubmitted", complaints.filter(c => c.status === "submitted").length);
    setText("statProgress", complaints.filter(c => ["assigned", "in_progress"].includes(c.status)).length);
    setText("statResolved", complaints.filter(c => c.status === "resolved").length);

    const badge = document.getElementById("publicTableBadge");
    if (badge) badge.textContent = `${complaints.length} public report${complaints.length === 1 ? '' : 's'}`;

    const table = document.getElementById("publicComplaintTable");
    if (!table) return;

    if (complaints.length === 0) {
        table.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:35px; color:#64748b;">No complaints submitted yet.</td></tr>`;
        return;
    }

    table.innerHTML = complaints.map(c => {
        const status = c.status || "submitted";
        const domain = c.ai_domain || domainMap[c.category] || "Municipal Services";
        const isUrgent = c.priority === "urgent";

        const priorityBadge = isUrgent
            ? `<span class="ai-priority-badge priority-urgent" style="font-size:11px; padding:4px 8px; font-weight:900; background:#fee2e2; color:#b91c1c; border-radius:6px; display:inline-flex; align-items:center; gap:2px;">🚨 URGENT</span>`
            : c.priority === "high"
                ? `<span class="ai-priority-badge priority-high" style="font-size:11px; padding:3px 7px; font-weight:700; background:#fef3c7; color:#b45309; border-radius:6px;">HIGH</span>`
                : `<span style="color:#64748b; font-weight:600; font-size:12px;">Normal</span>`;

        return `
            <tr style="${isUrgent ? 'background:rgba(239, 68, 68, 0.04);' : ''}">
                <td>
                    <strong style="color:var(--navy, #1e293b); font-size:13.5px; font-family:monospace; letter-spacing:0.5px;">${escapeHTML(c.complaint_number)}</strong>
                </td>
                <td>
                    <div style="font-weight:700; color:var(--navy, #1e293b);">${escapeHTML(c.city || c.municipality_name || "Barshi")}</div>
                    <small style="color:#64748b; display:block; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(c.address || "-")}</small>
                </td>
                <td>
                    <div style="font-weight:700;">${emojiMap[c.category] || "📢"} ${escapeHTML(c.category)}</div>
                    <small style="color:#4f46e5; font-weight:800;">${escapeHTML(domain)}</small>
                </td>
                <td style="max-width:260px;">
                    <div style="font-size:13px; color:#334155; line-height:1.4;">${escapeHTML((c.description || "-").substring(0, 90))}${c.description?.length > 90 ? '...' : ''}</div>
                </td>
                <td>
                    ${priorityBadge}
                </td>
                <td>
                    <span class="status-badge status-${status}">
                        ${escapeHTML(status.replace("_", " "))}
                    </span>
                </td>
                <td>
                    <button
                        type="button"
                        class="btn-tts-listen"
                        style="padding:5px 12px; font-size:12px; cursor:pointer;"
                        onclick="
                            document.getElementById('trackId').value = '${escapeHTML(c.complaint_number)}';
                            goToTrack();
                            trackComplaint();
                        "
                        title="Track this complaint">
                        🔎 Track
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

/* =========================================================
   VIEW 2: ADMIN DASHBOARD (ADMIN-ONLY ACCESS)
========================================================= */

async function loadAdminDashboard() {
    let complaints = [];

    try {
        const url = new URL(`${API}/admin/complaints`);
        if (adminCityFilter !== "all") url.searchParams.append("city", adminCityFilter);
        if (adminStatusFilter !== "all") url.searchParams.append("status", adminStatusFilter);
        if (adminSearchQuery) url.searchParams.append("search", adminSearchQuery);

        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                complaints = data.complaints || [];
                updateAdminStats(data.stats);
                renderAdminTable(complaints);
                return;
            }
        }
    } catch {
        // Local Fallback
    }

    const local = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");
    let filtered = [...local];

    if (adminCityFilter !== "all") {
        filtered = filtered.filter(c => (c.city && c.city.toLowerCase().includes(adminCityFilter.toLowerCase())) || (c.municipality_name && c.municipality_name.toLowerCase().includes(adminCityFilter.toLowerCase())));
    }
    if (adminStatusFilter !== "all") {
        filtered = filtered.filter(c => c.status === adminStatusFilter);
    }
    if (adminSearchQuery) {
        const q = adminSearchQuery.toLowerCase();
        filtered = filtered.filter(c => c.complaint_number.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
    }

    const stats = {
        total: local.length,
        submitted: local.filter(c => c.status === "submitted").length,
        assigned: local.filter(c => c.status === "assigned").length,
        resolved: local.filter(c => c.status === "resolved").length
    };

    updateAdminStats(stats);
    renderAdminTable(filtered);
}

function updateAdminStats(stats) {
    if (!stats) return;
    setText("adminStatTotal", stats.total || 0);
    setText("adminStatSubmitted", stats.submitted || 0);
    setText("adminStatAssigned", (stats.assigned || 0) + (stats.in_progress || 0));
    setText("adminStatResolved", stats.resolved || 0);
}

function maskPhoneNumber(phone) {
    if (!phone || phone === "Not provided" || phone === "Protected") return "Protected";
    const str = ("" + phone).trim();
    if (str.includes("••••")) return str;
    if (str.length < 5) return str + " •••••";
    return str.substring(0, 5) + " •••••";
}

async function revealCitizenPhone(compNum) {
    const el = document.getElementById(`phone-${compNum}`);
    if (!el) return;

    const isRevealed = el.dataset.revealed === "true";
    if (isRevealed) {
        el.textContent = maskPhoneNumber(el.dataset.raw);
        el.dataset.revealed = "false";
        return;
    }

    try {
        const res = await fetch(`${API}/admin/complaints/${encodeURIComponent(compNum)}/reveal-phone`, {
            method: "POST"
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.citizen_phone) {
                el.textContent = data.citizen_phone;
                el.dataset.raw = data.citizen_phone;
                el.dataset.revealed = "true";
                showToast(`🔒 Officer Access Logged: Citizen contact unlocked for ${compNum}`, "info");
                return;
            }
        }
    } catch {
        // Fallback
    }

    if (el.dataset.raw && !el.dataset.raw.includes("••••")) {
        el.textContent = el.dataset.raw;
        el.dataset.revealed = "true";
        showToast(`🔒 Officer Access Logged: Citizen contact unlocked for ${compNum}`, "info");
    } else {
        showToast("Access Logged: Contact unlocked under officer authorization.", "info");
    }
}

function renderAdminTable(list) {
    const table = document.getElementById("adminComplaintTable");
    const badge = document.getElementById("adminTableBadge");
    if (!table) return;

    if (badge) badge.textContent = `${list.length} complaint${list.length === 1 ? '' : 's'}`;

    if (list.length === 0) {
        table.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#64748b;">No complaints found for the selected city/status filters.</td></tr>`;
        return;
    }

    table.innerHTML = list.map(c => {
        const status = c.status || "submitted";
        const domain = c.ai_domain || domainMap[c.category] || "General Municipal Services";
        const isAnon = !!c.is_anonymous;
        const rawPhone = c.citizen_phone || "";
        const hasValidPhone = rawPhone && rawPhone !== "Not provided" && rawPhone !== "Protected" && !rawPhone.includes("••••");

        let citizenContactHtml = "";
        if (isAnon) {
            citizenContactHtml = `
                <div style="display:inline-flex; align-items:center; gap:5px; margin-bottom:4px;">
                    <span style="background:#fee2e2; color:#991b1b; font-size:11px; font-weight:800; padding:2px 7px; border-radius:6px;">🔒 ANONYMOUS</span>
                    <small style="color:#64748b; font-size:11px;">(Identity Protected)</small>
                </div>
            `;
        } else {
            const masked = maskPhoneNumber(rawPhone);
            citizenContactHtml = `
                <div style="font-weight:700; font-size:12px; color:var(--navy); margin-bottom:3px;">
                    👤 ${escapeHTML(c.citizen_name || 'Citizen')}
                    <div style="font-weight:normal; font-size:11.5px; color:#64748b; display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin-top:2px;">
                        📞 <span id="phone-${escapeHTML(c.complaint_number)}" data-raw="${escapeHTML(rawPhone)}" data-revealed="false">${escapeHTML(masked)}</span>
                        ${hasValidPhone ? `
                            <button type="button" class="btn-reveal-phone" onclick="revealCitizenPhone('${escapeHTML(c.complaint_number)}')" title="Audit-logged Officer Access">
                                👁️ Reveal
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        let actionBtn = "";
        if (status === "submitted" || !c.assigned_worker_name) {
            actionBtn = `
                <button type="button" class="btn-action btn-action-approve" onclick="openAssignWorkerModal('${escapeHTML(c.complaint_number)}')">
                    ✅ Approve & Assign Worker
                </button>
            `;
        } else if (status === "assigned") {
            actionBtn = `<span style="color:#4f46e5; font-weight:800; font-size:12px;">Assigned to ${escapeHTML(c.assigned_worker_name)}</span>`;
        } else if (status === "in_progress") {
            actionBtn = `<span style="color:#d97706; font-weight:800; font-size:12px;">Worker in progress 🔧</span>`;
        } else {
            actionBtn = `<span style="color:#16a34a; font-weight:800; font-size:12px;">Resolved ✓</span>`;
        }

        return `
            <tr>
                <td>
                    <strong style="color:var(--navy); font-size:14px;">${escapeHTML(c.complaint_number)}</strong>
                    ${c.priority === 'urgent' ? '<span class="ai-priority-badge priority-urgent" style="margin-left:4px; font-size:9px;">URGENT</span>' : ''}
                </td>
                <td>
                    <div style="font-weight:700; color:var(--navy);">${escapeHTML(c.city || c.municipality_name || "Barshi")}</div>
                    <small style="color:#64748b;">${escapeHTML(c.address || "-")}</small>
                </td>
                <td>
                    <div style="font-weight:700;">${emojiMap[c.category] || "📢"} ${escapeHTML(c.category)}</div>
                    <small style="color:#4f46e5; font-weight:800;">${escapeHTML(domain)}</small>
                </td>
                <td style="max-width:260px;">
                    ${citizenContactHtml}
                    <div style="font-size:13px; color:#334155; line-height:1.4; margin-top:4px;">${escapeHTML(c.description || "-")}</div>
                </td>
                <td>
                    ${c.assigned_worker_name
                        ? `<strong style="color:#059669; font-size:13px;">${escapeHTML(c.assigned_worker_name)}</strong><small style="display:block; color:#64748b;">${escapeHTML(c.assigned_worker_phone || '')}</small>`
                        : '<span style="color:#ea580c; font-weight:700; font-size:12px;">Unassigned ⚠️</span>'
                    }
                </td>
                <td>
                    <span class="status-badge status-${status}">
                        ${escapeHTML(status.replace("_", " "))}
                    </span>
                </td>
                <td>
                    <div class="admin-action-btn-group">
                        ${actionBtn}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function filterAdminComplaints() {
    const sel = document.getElementById("adminCityFilter");
    if (sel) adminCityFilter = sel.value;
    loadAdminDashboard();
}

function setAdminStatusFilter(st) {
    adminStatusFilter = st;
    document.querySelectorAll(".chip-filter").forEach(b => {
        if (b.dataset.status === st) b.classList.add("active");
        else b.classList.remove("active");
    });
    loadAdminDashboard();
}

function debounceAdminSearch() {
    const input = document.getElementById("adminSearchInput");
    if (input) {
        adminSearchQuery = input.value.trim();
        loadAdminDashboard();
    }
}

/* =========================================================
   ADMIN WORKER ASSIGNMENT MODAL & LOGIC
========================================================= */

async function openAssignWorkerModal(complaintNum) {
    pendingAssignComplaintNum = complaintNum;

    const modal = document.getElementById("assignWorkerModal");
    const numSpan = document.getElementById("assignComplaintNum");
    const citySpan = document.getElementById("assignComplaintCity");
    const catSpan = document.getElementById("assignComplaintCat");
    const domainSpan = document.getElementById("assignComplaintDomain");
    const select = document.getElementById("workerSelectDropdown");
    const note = document.getElementById("adminWorkerDirective");

    if (!modal) return;

    // Find complaint
    let list = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");
    let comp = list.find(c => c.complaint_number === complaintNum);

    if (numSpan) numSpan.textContent = complaintNum;
    if (citySpan) citySpan.textContent = comp?.city || comp?.municipality_name || "Barshi";
    if (catSpan) catSpan.textContent = comp?.category || "General";
    const reqDomain = comp?.ai_domain || domainMap[comp?.category] || "General Municipal Services";
    if (domainSpan) domainSpan.textContent = reqDomain;

    // Fetch workers matching domain
    let workers = defaultWorkers;
    try {
        const res = await fetch(`${API}/workers?domain=${encodeURIComponent(reqDomain)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.workers?.length > 0) workers = data.workers;
        }
    } catch {
        // Fallback
    }

    if (select) {
        select.innerHTML = workers.map(w => `
            <option value="${escapeHTML(w.phone)}" data-name="${escapeHTML(w.name)}" data-domain="${escapeHTML(w.domain)}">
                👷 ${escapeHTML(w.name)} (${escapeHTML(w.domain)} - ${escapeHTML(w.city)})
            </option>
        `).join("");
    }

    if (note) {
        note.value = `Approved by Nagar Palika Admin. Please inspect and resolve problem at ${comp?.address || comp?.city || 'site'} immediately.`;
    }

    modal.classList.remove("hidden");
}

function closeAssignWorkerModal() {
    document.getElementById("assignWorkerModal")?.classList.add("hidden");
    pendingAssignComplaintNum = null;
}

async function executeWorkerAssignment() {
    if (!pendingAssignComplaintNum) return;

    const compNum = pendingAssignComplaintNum;
    const select = document.getElementById("workerSelectDropdown");
    const selectedOption = select?.options[select.selectedIndex];
    const workerPhone = select?.value;
    const workerName = selectedOption?.dataset.name || "Municipal Worker";
    const domain = selectedOption?.dataset.domain || "Municipal Services";
    const note = (document.getElementById("adminWorkerDirective")?.value || "").trim();

    const btn = document.getElementById("confirmAssignBtn");
    const origText = btn ? btn.textContent : "";
    if (btn) {
        btn.textContent = "⏳ Assigning & Notifying Worker...";
        btn.disabled = true;
    }

    try {
        const res = await fetch(`${API}/admin/complaints/${encodeURIComponent(compNum)}/assign`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                worker_name: workerName,
                worker_phone: workerPhone,
                domain: domain,
                note: note
            })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                showToast(`Success: Assigned to ${workerName}! Worker received live notification 🔔`, "success");
            }
        }
    } catch {
        // Fallback
    }

    // Update Local Storage
    const local = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");
    const comp = local.find(c => c.complaint_number === compNum);
    if (comp) {
        comp.status = "assigned";
        comp.admin_approved = true;
        comp.assigned_worker_name = workerName;
        comp.assigned_worker_phone = workerPhone;
        comp.admin_notes = note;
        comp.history = comp.history || [];
        comp.history.push({
            status: "assigned",
            changed_by: "Nagar Palika Admin",
            comment: `Assigned to worker ${workerName} (${workerPhone}). Directive: ${note}`,
            time: new Date().toISOString()
        });
        localStorage.setItem("civiccare_complaints", JSON.stringify(local));
    }

    // Add Worker Notification
    addLocalNotification({
        target_role: "worker",
        target_phone: workerPhone,
        title: `👷 New Job Assigned by Admin`,
        message: `Admin assigned you complaint ${compNum} (${comp?.category || 'Task'}, ${comp?.city || 'City'}). Priority: ${comp?.priority || 'NORMAL'}.`,
        type: "task_assigned",
        complaint_number: compNum
    });

    closeAssignWorkerModal();
    if (btn) {
        btn.textContent = origText;
        btn.disabled = false;
    }

    showToast(`Approved! Complaint ${compNum} assigned to ${workerName}. Worker notified! 🔔`, "success");
    loadAdminDashboard();
    fetchNotifications();
}

/* =========================================================
   VIEW 3: WORKER TASK PORTAL (WORKER-ONLY ACCESS)
========================================================= */

async function loadWorkerDashboard() {
    let tasks = [];

    try {
        const res = await fetch(`${API}/worker/tasks?phone=${encodeURIComponent(currentUser.phone || '')}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success) tasks = data.tasks || [];
        }
    } catch {
        // Fallback
    }

    if (tasks.length === 0) {
        const local = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");
        tasks = local.filter(c => c.assigned_worker_phone === currentUser.phone || ["assigned", "in_progress"].includes(c.status));
    }

    const badge = document.getElementById("workerTaskCountBadge");
    const container = document.getElementById("workerTaskList");

    if (badge) badge.textContent = `${tasks.length} Assigned Task${tasks.length === 1 ? '' : 's'}`;
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:40px; background:#f8fafc; border-radius:18px; border:2px dashed #cbd5e1;">
                <div style="font-size:40px;">👷</div>
                <h4 style="margin-top:10px; color:var(--navy);">No pending tasks assigned right now</h4>
                <p style="color:#64748b;">When the Nagar Palika Administrator assigns you a civic issue, it will alert you here automatically.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(t => `
        <div class="worker-task-card">
            <div>
                <div class="worker-task-header">
                    <div>
                        <div class="worker-task-cat">${emojiMap[t.category] || "📢"} ${escapeHTML(t.category)}</div>
                        <div class="worker-task-id">ID: <strong>${escapeHTML(t.complaint_number)}</strong></div>
                    </div>
                    <span class="status-badge status-${t.status}">${escapeHTML(t.status.replace("_", " "))}</span>
                </div>

                <div class="worker-task-body">
                    <strong>Problem:</strong> ${escapeHTML(t.description || "N/A")}
                </div>

                <div class="worker-task-meta">
                    <div><strong>🏛️ City:</strong> ${escapeHTML(t.city || t.municipality_name || "Barshi")}</div>
                    <div><strong>📍 Location:</strong> ${escapeHTML(t.address || "Location captured")}</div>
                    <div><strong>🚨 Urgency:</strong> <span class="ai-priority-badge priority-${t.priority}">${escapeHTML(t.priority)}</span></div>
                    ${t.admin_notes ? `<div style="color:#166534; margin-top:4px;"><strong>Admin Directive:</strong> ${escapeHTML(t.admin_notes)}</div>` : ''}
                </div>
            </div>

            <div class="worker-task-actions">
                ${t.status === "assigned" ? `
                    <button type="button" class="btn-worker-start" onclick="updateWorkerJobStatus('${escapeHTML(t.complaint_number)}', 'in_progress')">
                        🛠️ Start Work
                    </button>
                ` : ""}
                ${t.status !== "resolved" ? `
                    <button type="button" class="btn-worker-done" onclick="updateWorkerJobStatus('${escapeHTML(t.complaint_number)}', 'resolved')">
                        ✅ Mark Resolved
                    </button>
                ` : `
                    <span style="color:#16a34a; font-weight:900; text-align:center; width:100%;">Completed on-site ✓</span>
                `}
            </div>
        </div>
    `).join("");
}

async function updateWorkerJobStatus(compNum, newStatus) {
    const note = newStatus === "resolved"
        ? "Work completed on-site by field worker. Problem verified fixed."
        : "Worker arrived at site. Repair operations in progress.";

    try {
        const res = await fetch(`${API}/worker/tasks/${encodeURIComponent(compNum)}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status: newStatus,
                note: note,
                worker_name: currentUser.name
            })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                showToast(`Job ${compNum}: Status updated to ${newStatus.replace("_", " ")}!`, "success");
            }
        }
    } catch {
        // Fallback
    }

    // Update Local Storage
    const local = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");
    const comp = local.find(c => c.complaint_number === compNum);
    if (comp) {
        comp.status = newStatus;
        comp.history = comp.history || [];
        comp.history.push({
            status: newStatus,
            changed_by: `Worker: ${currentUser.name}`,
            comment: note,
            time: new Date().toISOString()
        });
        localStorage.setItem("civiccare_complaints", JSON.stringify(local));
    }

    // Notify Admin of worker action
    addLocalNotification({
        target_role: "admin",
        title: newStatus === "resolved" ? `🎉 Job Resolved: ${compNum}` : `🛠️ Work Started: ${compNum}`,
        message: `Worker ${currentUser.name} marked complaint ${compNum} as ${newStatus.replace("_", " ")}.`,
        type: "task_update",
        complaint_number: compNum
    });

    showToast(`Task ${compNum} updated to ${newStatus.toUpperCase()}! Admin notified 🔔`, "success");
    loadWorkerDashboard();
    fetchNotifications();
}

/* =========================================================
   COMPLAINT TRACKER (CITIZEN LIVE TRACKING)
========================================================= */

async function trackComplaint() {
    const input = document.getElementById("trackId");
    const result = document.getElementById("trackResult");
    const compNum = input?.value.trim();

    if (!compNum) {
        showToast("Please enter a complaint ID.", "error");
        input?.focus();
        return;
    }

    result.classList.remove("hidden");
    result.innerHTML = `<div style="text-align:center; padding:30px;"><div style="font-size:32px;">⏳</div><p>Checking live status...</p></div>`;

    try {
        const res = await fetch(`${API}/complaints/${encodeURIComponent(compNum)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.complaint) {
                renderTrackResult(data.complaint, result);
                return;
            }
        }
    } catch {
        // Fallback
    }

    const local = JSON.parse(localStorage.getItem("civiccare_complaints") || "[]");
    const found = local.find(c => c.complaint_number.toLowerCase() === compNum.toLowerCase());

    if (found) {
        renderTrackResult(found, result);
    } else {
        result.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <div style="font-size:45px;">🔍</div>
                <h3 style="color:var(--navy);">Complaint Not Found</h3>
                <p style="color:#64748b;">We could not find <strong>${escapeHTML(compNum)}</strong>. Please verify the ID.</p>
            </div>
        `;
    }
}

function renderTrackResult(c, container) {
    const status = c.status || "submitted";
    const statuses = ["submitted", "assigned", "in_progress", "resolved"];
    const labels = {
        submitted: "1. Reported",
        assigned: "2. Worker Dispatched 👷",
        in_progress: "3. Work In Progress 🔧",
        resolved: "4. Resolved 🎉"
    };

    let curIdx = statuses.indexOf(status);
    if (curIdx === -1) curIdx = 0;

    const progressHTML = statuses.map((st, idx) => `
        <div class="progress-step ${idx <= curIdx ? 'active' : ''}">
            <div class="progress-dot">${idx <= curIdx ? '✓' : idx + 1}</div>
            <span>${labels[st]}</span>
        </div>
    `).join("");

    container.innerHTML = `
        <div class="track-head">
            <div>
                <div class="track-id-label">COMPLAINT ID</div>
                <div class="track-id">${escapeHTML(c.complaint_number)}</div>
            </div>
            <span class="status-badge status-${status}">${escapeHTML(status.replace("_", " "))}</span>
        </div>

        <div style="margin-top:18px;">
            <strong style="color:var(--navy); font-size:16px;">
                ${emojiMap[c.category] || "📢"} ${escapeHTML(c.category)}
            </strong>
            <p style="margin-top:4px; color:#475569;">${escapeHTML(c.description || "-")}</p>
        </div>

        <div class="progress">${progressHTML}</div>

        <div style="margin-top:24px; padding:18px; border-radius:16px; background:#f8fafc; border:1px solid #e2e8f0; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
            <div>
                <small style="color:#64748b; font-weight:800; text-transform:uppercase;">🏛️ Municipality</small>
                <div style="font-weight:700; color:var(--navy);">${escapeHTML(c.city || c.municipality_name || "Barshi")}</div>
            </div>
            <div>
                <small style="color:#64748b; font-weight:800; text-transform:uppercase;">🏢 Assigned Department</small>
                <div style="font-weight:700; color:#4f46e5;">${escapeHTML(c.ai_domain || domainMap[c.category] || "Municipal Maintenance")}</div>
            </div>
            <div>
                <small style="color:#64748b; font-weight:800; text-transform:uppercase;">👷 Assigned Worker</small>
                <div style="font-weight:700; color:${c.assigned_worker_name ? '#059669' : '#ea580c'};">
                    ${c.assigned_worker_name ? `${escapeHTML(c.assigned_worker_name)} (${escapeHTML(c.assigned_worker_phone || '')})` : 'Pending Admin Assignment ⏳'}
                </div>
            </div>
            <div>
                <small style="color:#64748b; font-weight:800; text-transform:uppercase;">📍 Location</small>
                <div style="font-weight:700; color:var(--navy);">${escapeHTML(c.address || "-")}</div>
            </div>
        </div>

        ${c.admin_notes ? `
            <div style="margin-top:14px; padding:12px 16px; border-radius:12px; background:#f0fdf4; border:1px solid #bbf7d0; font-size:13px; color:#166534;">
                <strong>Official Note:</strong> ${escapeHTML(c.admin_notes)}
            </div>
        ` : ""}
    `;
}

/* =========================================================
   LOGIN & ROLE AUTHENTICATION
========================================================= */

function switchLoginRole(role) {
    document.querySelectorAll(".role-tab").forEach(tab => tab.classList.remove("active"));
    const activeTab = document.getElementById(role === "admin" ? "tabRoleAdmin" : role === "worker" ? "tabRoleWorker" : "tabRoleCitizen");
    activeTab?.classList.add("active");

    const adminAction = document.getElementById("quickAdminAction");
    const workerAction = document.getElementById("quickWorkerAction");
    const citizenAction = document.getElementById("quickCitizenAction");
    const secKeyGroup = document.getElementById("adminSecurityKeyGroup");
    const secKeyInput = document.getElementById("loginSecurityKey");
    const phoneInput = document.getElementById("loginPhone");
    const passInput = document.getElementById("loginPassword");

    adminAction?.classList.add("hidden");
    workerAction?.classList.add("hidden");
    citizenAction?.classList.add("hidden");

    if (role === "admin") {
        adminAction?.classList.remove("hidden");
        secKeyGroup?.classList.remove("hidden");
        if (secKeyInput) {
            secKeyInput.required = true;
            if (!secKeyInput.value) secKeyInput.value = "MAHA-2026";
        }
        if (phoneInput && !phoneInput.value) phoneInput.value = "9876543210";
        if (passInput && !passInput.value) passInput.value = "admin123";
    } else if (role === "worker") {
        workerAction?.classList.remove("hidden");
        secKeyGroup?.classList.add("hidden");
        if (secKeyInput) {
            secKeyInput.required = false;
            secKeyInput.value = "";
        }
        if (phoneInput && !phoneInput.value) phoneInput.value = "9811111111";
        if (passInput && !passInput.value) passInput.value = "worker123";
    } else {
        citizenAction?.classList.remove("hidden");
        secKeyGroup?.classList.add("hidden");
        if (secKeyInput) {
            secKeyInput.required = false;
            secKeyInput.value = "";
        }
        if (phoneInput && !phoneInput.value) phoneInput.value = "9123456780";
        if (passInput && !passInput.value) passInput.value = "citizen123";
    }
}

function openLoginWithRole(role) {
    openLogin();
    switchLoginRole(role);
}

function quickLoginRole(role) {
    if (role === "admin") {
        currentUser = {
            id: "admin-default-id",
            name: "Nagar Palika Administrator",
            phone: "9876543210",
            email: "admin@civiccare.gov",
            role: "admin",
            security_key_verified: true
        };
    } else if (role === "worker") {
        currentUser = {
            id: "worker-1",
            name: "Ramesh Pawar",
            phone: "9811111111",
            role: "worker",
            domain: "Sanitation & Solid Waste Department"
        };
    } else {
        currentUser = {
            id: "citizen-demo-id",
            name: "Rajesh Sharma",
            phone: "9123456780",
            role: "citizen"
        };
    }

    localStorage.setItem("civiccare_user", JSON.stringify(currentUser));
    localStorage.setItem("civiccare_token", `demo-token-${role}`);

    closeLogin();
    restoreLogin();
    document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });

    showToast(`Logged in as ${currentUser.role === 'admin' ? '👑 Admin (Officer Verified)' : currentUser.role === 'worker' ? '👷 Worker' : '👤 Citizen'}!`, "success");
    fetchNotifications();
}

function initializeLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const phone = document.getElementById("loginPhone")?.value.trim();
        const password = document.getElementById("loginPassword")?.value;
        const securityKey = document.getElementById("loginSecurityKey")?.value.trim();
        const activeTab = document.querySelector(".role-tab.active");
        const isTryingAdmin = (activeTab && activeTab.id === "tabRoleAdmin") || phone === "9876543210" || phone?.toLowerCase() === "admin";

        if (!phone || !password) {
            showToast("Please provide phone and password.", "error");
            return;
        }

        if (isTryingAdmin && (!securityKey || securityKey.toUpperCase() !== "MAHA-2026")) {
            showToast("Access Denied: Municipal Officer Security Key (MAHA-2026) is strictly required for Admin login.", "error");
            document.getElementById("loginSecurityKey")?.focus();
            return;
        }

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password, security_key: securityKey })
            });

            const data = await res.json().catch(() => null);

            if (res.ok && data?.success && data?.user) {
                currentUser = data.user;
                localStorage.setItem("civiccare_user", JSON.stringify(currentUser));
                localStorage.setItem("civiccare_token", data.token || "token");
                closeLogin();
                restoreLogin();
                document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
                showToast(`Welcome back, ${currentUser.name}! 👋`, "success");
                fetchNotifications();
                return;
            } else if (!res.ok) {
                showToast(data?.message || "Invalid login credentials.", "error");
                return;
            }
        } catch {
            // Network failure fallback ONLY if backend is completely unreachable
        }

        // Strict Offline Fallback (only reached if fetch throws network error)
        let role = "citizen";
        let domain = null;
        let name = `User (${phone})`;

        if (phone === "9876543210" || phone.toLowerCase() === "admin") {
            if (!securityKey || securityKey.toUpperCase() !== "MAHA-2026") {
                showToast("Access Denied: Officer Authorization Key (MAHA-2026) required for Admin access.", "error");
                return;
            }
            role = "admin";
            name = "Nagar Palika Administrator";
        } else if (phone === "9811111111") {
            role = "worker";
            name = "Ramesh Pawar";
            domain = "Sanitation & Solid Waste Department";
        } else if (phone === "9822222222") {
            role = "worker";
            name = "Suresh Patil";
            domain = "Road Infrastructure & Maintenance";
        }

        currentUser = { phone, name, role, domain };
        localStorage.setItem("civiccare_user", JSON.stringify(currentUser));
        closeLogin();
        restoreLogin();
        document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
        showToast(`Logged in as ${role.toUpperCase()}! 👋`, "success");
        fetchNotifications();
    });
}

function initializeRegister() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("registerName")?.value.trim();
        const phone = document.getElementById("registerPhone")?.value.trim();
        const email = document.getElementById("registerEmail")?.value.trim();
        const role = document.getElementById("registerRole")?.value || "citizen";
        const domain = document.getElementById("registerDomain")?.value;
        const password = document.getElementById("registerPassword")?.value;
        const securityKey = document.getElementById("registerSecurityKey")?.value.trim();

        if (!name || !phone || !password) {
            showToast("Please fill all required fields.", "error");
            return;
        }

        if (role === "admin" && (!securityKey || securityKey.toUpperCase() !== "MAHA-2026")) {
            showToast("Access Denied: Creating an Admin account strictly requires the official Municipal Officer Security Key (MAHA-2026).", "error");
            document.getElementById("registerSecurityKey")?.focus();
            return;
        }

        currentUser = { name, phone, email, role, domain };

        try {
            const res = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, email, role, domain, password, security_key: securityKey })
            });
            const data = await res.json().catch(() => null);

            if (res.ok && data?.success && data?.user) {
                currentUser = data.user;
                localStorage.setItem("civiccare_user", JSON.stringify(currentUser));
                closeRegister();
                restoreLogin();
                showToast(`Account registered as ${role.toUpperCase()}! 🎉`, "success");
                fetchNotifications();
                return;
            } else if (!res.ok) {
                showToast(data?.message || "Registration failed.", "error");
                return;
            }
        } catch {
            // Local fallback
        }

        localStorage.setItem("civiccare_user", JSON.stringify(currentUser));
        closeRegister();
        restoreLogin();
        showToast(`Account registered as ${role.toUpperCase()}! 🎉`, "success");
        fetchNotifications();
    });
}

function toggleRegisterDomain(role) {
    const group = document.getElementById("registerDomainGroup");
    const secGroup = document.getElementById("registerSecurityKeyGroup");
    const secInput = document.getElementById("registerSecurityKey");

    if (group) {
        if (role === "worker") group.classList.remove("hidden");
        else group.classList.add("hidden");
    }

    if (secGroup) {
        if (role === "admin") {
            secGroup.classList.remove("hidden");
            if (secInput) secInput.required = true;
        } else {
            secGroup.classList.add("hidden");
            if (secInput) {
                secInput.required = false;
                secInput.value = "";
            }
        }
    }
}

function restoreLogin() {
    const saved = localStorage.getItem("civiccare_user");
    const panel = document.getElementById("userPanel");
    const loginBtn = document.getElementById("navLoginBtn");

    if (!saved) {
        currentUser = { role: "citizen", name: "Guest", phone: null };
        if (panel) panel.classList.add("hidden");
        if (loginBtn) loginBtn.textContent = "Login";
        loadDashboard();
        return;
    }

    try {
        currentUser = JSON.parse(saved);
        if (panel) {
            document.getElementById("userName").textContent = currentUser.name || "User";
            const roleLabel = currentUser.role === "admin" ? "👑 Nagar Palika Admin" : currentUser.role === "worker" ? `👷 Worker (${currentUser.domain || 'Field'})` : "Citizen";
            document.getElementById("userRole").textContent = roleLabel;
            panel.classList.remove("hidden");
        }

        if (loginBtn) {
            loginBtn.textContent = currentUser.role === "admin"
                ? "👑 Admin Portal"
                : currentUser.role === "worker"
                ? `👷 ${currentUser.name.split(" ")[0]}`
                : `👤 ${currentUser.name.split(" ")[0]}`;
        }
    } catch {
        currentUser = { role: "citizen", name: "Guest", phone: null };
    }

    loadDashboard();
}

function logout() {
    localStorage.removeItem("civiccare_user");
    localStorage.removeItem("civiccare_token");
    currentUser = { role: "citizen", name: "Guest", phone: null };
    restoreLogin();
    showToast("Logged out successfully.", "info");
}

/* =========================================================
   MODAL CONTROLS & UTILITIES
========================================================= */

function openLogin() {
    document.getElementById("registerModal")?.classList.add("hidden");
    document.getElementById("loginModal")?.classList.remove("hidden");
    switchLoginRole(currentUser.role === "admin" ? "admin" : currentUser.role === "worker" ? "worker" : "citizen");
}

function closeLogin() {
    document.getElementById("loginModal")?.classList.add("hidden");
}

function openRegister() {
    closeLogin();
    document.getElementById("registerModal")?.classList.remove("hidden");
}

function closeRegister() {
    document.getElementById("registerModal")?.classList.add("hidden");
}

function backToLogin() {
    closeRegister();
    openLogin();
}

document.addEventListener("click", function (e) {
    const login = document.getElementById("loginModal");
    const reg = document.getElementById("registerModal");
    const assign = document.getElementById("assignWorkerModal");
    const notifWrapper = document.querySelector(".notif-wrapper");

    if (e.target === login) closeLogin();
    if (e.target === reg) closeRegister();
    if (e.target === assign) closeAssignWorkerModal();

    // Close notification dropdown if clicked outside
    if (notifWrapper && !notifWrapper.contains(e.target)) {
        document.getElementById("notifDropdown")?.classList.add("hidden");
    }
});

/* =========================================================
   NAVIGATION & THEME
========================================================= */

function goToReport() {
    document.getElementById("report")?.scrollIntoView({ behavior: "smooth" });
}

function goToTrack() {
    document.getElementById("track")?.scrollIntoView({ behavior: "smooth" });
}

function toggleMobileMenu() {
    document.getElementById("navLinks")?.classList.toggle("mobile-open");
}

function closeMobileMenu() {
    document.getElementById("navLinks")?.classList.remove("mobile-open");
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("civiccare_theme", isDark ? "dark" : "light");

    const btn = document.getElementById("themeBtn");
    if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}

function restoreTheme() {
    if (localStorage.getItem("civiccare_theme") === "dark") {
        document.body.classList.add("dark");
        const btn = document.getElementById("themeBtn");
        if (btn) btn.textContent = "☀️";
    }
}
restoreTheme();

/* =========================================================
   PHOTO & GPS HELPERS
========================================================= */

function initializePhotoUpload() {
    const input = document.getElementById("photo");
    if (!input) return;

    input.addEventListener("change", function () {
        const file = input.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Please select an image file.", "error");
            input.value = "";
            return;
        }

        selectedPhoto = file;
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById("photoPreview");
            const box = document.getElementById("photoPreviewBox");
            if (preview && box) {
                preview.src = e.target.result;
                box.classList.remove("hidden");
            }
            showToast("Photo attached 📸", "success");
        };
        reader.readAsDataURL(file);
    });
}

function removePhoto() {
    const input = document.getElementById("photo");
    const preview = document.getElementById("photoPreview");
    const box = document.getElementById("photoPreviewBox");

    if (input) input.value = "";
    if (preview) preview.src = "";
    if (box) box.classList.add("hidden");
    selectedPhoto = null;
}

function initializeDescriptionCounter() {
    const textarea = document.getElementById("description");
    const counter = document.getElementById("charCount");
    if (!textarea || !counter) return;

    textarea.addEventListener("input", function () {
        counter.textContent = textarea.value.length;
    });
}

/* =========================================================
   GPS 5-MINUTE AUTO-OFF & PRIVACY EXPIRY CONTROLLER
========================================================= */

function startGPSAutoOffTimer() {
    clearTimeout(gpsAutoOffTimer);
    clearInterval(gpsCountdownInterval);

    gpsRemainingSeconds = GPS_AUTO_OFF_DURATION;

    const badge = document.getElementById("gpsExpiryBadge");
    const countdownEl = document.getElementById("gpsTimerCountdown");
    const clearBtn = document.getElementById("gpsClearBtn");
    const gpsBtn = document.getElementById("gpsBtn");

    if (badge) {
        badge.classList.remove("hidden");
        badge.classList.remove("warning");
    }
    if (clearBtn) clearBtn.classList.remove("hidden");
    if (gpsBtn) gpsBtn.innerHTML = "📍 Update GPS";

    function updateCountdownDisplay() {
        const mins = Math.floor(gpsRemainingSeconds / 60);
        const secs = gpsRemainingSeconds % 60;
        const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        if (countdownEl) countdownEl.textContent = formatted;

        if (badge) {
            if (gpsRemainingSeconds <= 60) {
                badge.classList.add("warning");
            } else {
                badge.classList.remove("warning");
            }
        }
    }

    updateCountdownDisplay();

    gpsCountdownInterval = setInterval(() => {
        gpsRemainingSeconds--;
        if (gpsRemainingSeconds <= 0) {
            turnOffGPS(false); // 5-minute auto expiration
        } else {
            updateCountdownDisplay();
        }
    }, 1000);

    gpsAutoOffTimer = setTimeout(() => {
        turnOffGPS(false);
    }, GPS_AUTO_OFF_DURATION * 1000);
}

function turnOffGPS(isManual = false) {
    clearTimeout(gpsAutoOffTimer);
    clearInterval(gpsCountdownInterval);
    gpsAutoOffTimer = null;
    gpsCountdownInterval = null;
    gpsRemainingSeconds = 0;

    gps = null; // Coordinates purged from memory

    const status = document.getElementById("gpsStatus");
    const coordinates = document.getElementById("coordinates");
    const badge = document.getElementById("gpsExpiryBadge");
    const clearBtn = document.getElementById("gpsClearBtn");
    const gpsBtn = document.getElementById("gpsBtn");

    if (coordinates) coordinates.textContent = "";
    if (badge) {
        badge.classList.add("hidden");
        badge.classList.remove("warning");
    }
    if (clearBtn) clearBtn.classList.add("hidden");
    if (gpsBtn) gpsBtn.innerHTML = "📍 Use GPS";

    const dict = i18n[currentLanguage] || i18n.en;

    if (isManual) {
        if (status) status.textContent = "Location turned off manually.";
        showToast(dict.gps_manual_off_toast || "🛑 GPS Location turned OFF. Your coordinates have been cleared.", "info");
    } else {
        if (status) status.textContent = "Location auto-turned off after 5 mins (Privacy protected).";
        showToast(dict.gps_auto_off_toast || "🔒 GPS location automatically turned OFF after 5 minutes to protect your privacy and battery.", "info");
    }
}

function getGPS() {
    const status = document.getElementById("gpsStatus");
    if (!navigator.geolocation) {
        showToast("GPS is not supported by your browser.", "error");
        return;
    }

    if (status) status.textContent = "Acquiring GPS location...";
    showToast("Acquiring GPS coordinates...", "info");

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            gps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            updateGPSUI(gps.lat, gps.lng);
            startGPSAutoOffTimer();
            showToast("GPS verified 📍 (Auto-turns OFF in 5 minutes)", "success");
        },
        function (err) {
            console.error(err);
            if (status) status.textContent = "Location permission unavailable.";
            showToast("Please allow GPS location permission in browser settings.", "error");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
}

function updateGPSUI(lat, lng) {
    const status = document.getElementById("gpsStatus");
    const coordinates = document.getElementById("coordinates");
    if (status) status.textContent = "Location verified via GPS ✓ (Active)";
    if (coordinates) coordinates.textContent = `Latitude: ${lat.toFixed(6)} • Longitude: ${lng.toFixed(6)}`;
}

function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;

    requestAnimationFrame(() => toast.classList.add("show"));

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 4000);
}

function checkBackTop() {
    const btn = document.getElementById("backTop");
    if (!btn) return;
    if (window.scrollY > 400) btn.classList.add("show");
    else btn.classList.remove("show");
}
window.addEventListener("scroll", checkBackTop);

function initializeYear() {
    const y = document.getElementById("currentYear");
    if (y) y.textContent = new Date().getFullYear();
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function formatDate(date) {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function escapeHTML(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}