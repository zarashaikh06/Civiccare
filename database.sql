CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- MUNICIPALITIES (CITIES & NAGAR PALIKAS)
-- =========================================

CREATE TABLE IF NOT EXISTS municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- WARDS
-- =========================================

CREATE TABLE IF NOT EXISTS wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL
        REFERENCES municipalities(id)
        ON DELETE CASCADE,

    ward_number VARCHAR(30) NOT NULL,
    ward_name VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- DEPARTMENTS (DOMAINS)
-- =========================================

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    municipality_id UUID NOT NULL
        REFERENCES municipalities(id)
        ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- USERS (CITIZENS, OFFICERS, WORKERS, ADMINS)
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    phone VARCHAR(20) UNIQUE NOT NULL,

    email VARCHAR(150),

    password_hash TEXT NOT NULL,

    role VARCHAR(30) NOT NULL DEFAULT 'citizen'
        CHECK (
            role IN (
                'citizen',
                'officer',
                'worker',
                'admin'
            )
        ),

    municipality_id UUID
        REFERENCES municipalities(id),

    department_id UUID
        REFERENCES departments(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- WORKERS
-- =========================================

CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    employee_id VARCHAR(50) UNIQUE NOT NULL,

    domain VARCHAR(100) NOT NULL,

    is_available BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- COMPLAINTS
-- =========================================

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    complaint_number VARCHAR(30)
        UNIQUE NOT NULL,

    citizen_id UUID
        REFERENCES users(id),

    municipality_id UUID
        REFERENCES municipalities(id),

    ward_id UUID
        REFERENCES wards(id),

    department_id UUID
        REFERENCES departments(id),

    category VARCHAR(100) NOT NULL,

    description TEXT,

    latitude DECIMAL(10,7),

    longitude DECIMAL(10,7),

    address TEXT,

    ai_category VARCHAR(100),
    ai_domain VARCHAR(150),
    ai_confidence DECIMAL(5,2),

    admin_approved BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,

    assigned_worker_id UUID
        REFERENCES workers(id),
    assigned_worker_name VARCHAR(150),
    assigned_worker_phone VARCHAR(20),

    status VARCHAR(30) NOT NULL DEFAULT 'submitted'
        CHECK (
            status IN (
                'submitted',
                'verified',
                'assigned',
                'in_progress',
                'resolved',
                'rejected'
            )
        ),

    priority VARCHAR(20) DEFAULT 'normal'
        CHECK (
            priority IN (
                'low',
                'normal',
                'high',
                'urgent'
            )
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- NOTIFICATIONS
-- =========================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    target_role VARCHAR(30) NOT NULL, -- 'admin', 'worker', 'citizen'
    target_phone VARCHAR(20),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'new_complaint', 'task_assigned', 'task_progress', 'task_resolved'
    complaint_number VARCHAR(30),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- COMPLAINT PHOTOS
-- =========================================

CREATE TABLE IF NOT EXISTS complaint_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    complaint_id UUID NOT NULL
        REFERENCES complaints(id)
        ON DELETE CASCADE,

    photo_url TEXT NOT NULL,

    photo_type VARCHAR(30) DEFAULT 'complaint',

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- STATUS HISTORY
-- =========================================

CREATE TABLE IF NOT EXISTS complaint_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    complaint_id UUID NOT NULL
        REFERENCES complaints(id)
        ON DELETE CASCADE,

    old_status VARCHAR(30),

    new_status VARCHAR(30) NOT NULL,

    changed_by VARCHAR(150),

    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- SEED DATA: CITIES INCLUDING BARSHI, SOLAPUR, BEED
-- =========================================

INSERT INTO municipalities (name, city, state)
VALUES
    ('Barshi Nagar Parishad', 'Barshi', 'Maharashtra'),
    ('Solapur Municipal Corporation', 'Solapur', 'Maharashtra'),
    ('Beed Nagar Palika', 'Beed', 'Maharashtra'),
    ('Jalna Nagar Palika', 'Jalna', 'Maharashtra'),
    ('Brihanmumbai Municipal Corporation (BMC)', 'Mumbai', 'Maharashtra'),
    ('Pune Municipal Corporation (PMC)', 'Pune', 'Maharashtra'),
    ('Nagpur Municipal Corporation (NMC)', 'Nagpur', 'Maharashtra'),
    ('Chhatrapati Sambhajinagar Municipal Corporation', 'Chhatrapati Sambhajinagar', 'Maharashtra'),
    ('Municipal Corporation of Delhi (MCD)', 'Delhi', 'Delhi'),
    ('Bruhat Bengaluru Mahanagara Palike (BBMP)', 'Bengaluru', 'Karnataka')
ON CONFLICT DO NOTHING;

-- Seed default Admin User (Password: 'admin123')
INSERT INTO users (name, phone, email, password_hash, role)
VALUES (
    'Nagar Palika Administrator',
    '9876543210',
    'admin@civiccare.gov',
    '$2a$10$wE9l1lP0XvP60mFvY6Tj0uGkF97wF97wF97wF97wF97wF97wF97wO',
    'admin'
)
ON CONFLICT (phone) DO UPDATE
SET role = 'admin', name = 'Nagar Palika Administrator';

-- Seed default Workers across domains (Password: 'worker123')
INSERT INTO users (name, phone, email, password_hash, role)
VALUES
    ('Ramesh Pawar (Sanitation)', '9811111111', 'ramesh.sanitation@civiccare.gov', '$2a$10$wE9l1lP0XvP60mFvY6Tj0uGkF97wF97wF97wF97wF97wF97wF97wO', 'worker'),
    ('Suresh Patil (Road Infrastructure)', '9822222222', 'suresh.roads@civiccare.gov', '$2a$10$wE9l1lP0XvP60mFvY6Tj0uGkF97wF97wF97wF97wF97wF97wF97wO', 'worker'),
    ('Amit Sharma (Electrical)', '9833333333', 'amit.electrical@civiccare.gov', '$2a$10$wE9l1lP0XvP60mFvY6Tj0uGkF97wF97wF97wF97wF97wF97wF97wO', 'worker'),
    ('Vinod Jadhav (Water Works)', '9844444444', 'vinod.water@civiccare.gov', '$2a$10$wE9l1lP0XvP60mFvY6Tj0uGkF97wF97wF97wF97wF97wF97wF97wO', 'worker'),
    ('Ganesh Kale (Drainage & Sewage)', '9855555555', 'ganesh.drainage@civiccare.gov', '$2a$10$wE9l1lP0XvP60mFvY6Tj0uGkF97wF97wF97wF97wF97wF97wF97wO', 'worker')
ON CONFLICT (phone) DO UPDATE
SET role = 'worker';