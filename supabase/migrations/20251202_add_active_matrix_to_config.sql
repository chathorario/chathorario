-- Migration: Add active_curriculum_matrix_id to school_configs
-- Description: Links the school configuration to a specific curriculum matrix

ALTER TABLE school_configs
ADD COLUMN IF NOT EXISTS active_curriculum_matrix_id UUID REFERENCES curriculum_matrices(id);
