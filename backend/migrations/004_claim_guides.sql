-- LifeVault Database Migration
-- Version: 004
-- Description: Add claim_guides table for nominee claim assistance

-- Claim guides table
-- Stores step-by-step guides for nominees to claim different types of assets
CREATE TABLE IF NOT EXISTS claim_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  documents JSONB NOT NULL DEFAULT '[]',
  contact_info TEXT,
  links JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_claim_guides_category ON claim_guides(category);

-- Create trigger to automatically update updated_at on claim_guides table
-- Drop existing trigger if it exists to allow re-running migration
DROP TRIGGER IF EXISTS update_claim_guides_updated_at ON claim_guides;
CREATE TRIGGER update_claim_guides_updated_at
  BEFORE UPDATE ON claim_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE claim_guides IS 'Step-by-step guides for nominees to claim different types of assets';
COMMENT ON COLUMN claim_guides.category IS 'Type of asset: Insurance, Bank Account, Mutual Funds, Fixed Deposits, Property, Digital Wallet, Govt Schemes, Others';
COMMENT ON COLUMN claim_guides.steps IS 'Array of step objects with step number and description';
COMMENT ON COLUMN claim_guides.documents IS 'Array of required document names';
COMMENT ON COLUMN claim_guides.contact_info IS 'Contact details for relevant authorities/organizations';
COMMENT ON COLUMN claim_guides.links IS 'Array of link objects with label and URL for downloadable forms';

-- Insert default claim guides
INSERT INTO claim_guides (category, title, steps, documents, contact_info, links) VALUES
(
  'Insurance Policy',
  'How to Claim Life Insurance Policy',
  '[
    {"step": 1, "description": "Obtain the death certificate from the local municipal authority or hospital"},
    {"step": 2, "description": "Locate the original insurance policy document and policy number"},
    {"step": 3, "description": "Contact the insurance company customer service and inform them about the claim"},
    {"step": 4, "description": "Fill out the claim form provided by the insurance company"},
    {"step": 5, "description": "Submit the claim form along with required documents to the insurance company"},
    {"step": 6, "description": "The insurance company will verify the documents and process the claim"},
    {"step": 7, "description": "Claim amount will be credited to the nominee bank account within 30-45 days"}
  ]'::jsonb,
  '["Death Certificate (Original)", "Insurance Policy Document", "Claim Form (from insurer)", "Nominee ID Proof (Aadhaar/PAN)", "Nominee Bank Account Details", "Relationship Proof (if required)", "Cancelled Cheque of Nominee"]'::jsonb,
  'Insurance Regulatory and Development Authority of India (IRDAI) - Toll Free: 155255 | Email: complaints@irdai.gov.in',
  '[
    {"label": "IRDAI Grievance Portal", "url": "https://igms.irda.gov.in/"},
    {"label": "Sample Claim Form", "url": "#"}
  ]'::jsonb
),
(
  'Bank Account',
  'How to Claim Bank Account Funds',
  '[
    {"step": 1, "description": "Obtain the death certificate from the local municipal authority"},
    {"step": 2, "description": "Visit the bank branch where the account is held"},
    {"step": 3, "description": "Submit a written application for claim settlement to the branch manager"},
    {"step": 4, "description": "Provide death certificate, nominee ID proof, and relationship proof"},
    {"step": 5, "description": "If nominee is registered, funds will be released within 15 days"},
    {"step": 6, "description": "If no nominee, legal heirs must provide succession certificate or probate"},
    {"step": 7, "description": "Funds will be transferred to the nominee/legal heir account"}
  ]'::jsonb,
  '["Death Certificate (Original)", "Nominee ID Proof (Aadhaar/PAN)", "Nominee Bank Account Details", "Passbook/Account Statement", "Relationship Proof", "Succession Certificate (if no nominee)"]'::jsonb,
  'Banking Ombudsman - RBI Toll Free: 14448 | Email: helpdoc@rbi.org.in',
  '[
    {"label": "RBI Banking Ombudsman", "url": "https://cms.rbi.org.in/"},
    {"label": "Claim Application Format", "url": "#"}
  ]'::jsonb
),
(
  'Mutual Funds',
  'How to Claim Mutual Fund Units',
  '[
    {"step": 1, "description": "Obtain the death certificate from the local municipal authority"},
    {"step": 2, "description": "Contact the mutual fund company or Registrar and Transfer Agent (RTA)"},
    {"step": 3, "description": "Request the transmission/claim form for deceased investor"},
    {"step": 4, "description": "Fill the form and attach death certificate, nominee ID proof, and folio details"},
    {"step": 5, "description": "Submit documents to the mutual fund office or RTA"},
    {"step": 6, "description": "Units will be transferred to nominee name or redeemed as per request"},
    {"step": 7, "description": "Process typically takes 15-30 days after document verification"}
  ]'::jsonb,
  '["Death Certificate (Original)", "Transmission Form", "Nominee ID Proof (Aadhaar/PAN)", "Folio Statement", "Cancelled Cheque", "Relationship Proof (if required)"]'::jsonb,
  'SEBI Investor Helpline: 1800 266 7575 | AMFI: 1800 572 7233',
  '[
    {"label": "SEBI Scores Portal", "url": "https://scores.sebi.gov.in/"},
    {"label": "CAMS Transmission Form", "url": "#"},
    {"label": "Karvy Transmission Form", "url": "#"}
  ]'::jsonb
),
(
  'Fixed Deposits',
  'How to Claim Fixed Deposit Amount',
  '[
    {"step": 1, "description": "Obtain the death certificate from the local municipal authority"},
    {"step": 2, "description": "Locate the original FD receipt/certificate"},
    {"step": 3, "description": "Visit the bank/post office branch where FD is held"},
    {"step": 4, "description": "Submit claim application with death certificate and FD receipt"},
    {"step": 5, "description": "Provide nominee ID proof and bank account details"},
    {"step": 6, "description": "Bank will verify documents and process premature closure if needed"},
    {"step": 7, "description": "FD amount with interest will be credited to nominee account within 15 days"}
  ]'::jsonb,
  '["Death Certificate (Original)", "FD Receipt/Certificate (Original)", "Nominee ID Proof", "Nominee Bank Account Details", "Cancelled Cheque", "Relationship Proof (if required)"]'::jsonb,
  'Bank Customer Care or Post Office Helpline: 1800 11 2011',
  '[
    {"label": "India Post FD Claim", "url": "https://www.indiapost.gov.in/"},
    {"label": "Claim Application Format", "url": "#"}
  ]'::jsonb
),
(
  'Property/Real Estate',
  'How to Transfer Property Ownership',
  '[
    {"step": 1, "description": "Obtain the death certificate from the local municipal authority"},
    {"step": 2, "description": "Locate property documents (sale deed, title deed, property tax receipts)"},
    {"step": 3, "description": "If Will exists, obtain probate from court; if no Will, obtain succession certificate"},
    {"step": 4, "description": "Visit the Sub-Registrar office with all documents"},
    {"step": 5, "description": "Submit application for property mutation/transfer"},
    {"step": 6, "description": "Pay applicable stamp duty and registration fees"},
    {"step": 7, "description": "Property will be transferred to legal heir/nominee name"},
    {"step": 8, "description": "Update property tax records with municipal corporation"}
  ]'::jsonb,
  '["Death Certificate (Original)", "Property Documents (Sale Deed, Title Deed)", "Will/Probate or Succession Certificate", "Legal Heir Certificate", "ID Proof of All Legal Heirs", "Property Tax Receipts", "NOC from Society (if applicable)"]'::jsonb,
  'Sub-Registrar Office (District-wise) | Legal Aid: 15100',
  '[
    {"label": "State Registration Department", "url": "#"},
    {"label": "Legal Heir Certificate Application", "url": "#"}
  ]'::jsonb
),
(
  'Digital Wallet / Online Services',
  'How to Claim Digital Assets and Online Accounts',
  '[
    {"step": 1, "description": "Obtain the death certificate from the local municipal authority"},
    {"step": 2, "description": "Identify all digital wallets and online accounts (email, social media, payment apps)"},
    {"step": 3, "description": "Contact customer support of each service provider"},
    {"step": 4, "description": "Submit death certificate and legal heir/nominee proof"},
    {"step": 5, "description": "For payment wallets, request fund transfer to nominee bank account"},
    {"step": 6, "description": "For email/social accounts, request account closure or memorialization"},
    {"step": 7, "description": "Keep records of all communications and reference numbers"}
  ]'::jsonb,
  '["Death Certificate (Original)", "Legal Heir Certificate", "Nominee ID Proof", "Account Details (email, phone, account ID)", "Relationship Proof", "Bank Account for Fund Transfer"]'::jsonb,
  'Service Provider Customer Support (varies by platform) | Cyber Cell: 1930',
  '[
    {"label": "Google Inactive Account Manager", "url": "https://myaccount.google.com/inactive"},
    {"label": "Facebook Memorialization", "url": "https://www.facebook.com/help/contact/305593649477238"},
    {"label": "Paytm Support", "url": "https://paytm.com/care"}
  ]'::jsonb
),
(
  'Govt Schemes / Pension',
  'How to Claim Government Pension and Benefits',
  '[
    {"step": 1, "description": "Obtain the death certificate from the local municipal authority"},
    {"step": 2, "description": "Locate pension payment order (PPO) and pension account details"},
    {"step": 3, "description": "Visit the pension disbursing bank or post office"},
    {"step": 4, "description": "Submit application for family pension with death certificate"},
    {"step": 5, "description": "Provide nominee/family member ID proof and bank details"},
    {"step": 6, "description": "For EPF/PPF, contact EPFO office or bank with claim form"},
    {"step": 7, "description": "Family pension will be credited monthly; EPF/PPF as lump sum"}
  ]'::jsonb,
  '["Death Certificate (Original)", "Pension Payment Order (PPO)", "Nominee ID Proof", "Bank Account Details", "Family Member Certificate", "Marriage Certificate (for spouse)", "Birth Certificate (for children)"]'::jsonb,
  'EPFO Helpline: 1800 118 005 | Pension Grievance: 1800 111 177',
  '[
    {"label": "EPFO Member Portal", "url": "https://unifiedportal-mem.epfindia.gov.in/"},
    {"label": "PPF Claim Form", "url": "#"},
    {"label": "Family Pension Form", "url": "#"}
  ]'::jsonb
);
