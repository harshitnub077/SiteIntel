-- FieldAI Postgres Schema for Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan_tier TEXT DEFAULT 'Starter',
    seat_count INTEGER DEFAULT 1,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sites
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    type TEXT CHECK (type IN ('construction', 'utility', 'facility')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workers
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Maps to Supabase auth.users.id ideally
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'field', 'viewer')),
    device_token TEXT
);

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    vertical TEXT,
    sections JSONB,
    is_global BOOLEAN DEFAULT false
);

-- Inspections
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id),
    template_id UUID REFERENCES templates(id),
    status TEXT DEFAULT 'in_progress',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    ai_summary TEXT,
    pdf_url TEXT
);
CREATE INDEX idx_inspections_site_id ON inspections(site_id);

-- Defects
CREATE TABLE defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    photo_url TEXT,
    ai_label TEXT,
    severity TEXT CHECK (severity IN ('low', 'med', 'high', 'critical')),
    location_tag TEXT,
    voice_note_url TEXT,
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_defects_inspection_id ON defects(inspection_id);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID REFERENCES defects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES workers(id),
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_by_ai BOOLEAN DEFAULT false
);

-- Embeddings
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- e.g., 'defect'
    source_id UUID NOT NULL,
    content TEXT NOT NULL,
    vector vector(3072) -- Assuming text-embedding-3-large
);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
