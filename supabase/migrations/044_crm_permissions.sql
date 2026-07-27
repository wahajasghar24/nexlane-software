-- UP
-- Phase 2 CRM Permissions
INSERT INTO permissions (code, name, module) VALUES
  -- Leads
  ('leads.list', 'List Leads', 'crm'),
  ('leads.read', 'View Lead', 'crm'),
  ('leads.create', 'Create Lead', 'crm'),
  ('leads.update', 'Update Lead', 'crm'),
  ('leads.delete', 'Delete Lead', 'crm'),
  ('leads.assign', 'Assign Leads', 'crm'),
  ('leads.convert', 'Convert Lead to Deal', 'crm'),
  -- CRM Companies
  ('crm_companies.list', 'List CRM Companies', 'crm'),
  ('crm_companies.read', 'View CRM Company', 'crm'),
  ('crm_companies.create', 'Create CRM Company', 'crm'),
  ('crm_companies.update', 'Update CRM Company', 'crm'),
  ('crm_companies.delete', 'Delete CRM Company', 'crm'),
  -- Contacts
  ('contacts.list', 'List Contacts', 'crm'),
  ('contacts.read', 'View Contact', 'crm'),
  ('contacts.create', 'Create Contact', 'crm'),
  ('contacts.update', 'Update Contact', 'crm'),
  ('contacts.delete', 'Delete Contact', 'crm'),
  -- Deals
  ('deals.list', 'List Deals', 'crm'),
  ('deals.read', 'View Deal', 'crm'),
  ('deals.create', 'Create Deal', 'crm'),
  ('deals.update', 'Update Deal', 'crm'),
  ('deals.delete', 'Delete Deal', 'crm'),
  ('deals.won', 'Mark Deal Won', 'crm'),
  ('deals.lost', 'Mark Deal Lost', 'crm'),
  -- Activities
  ('activities.list', 'List Activities', 'crm'),
  ('activities.create', 'Create Activity', 'crm'),
  ('activities.update', 'Update Activity', 'crm'),
  ('activities.delete', 'Delete Activity', 'crm'),
  -- CRM Notes
  ('crm_notes.create', 'Create CRM Notes', 'crm'),
  ('crm_notes.read', 'View CRM Notes', 'crm')
ON CONFLICT (code) DO NOTHING;

-- DOWN
DELETE FROM permissions WHERE code IN (
  'leads.list', 'leads.read', 'leads.create', 'leads.update', 'leads.delete',
  'leads.assign', 'leads.convert',
  'crm_companies.list', 'crm_companies.read', 'crm_companies.create', 'crm_companies.update', 'crm_companies.delete',
  'contacts.list', 'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
  'deals.list', 'deals.read', 'deals.create', 'deals.update', 'deals.delete',
  'deals.won', 'deals.lost',
  'activities.list', 'activities.create', 'activities.update', 'activities.delete',
  'crm_notes.create', 'crm_notes.read'
);
