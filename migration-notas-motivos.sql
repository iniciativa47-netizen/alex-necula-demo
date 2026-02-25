-- Migration: Añadir campo notas y ampliar motivos
-- ================================================
-- Ejecutar esto en la consola SQL de Supabase

-- 1. Añadir columna notas a la tabla citas
ALTER TABLE citas ADD COLUMN IF NOT EXISTS notas TEXT;

-- 2. Eliminar el CHECK constraint antiguo de motivo
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_motivo_check;

-- 3. Añadir nuevo CHECK constraint con todos los motivos
ALTER TABLE citas ADD CONSTRAINT citas_motivo_check
  CHECK (motivo IN (
    'Primera visita',
    'Higiene / limpieza',
    'Urgencia',
    'Ortodoncia',
    'Revisión',
    'Caries / Empaste',
    'Extracción',
    'Endodoncia',
    'Implantes',
    'Prótesis',
    'Estética dental'
  ));

-- 4. Actualizar citas existentes sin notas
UPDATE citas SET notas = '' WHERE notas IS NULL;
