-- Create performance_metrics table for tracking Web Vitals and custom metrics

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_session_id ON performance_metrics(session_id);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_performance_metrics_rating ON performance_metrics(rating);

-- Add composite index for common aggregation queries
CREATE INDEX idx_performance_metrics_name_timestamp ON performance_metrics(metric_name, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own metrics
CREATE POLICY "Users can insert their own performance metrics"
  ON performance_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Authenticated users can view their own metrics
CREATE POLICY "Users can view their own performance metrics"
  ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Service role can do anything (for analytics/admin)
CREATE POLICY "Service role has full access to performance metrics"
  ON performance_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE performance_metrics IS 'Stores Web Vitals (CLS, FID, LCP, FCP, TTFB) and custom performance metrics for monitoring and analytics';
