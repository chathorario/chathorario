-- Migration: Add network field to curriculum_matrices
-- Description: Add education network field (public or private) to curriculum matrices

-- Add network column
ALTER TABLE curriculum_matrices 
ADD COLUMN IF NOT EXISTS network VARCHAR(50);

-- Add network_type column for public network subdivisions
ALTER TABLE curriculum_matrices 
ADD COLUMN IF NOT EXISTS network_type VARCHAR(50);

-- Update existing records to have a default network
UPDATE curriculum_matrices 
SET network = 'publica', network_type = 'estadual'
WHERE network IS NULL;

-- Add comments to columns
COMMENT ON COLUMN curriculum_matrices.network IS 'Rede de ensino: publica ou privada';
COMMENT ON COLUMN curriculum_matrices.network_type IS 'Tipo de rede pública: estadual, distrital, municipal, federal (apenas se network = publica)';
