-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create an org_id function for easy lookup using Supabase Auth UID
CREATE OR REPLACE FUNCTION auth.org_id() RETURNS uuid AS $$
  SELECT org_id FROM public.workers WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for Workers
CREATE POLICY "Workers can read their own org" ON workers
  FOR SELECT USING (org_id = auth.org_id());

-- Policies for Sites
CREATE POLICY "Users can read sites in their org" ON sites
  FOR SELECT USING (org_id = auth.org_id());
CREATE POLICY "Users can create sites in their org" ON sites
  FOR INSERT WITH CHECK (org_id = auth.org_id());

-- Policies for Inspections
CREATE POLICY "Users can read inspections in their org" ON inspections
  FOR SELECT USING (
    site_id IN (SELECT id FROM sites WHERE org_id = auth.org_id())
  );
CREATE POLICY "Users can create inspections in their org" ON inspections
  FOR INSERT WITH CHECK (
    site_id IN (SELECT id FROM sites WHERE org_id = auth.org_id())
  );

-- Policies for Defects
CREATE POLICY "Users can read defects in their org" ON defects
  FOR SELECT USING (
    inspection_id IN (
      SELECT id FROM inspections WHERE site_id IN (SELECT id FROM sites WHERE org_id = auth.org_id())
    )
  );

-- Policies for Storage (Bucket)
-- To be executed in Supabase Storage SQL:
-- insert into storage.buckets (id, name, public) values ('fieldai-assets', 'fieldai-assets', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'fieldai-assets' );
-- create policy "Authenticated Insert" on storage.objects for insert with check ( bucket_id = 'fieldai-assets' and auth.role() = 'authenticated' );
