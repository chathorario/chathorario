-- Migration: Add modality field to curriculum_matrices
-- Description: Add teaching modality field to support different education types

-- Add modality column
ALTER TABLE curriculum_matrices 
ADD COLUMN IF NOT EXISTS modality VARCHAR(100);

-- Update existing records to have a default modality
UPDATE curriculum_matrices 
SET modality = 'integral' 
WHERE modality IS NULL;

-- Add comment to column
COMMENT ON COLUMN curriculum_matrices.modality IS 'Modalidade de ensino: regular, integral, eja, especial, profissional, ead, campo, indigena, quilombola';
