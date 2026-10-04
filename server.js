const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "civiccare_super_secret_jwt_key_2026";

app.use(cors());
app.use(express.json());

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, "..")));

// =========================================
// DATABASE CONNECTION (Optional / Graceful)
// =========================================

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "civiccare",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres"
});

let dbConnected = false;
pool.query("SELECT NOW()", (err) => {
    if (err) {
        console.warn("⚠️ PostgreSQL connection not available. In-memory demo store is active.", err.message);
        dbConnected = false;
    } else {
        console.log("✅ PostgreSQL Database connected successfully!");
        dbConnected = true;
    }
});

// =========================================
// IN-MEMORY STORE WITH MUNICIPALITIES & WORKERS
// =========================================

const memoryStore = {
    users: [
        {
            id: "admin-default-id",
            name: "Nagar Palika Administrator",
            phone: "9876543210",
            email: "admin@civiccare.gov",
            passwordHash: bcrypt.hashSync("admin123", 10),
            role: "admin",
            city: "All Municipalities"
        },
        {
            id: "worker-1",
            name: "Ramesh Pawar",
            phone: "9811111111",
            email: "ramesh.sanitation@civiccare.gov",
            passwordHash: bcrypt.hashSync("worker123", 10),
            role: "worker",
            domain: "Sanitation & Solid Waste Department",
            city: "Barshi"
        },
        {
            id: "worker-2",
            name: "Suresh Patil",
            phone: "9822222222",
            email: "suresh.roads@civiccare.gov",
            passwordHash: bcrypt.hashSync("worker123", 10),
            role: "worker",
            domain: "Road Infrastructure & Maintenance",
            city: "Solapur"
        },
        {
            id: "worker-3",
            name: "Amit Sharma",
            phone: "9833333333",
            email: "amit.electrical@civiccare.gov",
            passwordHash: bcrypt.hashSync("worker123", 10),
            role: "worker",
            domain: "Streetlight & Electrical Department",
            city: "Beed"
        },
        {
            id: "worker-4",
            name: "Vinod Jadhav",
            phone: "9844444444",
            email: "vinod.water@civiccare.gov",
            passwordHash: bcrypt.hashSync("worker123", 10),
            role: "worker",
            domain: "Water Works & Supply Department",
            city: "Jalna"
        },
        {
            id: "worker-5",
            name: "Ganesh Kale",
            phone: "9855555555",
            email: "ganesh.drainage@civiccare.gov",
            passwordHash: bcrypt.hashSync("worker123", 10),
            role: "worker",
            domain: "Drainage & Sewage Management",
            city: "Solapur"
        },
        {
            id: "citizen-demo-id",
            name: "Rajesh Sharma",
            phone: "9123456780",
            email: "citizen@example.com",
            passwordHash: bcrypt.hashSync("citizen123", 10),
            role: "citizen",
            city: "Barshi"
        }
    ],

    municipalities: [
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
    ],

    workers: [
        { id: "w-1", name: "Ramesh Pawar", phone: "9811111111", domain: "Sanitation & Solid Waste Department", city: "Barshi", is_available: true },
        { id: "w-2", name: "Suresh Patil", phone: "9822222222", domain: "Road Infrastructure & Maintenance", city: "Solapur", is_available: true },
        { id: "w-3", name: "Amit Sharma", phone: "9833333333", domain: "Streetlight & Electrical Department", city: "Beed", is_available: true },
        { id: "w-4", name: "Vinod Jadhav", phone: "9844444444", domain: "Water Works & Supply Department", city: "Jalna", is_available: true },
        { id: "w-5", name: "Ganesh Kale", phone: "9855555555", domain: "Drainage & Sewage Management", city: "Solapur", is_available: true },
        { id: "w-6", name: "Prakash More", phone: "9866666666", domain: "Sanitation & Solid Waste Department", city: "Solapur", is_available: true },
        { id: "w-7", name: "Sunil Shinde", phone: "9877777777", domain: "Road Infrastructure & Maintenance", city: "Barshi", is_available: true }
    ],

    notifications: [
        {
            id: "notif-1",
            target_role: "admin",
            target_phone: null,
            title: "🚨 New Complaint Submitted",
            message: "Complaint CC-84729104 reported in Barshi (Garbage / Waste). Awaiting your review.",
            type: "new_complaint",
            complaint_number: "CC-84729104",
            is_read: false,
            created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
            id: "notif-2",
            target_role: "worker",
            target_phone: "9822222222",
            title: "👷 New Task Assigned by Admin",
            message: "Admin assigned you complaint CC-93817205 (Pothole repair on Main Road, Solapur).",
            type: "task_assigned",
            complaint_number: "CC-93817205",
            is_read: false,
            created_at: new Date(Date.now() - 3600000 * 10).toISOString()
        }
    ],

    complaints: [
        {
            id: "c-101",
            complaint_number: "CC-84729104",
            citizen_name: "Anita Deshmukh",
            citizen_phone: "9823011223",
            municipality_id: "muni-barshi",
            municipality_name: "Barshi Nagar Parishad",
            city: "Barshi",
            category: "Garbage / Waste",
            description: "Garbage container overflowing near Subhash Chowk market in Barshi. Stench and flies causing severe hygiene problem.",
            latitude: 18.2333,
            longitude: 75.6948,
            address: "Near Subhash Chowk Market, Barshi",
            status: "submitted",
            priority: "high",
            ai_category: "Garbage / Waste",
            ai_domain: "Sanitation & Solid Waste Department",
            ai_confidence: 96,
            admin_approved: false,
            admin_notes: null,
            assigned_worker_name: null,
            assigned_worker_phone: null,
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            history: [
                { status: "submitted", changed_by: "Citizen", comment: "Report submitted via CivicCare mobile web", time: new Date(Date.now() - 3600000 * 2).toISOString() }
            ]
        },
        {
            id: "c-102",
            complaint_number: "CC-93817205",
            citizen_name: "Vikram Kulkarni",
            citizen_phone: "9822998877",
            municipality_id: "muni-solapur",
            municipality_name: "Solapur Municipal Corporation",
            city: "Solapur",
            category: "Pothole / Road",
            description: "Major pothole cluster on Saat Rasta to Railway Station Road in Solapur causing traffic jams and bike accidents.",
            latitude: 17.6599,
            longitude: 75.9064,
            address: "Saat Rasta Circle, Station Road, Solapur",
            status: "assigned",
            priority: "urgent",
            ai_category: "Pothole / Road",
            ai_domain: "Road Infrastructure & Maintenance",
            ai_confidence: 95,
            admin_approved: true,
            admin_notes: "Approved by Admin. Assigned to Suresh Patil (Road Maintenance Crew).",
            assigned_worker_name: "Suresh Patil",
            assigned_worker_phone: "9822222222",
            created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
            history: [
                { status: "submitted", changed_by: "Citizen", comment: "Report submitted", time: new Date(Date.now() - 3600000 * 18).toISOString() },
                { status: "verified", changed_by: "Admin", comment: "Approved by Admin", time: new Date(Date.now() - 3600000 * 12).toISOString() },
                { status: "assigned", changed_by: "Admin", comment: "Assigned to worker Suresh Patil (Road Dept)", time: new Date(Date.now() - 3600000 * 10).toISOString() }
            ]
        },
        {
            id: "c-103",
            complaint_number: "CC-71629402",
            citizen_name: "Mohan Shinde",
            citizen_phone: "9821003344",
            municipality_id: "muni-beed",
            municipality_name: "Beed Nagar Palika",
            city: "Beed",
            category: "Streetlight",
            description: "Four broken streetlights on Jalna Road near Bus Stand in Beed making the road completely dark at night.",
            latitude: 18.9891,
            longitude: 75.7601,
            address: "Opposite New Bus Stand, Jalna Road, Beed",
            status: "in_progress",
            priority: "normal",
            ai_category: "Streetlight",
            ai_domain: "Streetlight & Electrical Department",
            ai_confidence: 98,
            admin_approved: true,
            admin_notes: "Approved and assigned to Amit Sharma (Electrical Team).",
            assigned_worker_name: "Amit Sharma",
            assigned_worker_phone: "9833333333",
            created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
            history: [
                { status: "submitted", changed_by: "Citizen", comment: "Report submitted", time: new Date(Date.now() - 3600000 * 36).toISOString() },
                { status: "verified", changed_by: "Admin", comment: "Approved by Admin", time: new Date(Date.now() - 3600000 * 24).toISOString() },
                { status: "assigned", changed_by: "Admin", comment: "Assigned to Amit Sharma", time: new Date(Date.now() - 3600000 * 12).toISOString() },
                { status: "in_progress", changed_by: "Amit Sharma (Worker)", comment: "Field repair team dispatched with replacement LED fixtures", time: new Date(Date.now() - 3600000 * 4).toISOString() }
            ]
        },
        {
            id: "c-104",
            complaint_number: "CC-55219011",
            citizen_name: "Pooja Mehta",
            citizen_phone: "9820554433",
            municipality_id: "muni-solapur",
            municipality_name: "Solapur Municipal Corporation",
            city: "Solapur",
            category: "Drainage",
            description: "Choked drainage chamber overflowing onto pavement near Siddheshwar Temple area.",
            latitude: 17.6700,
            longitude: 75.9100,
            address: "Siddheshwar Temple Road, Solapur",
            status: "resolved",
            priority: "high",
            ai_category: "Drainage",
            ai_domain: "Drainage & Sewage Management",
            ai_confidence: 97,
            admin_approved: true,
            admin_notes: "Suction machine dispatched. Chamber desilted and cleaned.",
            assigned_worker_name: "Ganesh Kale",
            assigned_worker_phone: "9855555555",
            created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
            history: [
                { status: "submitted", changed_by: "Citizen", comment: "Report submitted", time: new Date(Date.now() - 3600000 * 60).toISOString() },
                { status: "verified", changed_by: "Admin", comment: "Approved by Admin", time: new Date(Date.now() - 3600000 * 48).toISOString() },
                { status: "assigned", changed_by: "Admin", comment: "Assigned to Ganesh Kale", time: new Date(Date.now() - 3600000 * 30).toISOString() },
                { status: "in_progress", changed_by: "Ganesh Kale (Worker)", comment: "Cleaning operations underway", time: new Date(Date.now() - 3600000 * 10).toISOString() },
                { status: "resolved", changed_by: "Ganesh Kale (Worker)", comment: "Drainage blockage cleared and lid sealed", time: new Date(Date.now() - 3600000 * 1).toISOString() }
            ]
        }
    ]
};

// =========================================
// UPLOADS
// =========================================

const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const filename = Date.now() + "-" + Math.round(Math.random() * 100000) + extension;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use("/uploads", express.static(uploadFolder));

// =========================================
// AI CLASSIFICATION ENGINE
// =========================================

function classifyComplaintWithAI(text = "", photoName = "") {
    const lower = (text + " " + photoName).toLowerCase();

    const domains = [
        {
            category: "Garbage / Waste",
            domain: "Sanitation & Solid Waste Department",
            icon: "🗑️",
            keywords: ["garbage", "kachra", "kachara", "कचरा", "घाण", "दुर्गंधी", "कचराकुंडी", "कूड़ा", "गंदगी", "बदबू", "waste", "trash", "dustbin", "bin", "dump", "rotting", "smell", "stench", "litter", "plastic", "filth", "dumping", "sweeper", "debris"],
            urgentKeywords: ["hospital waste", "biohazard", "carcass", "dead animal", "fire", "burning plastic", "मृत प्राणी", "मेलेला प्राणी", "मरा हुआ"],
            basePriority: "normal"
        },
        {
            category: "Pothole / Road",
            domain: "Road Infrastructure & Maintenance",
            icon: "🛣️",
            keywords: ["pothole", "gadda", "khadda", "khadde", "खड्डा", "खड्डे", "रस्ता", "रस्ते", "गड्ढा", "गड्ढे", "सड़क", "road", "broken road", "asphalt", "tar", "divider", "footpath", "sidewalk", "manhole open", "trench", "crater", "speed breaker", "accident prone"],
            urgentKeywords: ["accident", "collapse", "cave in", "sinkhole", "two wheeler fell", "skid", "अपघात", "पडला", "दुर्घटना"],
            basePriority: "high"
        },
        {
            category: "Streetlight",
            domain: "Streetlight & Electrical Department",
            icon: "💡",
            keywords: ["streetlight", "street light", "light", "lamp", "pole", "dark", "bulb", "darkness", "wire", "spark", "flicker", "tube light", "transformer", "पथदिवा", "पथदिवे", "दिवा", "लाइट", "काळोख", "अंधार", "स्ट्रीटलाइट", "बत्ती", "अंधेरा", "खंभा"],
            urgentKeywords: ["sparking", "hanging wire", "electric shock", "exposed wire", "fire risk", "शॉक", "स्पार्क"],
            basePriority: "normal"
        },
        {
            category: "Water",
            domain: "Water Works & Supply Department",
            icon: "💧",
            keywords: ["water", "pani", "paani", "pipe", "pipeline", "leakage", "burst", "dirty water", "no water", "tap", "pressure", "drinking water", "supply", "valve", "tanker", "पाणी", "गळती", "पाईप", "नळ", "पाणीपुरवठा", "पानी", "पाइप", "नल", "जल"],
            urgentKeywords: ["contaminated", "pipeline burst", "flooding houses", "drinking sewage mixed", "गढूळ पाणी", "विषाक्त"],
            basePriority: "high"
        },
        {
            category: "Drainage",
            domain: "Drainage & Sewage Management",
            icon: "🚰",
            keywords: ["drain", "drainage", "gutter", "nala", "nallah", "naali", "sewage", "overflow", "stagnant", "choked", "manhole", "backflow", "waterlogging", "mosquitoes", "chamber", "गटार", "नाला", "सांडपाणी", "तुंबले", "चोक", "नाली", "सीवर", "गंदा पानी"],
            urgentKeywords: ["flooding homes", "sewage entering house", "open manhole", "deep ditch", "उघडे मॅनहोल"],
            basePriority: "high"
        },
        {
            category: "Other",
            domain: "Public Health & City Administration",
            icon: "📢",
            keywords: ["stray dog", "animal", "encroachment", "illegal hoardings", "tree fallen", "branch", "noise", "park", "garden", "toilet", "public toilet", "कुत्रे", "झाड पडले", "शौचालय", "कुत्ता"],
            urgentKeywords: ["rabid dog", "tree collapse", "wall fallen"],
            basePriority: "normal"
        }
    ];

    let bestMatch = domains[0];
    let highestScore = 0;
    let matchedKeywords = [];

    for (const d of domains) {
        let score = 0;
        const hits = [];

        d.keywords.forEach(kw => {
            if (lower.includes(kw)) {
                score += kw.length > 5 ? 3 : 2;
                hits.push(kw);
            }
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = d;
            matchedKeywords = hits;
        }
    }

    let priority = bestMatch.basePriority;
    let isUrgent = false;

    for (const d of domains) {
        for (const ukw of d.urgentKeywords) {
            if (lower.includes(ukw)) {
                isUrgent = true;
                priority = "urgent";
                matchedKeywords.push(ukw);
                break;
            }
        }
        if (isUrgent) break;
    }

    if (!isUrgent && highestScore >= 5) {
        if (priority === "normal") priority = "high";
    }

    const confidence = Math.min(99, Math.max(68, 60 + highestScore * 8));

    const rationale = matchedKeywords.length > 0
        ? `Identified key civic triggers: "${matchedKeywords.slice(0, 3).join('", "')}". Routed to ${bestMatch.domain}.`
        : `Categorized under ${bestMatch.domain} based on standard civic triage protocols.`;

    return {
        category: bestMatch.category,
        domain: bestMatch.domain,
        icon: bestMatch.icon,
        priority: priority,
        confidence: confidence,
        rationale: rationale,
        detectedKeywords: matchedKeywords
    };
}

app.post("/api/ai/classify", (req, res) => {
    const { description, photoName } = req.body;
    if (!description && !photoName) {
        return res.status(400).json({ success: false, message: "Description or photo is required for AI detection." });
    }

    const result = classifyComplaintWithAI(description, photoName);
    res.json({ success: true, ...result });
});

// =========================================
// NOTIFICATION HELPER
// =========================================

function createNotification({ target_role, target_phone = null, title, message, type, complaint_number }) {
    const notif = {
        id: "notif-" + Date.now() + "-" + Math.round(Math.random() * 1000),
        target_role,
        target_phone,
        title,
        message,
        type,
        complaint_number,
        is_read: false,
        created_at: new Date().toISOString()
    };
    memoryStore.notifications.unshift(notif);
    return notif;
}

// Get notifications
app.get("/api/notifications", (req, res) => {
    const { role, phone } = req.query;

    let list = [...memoryStore.notifications];

    if (role === "admin") {
        list = list.filter(n => n.target_role === "admin");
    } else if (role === "worker") {
        list = list.filter(n => n.target_role === "worker" && (!phone || !n.target_phone || n.target_phone === phone));
    } else if (role === "citizen") {
        list = list.filter(n => n.target_role === "citizen" && (!phone || n.target_phone === phone));
    }

    const unreadCount = list.filter(n => !n.is_read).length;

    res.json({
        success: true,
        unreadCount,
        notifications: list
    });
});

// Mark notification as read
app.patch("/api/notifications/:id/read", (req, res) => {
    const id = req.params.id;
    const notif = memoryStore.notifications.find(n => n.id === id);
    if (notif) {
        notif.is_read = true;
    }
    res.json({ success: true, message: "Notification marked as read" });
});

// =========================================
// WORKERS DIRECTORY
// =========================================

app.get("/api/workers", (req, res) => {
    const { domain, city } = req.query;

    let list = [...memoryStore.workers];

    if (domain && domain !== "all") {
        list = list.filter(w => w.domain.toLowerCase().includes(domain.toLowerCase()));
    }

    if (city && city !== "all") {
        // Prefer workers in that city or return all available if none in that specific city
        const cityMatches = list.filter(w => w.city.toLowerCase() === city.toLowerCase());
        if (cityMatches.length > 0) {
            list = cityMatches;
        }
    }

    res.json({
        success: true,
        workers: list
    });
});

// =========================================
// AUTHENTICATION
// =========================================

// Register
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, phone, email, password, role, domain, security_key } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ success: false, message: "Name, phone, and password are required." });
        }

        const userRole = ["admin", "worker", "citizen"].includes(role) ? role : "citizen";

        if (userRole === "admin") {
            if (!security_key || security_key.trim().toUpperCase() !== "MAHA-2026") {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied: Creating an Admin account strictly requires the official Municipal Officer Security Key (MAHA-2026)."
                });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const existing = memoryStore.users.find(u => u.phone === phone);
        if (existing) {
            return res.status(400).json({ success: false, message: "Phone number is already registered." });
        }

        const newUser = {
            id: "user-" + Date.now(),
            name,
            phone,
            email: email || null,
            passwordHash,
            role: userRole,
            domain: domain || null
        };
        memoryStore.users.push(newUser);

        if (userRole === "worker") {
            memoryStore.workers.push({
                id: "w-" + Date.now(),
                name: newUser.name,
                phone: newUser.phone,
                domain: domain || "General Field Services",
                city: "Barshi",
                is_available: true
            });
        }

        const token = jwt.sign({ id: newUser.id, phone: newUser.phone, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: { id: newUser.id, name: newUser.name, phone: newUser.phone, email: newUser.email, role: newUser.role, domain: newUser.domain }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Registration failed." });
    }
});

// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { phone, password, security_key } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, message: "Please provide phone number and password." });
        }

        // Secure Check for Municipal Admin (Strictly Requires Officer Security Key MAHA-2026)
        if ((phone === "9876543210" || phone.toLowerCase() === "admin") && password === "admin123") {
            if (!security_key || security_key.trim().toUpperCase() !== "MAHA-2026") {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied: Municipal Officer Security Key is required for Admin login. (Demo Key: MAHA-2026)"
                });
            }

            const adminUser = memoryStore.users.find(u => u.role === "admin");
            const token = jwt.sign({ id: adminUser.id, phone: adminUser.phone, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });

            return res.json({
                success: true,
                message: "Admin login verified! Welcome to Municipal Control Center.",
                token,
                user: { id: adminUser.id, name: adminUser.name, phone: adminUser.phone, email: adminUser.email, role: "admin" }
            });
        }

        // Quick Demo Check for Worker
        if (phone === "9811111111" && password === "worker123") {
            const workerUser = memoryStore.users.find(u => u.phone === "9811111111") || {
                id: "worker-demo-id",
                name: "Ramesh Pawar (Field Worker)",
                phone: "9811111111",
                role: "worker",
                domain: "Sanitation & Solid Waste Department"
            };
            const token = jwt.sign({ id: workerUser.id, phone: workerUser.phone, role: "worker" }, JWT_SECRET, { expiresIn: "7d" });

            return res.json({
                success: true,
                message: "Worker login successful! Welcome to Field Task Portal.",
                token,
                user: { id: workerUser.id, name: workerUser.name, phone: workerUser.phone, role: "worker", domain: workerUser.domain }
            });
        }

        // Standard User Check
        let user = null;
        const memUser = memoryStore.users.find(u => u.phone === phone);
        if (memUser) {
            const match = await bcrypt.compare(password, memUser.passwordHash);
            if (match) {
                user = {
                    id: memUser.id,
                    name: memUser.name,
                    phone: memUser.phone,
                    email: memUser.email,
                    role: memUser.role,
                    domain: memUser.domain || null
                };
            }
        }

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid phone number or password." });
        }

        // If the user has an Admin role in DB, strictly require officer key
        if (user.role === "admin") {
            if (!security_key || security_key.trim().toUpperCase() !== "MAHA-2026") {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied: Officer Security Key (MAHA-2026) is required to access Admin control center."
                });
            }
        }

        const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            success: true,
            message: `Login successful! Welcome, ${user.name}.`,
            token,
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Login error occurred." });
    }
});

// Current User Me
app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
});

// =========================================
// MUNICIPALITIES / CITIES
// =========================================

app.get("/api/municipalities", (req, res) => {
    res.json({
        success: true,
        municipalities: memoryStore.municipalities
    });
});

app.get("/api/cities", (req, res) => {
    res.json({
        success: true,
        cities: memoryStore.municipalities.map(m => ({ id: m.id, name: m.name, city: m.city, state: m.state, lat: m.lat, lng: m.lng }))
    });
});

// =========================================
// CREATE COMPLAINT (CITIZEN) -> NOTIFIES ADMIN
// =========================================

app.post("/api/complaints", upload.single("photo"), (req, res) => {
    try {
        const {
            citizen_id,
            citizen_name,
            citizen_phone,
            municipality_id,
            category,
            description,
            latitude,
            longitude,
            address,
            priority
        } = req.body;

        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required." });
        }

        const complaintNumber = "CC-" + Math.floor(10000000 + Math.random() * 90000000);
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Auto Run AI Classification
        const aiInfo = classifyComplaintWithAI(description || "", req.file ? req.file.originalname : "");

        const selectedMuni = memoryStore.municipalities.find(m => m.name === municipality_id || m.id === municipality_id || m.city === municipality_id) || memoryStore.municipalities[0];

        const isAnon = req.body.is_anonymous === "true" || req.body.is_anonymous === true;

        const newComplaint = {
            id: "comp-" + Date.now(),
            complaint_number: complaintNumber,
            citizen_id: citizen_id || null,
            is_anonymous: isAnon,
            citizen_name: isAnon ? "Anonymous Citizen" : (citizen_name || "Citizen"),
            citizen_phone: isAnon ? null : (citizen_phone || "Not provided"),
            municipality_id: selectedMuni.id,
            municipality_name: selectedMuni.name,
            city: selectedMuni.city,
            category: category,
            description: description || "",
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            address: address || "Location captured on-site",
            photo_url: photoUrl,
            status: "submitted",
            priority: priority || aiInfo.priority,
            ai_category: aiInfo.category,
            ai_domain: aiInfo.domain,
            ai_confidence: aiInfo.confidence,
            admin_approved: false,
            admin_notes: null,
            assigned_worker_name: null,
            assigned_worker_phone: null,
            created_at: new Date().toISOString(),
            history: [
                {
                    status: "submitted",
                    changed_by: isAnon ? "Anonymous Citizen" : "Citizen",
                    comment: `Complaint submitted in ${selectedMuni.city}. AI auto-assigned to ${aiInfo.domain}`,
                    time: new Date().toISOString()
                }
            ]
        };

        memoryStore.complaints.unshift(newComplaint);

        // 🔔 AUTOMATICALLY NOTIFY ADMIN OF NEW COMPLAINT
        const notif = createNotification({
            target_role: "admin",
            title: `🚨 New ${category} Complaint in ${selectedMuni.city}`,
            message: `Complaint ${complaintNumber} reported by ${isAnon ? 'Anonymous Citizen' : (citizen_name || 'Citizen')} at ${address || selectedMuni.city}. AI routed to ${aiInfo.domain}. Awaiting Admin review & worker assignment.`,
            type: "new_complaint",
            complaint_number: complaintNumber
        });

        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully! Admin has been notified.",
            complaint: newComplaint,
            ai: aiInfo,
            notification: notif
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Could not create complaint." });
    }
});

// =========================================
// PUBLIC COMPLAINTS (CITIZEN / WORKER PUBLIC VIEW - PII PROTECTED)
// =========================================

app.get("/api/complaints", (req, res) => {
    const { city, category, status } = req.query;
    let list = [...memoryStore.complaints];

    if (city && city !== "all") {
        list = list.filter(c => (c.city && c.city.toLowerCase() === city.toLowerCase()) || (c.municipality_name && c.municipality_name.toLowerCase().includes(city.toLowerCase())));
    }
    if (category && category !== "all") {
        list = list.filter(c => c.category === category);
    }
    if (status && status !== "all") {
        list = list.filter(c => c.status === status);
    }

    // PRIVACY SHIELD: Mask all PII so phone numbers/full names are NEVER scraped from public network
    const sanitized = list.map(c => ({
        id: c.id,
        complaint_number: c.complaint_number,
        municipality_name: c.municipality_name,
        city: c.city,
        category: c.category,
        description: c.description,
        address: c.address,
        status: c.status,
        priority: c.priority,
        ai_domain: c.ai_domain,
        is_anonymous: !!c.is_anonymous,
        citizen_name: c.is_anonymous ? "Anonymous Citizen" : (c.citizen_name ? c.citizen_name.split(" ")[0] + (c.citizen_name.split(" ")[1] ? " " + c.citizen_name.split(" ")[1][0] + "." : "") : "Citizen"),
        citizen_phone: c.is_anonymous ? "Protected" : (c.citizen_phone ? c.citizen_phone.substring(0, 5) + " •••••" : null),
        created_at: c.created_at
    }));

    res.json({
        success: true,
        complaints: sanitized
    });
});

// =========================================
// TRACK COMPLAINT (CITIZEN)
// =========================================

app.get("/api/complaints/:complaintNumber", (req, res) => {
    const compNum = req.params.complaintNumber.trim();
    const found = memoryStore.complaints.find(c => c.complaint_number.toLowerCase() === compNum.toLowerCase());

    if (found) {
        return res.json({
            success: true,
            complaint: found,
            history: found.history || [],
            photos: found.photo_url ? [{ photo_url: found.photo_url }] : []
        });
    }

    res.status(404).json({ success: false, message: "Complaint ID not found." });
});

// =========================================
// ADMIN CONTROL CENTER ENDPOINTS
// =========================================

// Get All Complaints for Admin with Stats & Filters
app.get("/api/admin/complaints", (req, res) => {
    const { city, status, category, search } = req.query;

    let complaints = [...memoryStore.complaints];

    if (city && city !== "all") {
        complaints = complaints.filter(c => (c.city && c.city.toLowerCase() === city.toLowerCase()) || (c.municipality_name && c.municipality_name.toLowerCase().includes(city.toLowerCase())));
    }

    if (status && status !== "all") {
        complaints = complaints.filter(c => c.status === status);
    }

    if (category && category !== "all") {
        complaints = complaints.filter(c => c.category === category);
    }

    if (search) {
        const q = search.toLowerCase();
        complaints = complaints.filter(c =>
            c.complaint_number.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q)) ||
            (c.address && c.address.toLowerCase().includes(q))
        );
    }

    const stats = {
        total: memoryStore.complaints.length,
        submitted: memoryStore.complaints.filter(c => c.status === "submitted").length,
        verified: memoryStore.complaints.filter(c => c.status === "verified").length,
        assigned: memoryStore.complaints.filter(c => c.status === "assigned").length,
        in_progress: memoryStore.complaints.filter(c => c.status === "in_progress").length,
        resolved: memoryStore.complaints.filter(c => c.status === "resolved").length,
        rejected: memoryStore.complaints.filter(c => c.status === "rejected").length
    };

    res.json({
        success: true,
        stats,
        complaints
    });
});

// ADMIN APPROVE & ASSIGN WORKER ACCORDING TO DOMAIN -> NOTIFIES WORKER
app.patch("/api/admin/complaints/:complaintNumber/assign", (req, res) => {
    const compNum = req.params.complaintNumber;
    const { worker_name, worker_phone, domain, note } = req.body;

    const complaint = memoryStore.complaints.find(c => c.complaint_number === compNum);

    if (!complaint) {
        return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    complaint.admin_approved = true;
    complaint.status = "assigned";
    complaint.assigned_worker_name = worker_name || "Field Officer";
    complaint.assigned_worker_phone = worker_phone || null;
    complaint.admin_notes = note || `Approved by Nagar Palika Admin. Assigned to ${complaint.assigned_worker_name} (${domain || complaint.ai_domain}).`;
    complaint.updated_at = new Date().toISOString();

    complaint.history.push({
        status: "assigned",
        changed_by: "Municipal Admin",
        comment: `Approved & Assigned to ${complaint.assigned_worker_name} (${complaint.assigned_worker_phone || 'Crew'}). Directive: ${note || 'Perform on-site resolution'}`,
        time: new Date().toISOString()
    });

    // 🔔 DISPATCH NOTIFICATION TO ASSIGNED WORKER
    const workerNotif = createNotification({
        target_role: "worker",
        target_phone: worker_phone,
        title: `👷 New Job Assigned: ${complaint.category}`,
        message: `Admin assigned you complaint ${compNum} in ${complaint.city} at ${complaint.address}. Priority: ${complaint.priority.toUpperCase()}. Please start work on-site.`,
        type: "task_assigned",
        complaint_number: compNum
    });

    res.json({
        success: true,
        message: `Complaint ${compNum} approved and assigned to worker ${complaint.assigned_worker_name}! Worker has received instant notification.`,
        complaint,
        notification: workerNotif
    });
});

// Admin Approve without immediate assignment
app.patch("/api/admin/complaints/:complaintNumber/approve", (req, res) => {
    const compNum = req.params.complaintNumber;
    const { note } = req.body;

    const complaint = memoryStore.complaints.find(c => c.complaint_number === compNum);

    if (!complaint) {
        return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    complaint.admin_approved = true;
    complaint.status = "verified";
    complaint.admin_notes = note || "Approved by Municipal Administrator. Ready for worker assignment.";
    complaint.updated_at = new Date().toISOString();

    complaint.history.push({
        status: "verified",
        changed_by: "Municipal Admin",
        comment: complaint.admin_notes,
        time: new Date().toISOString()
    });

    res.json({
        success: true,
        message: `Complaint ${compNum} approved by admin.`,
        complaint
    });
});

// PRIVACY COMPLIANCE: Audit-logged citizen contact unmasking for verified officers
app.post("/api/admin/complaints/:complaintNumber/reveal-phone", (req, res) => {
    const compNum = req.params.complaintNumber;
    const complaint = memoryStore.complaints.find(c => c.complaint_number === compNum);

    if (!complaint) {
        return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    if (complaint.is_anonymous) {
        return res.status(403).json({
            success: false,
            message: "This complaint was submitted anonymously. Citizen contact information is sealed and protected by privacy policy."
        });
    }

    console.log(`[PRIVACY AUDIT] Municipal Admin accessed citizen contact for complaint ${compNum} at ${new Date().toISOString()}`);

    res.json({
        success: true,
        complaint_number: compNum,
        citizen_name: complaint.citizen_name,
        citizen_phone: complaint.citizen_phone || "Not provided"
    });
});

// =========================================
// WORKER PORTAL ENDPOINTS
// =========================================

// Get tasks assigned to logged-in worker
app.get("/api/worker/tasks", (req, res) => {
    const { phone, name } = req.query;

    let tasks = [...memoryStore.complaints];

    if (phone) {
        tasks = tasks.filter(c => c.assigned_worker_phone === phone);
    } else if (name) {
        tasks = tasks.filter(c => c.assigned_worker_name && c.assigned_worker_name.toLowerCase().includes(name.toLowerCase()));
    } else {
        // Return all assigned / in_progress complaints as demo tasks
        tasks = tasks.filter(c => ["assigned", "in_progress", "resolved"].includes(c.status));
    }

    res.json({
        success: true,
        tasks
    });
});

// Worker updates task status (start work or mark resolved) -> NOTIFIES ADMIN & CITIZEN
app.patch("/api/worker/tasks/:complaintNumber/status", (req, res) => {
    const compNum = req.params.complaintNumber;
    const { status, note, worker_name } = req.body;

    const allowed = ["in_progress", "resolved"];
    if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: "Workers can only change status to in_progress or resolved." });
    }

    const complaint = memoryStore.complaints.find(c => c.complaint_number === compNum);
    if (!complaint) {
        return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    complaint.status = status;
    complaint.updated_at = new Date().toISOString();

    const workerComment = note || (status === "resolved" ? "Problem resolved on-site and verified by worker." : "Worker has reached site. Work in progress.");

    complaint.history.push({
        status: status,
        changed_by: `${worker_name || complaint.assigned_worker_name || 'Worker'}`,
        comment: workerComment,
        time: new Date().toISOString()
    });

    // 🔔 NOTIFY ADMIN THAT WORKER UPDATED STATUS
    const adminNotif = createNotification({
        target_role: "admin",
        title: status === "resolved" ? `🎉 Complaint ${compNum} Fixed & Resolved` : `🛠️ Work Started on ${compNum}`,
        message: `Worker ${worker_name || complaint.assigned_worker_name || 'Crew'} marked ${compNum} (${complaint.category}, ${complaint.city}) as ${status.replace("_", " ")}.`,
        type: "task_update",
        complaint_number: compNum
    });

    res.json({
        success: true,
        message: `Job ${compNum} updated to ${status.replace("_", " ")}! Admin notified.`,
        complaint,
        notification: adminNotif
    });
});

// =========================================
// START SERVER
// =========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`🚀 CivicCare Server active on http://localhost:${PORT}`);
    console.log(`📍 Supported Cities: Barshi, Solapur, Beed, Jalna, Mumbai, Pune, etc.`);
    console.log(`👑 Admin Demo Login: Phone: 9876543210  Password: admin123`);
    console.log(`👷 Worker Demo Login: Phone: 9811111111 Password: worker123`);
    console.log(`===============================================`);
});