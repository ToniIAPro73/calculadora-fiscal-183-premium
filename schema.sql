-- Create reports table for storing tax report data
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  report_key UUID NOT NULL UNIQUE,
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  client_reference_id VARCHAR(255),
  source VARCHAR(50) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) DEFAULT 'passport',
  total_days INTEGER DEFAULT 0,
  status_label VARCHAR(255),
  ranges JSONB,
  payment_status VARCHAR(50) DEFAULT 'pending',
  customer_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_report_key ON reports(report_key);
CREATE INDEX IF NOT EXISTS idx_reports_stripe_session_id ON reports(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_reports_stripe_payment_intent_id ON reports(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
