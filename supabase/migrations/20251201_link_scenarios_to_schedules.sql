-- Add schedule_id to schedule_scenarios to link generated versions to a parent scenario
ALTER TABLE schedule_scenarios 
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_schedule_scenarios_schedule_id ON schedule_scenarios(schedule_id);
