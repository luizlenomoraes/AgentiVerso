-- Migration: Tracking Pixels
-- Adiciona colunas para IDs de pixels de rastreamento na tabela app_settings

ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS google_pixel_id TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS tiktok_pixel_id TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS kwai_pixel_id TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS pinterest_pixel_id TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS taboola_pixel_id TEXT;

-- Comentários
COMMENT ON COLUMN app_settings.google_pixel_id IS 'ID do Google Analytics/Ads (G-XXX ou AW-XXX)';
COMMENT ON COLUMN app_settings.facebook_pixel_id IS 'ID do Pixel da Meta/Facebook';
COMMENT ON COLUMN app_settings.tiktok_pixel_id IS 'ID do Pixel do TikTok';
COMMENT ON COLUMN app_settings.kwai_pixel_id IS 'ID do Pixel do Kwai';
COMMENT ON COLUMN app_settings.pinterest_pixel_id IS 'ID do Pixel do Pinterest';
COMMENT ON COLUMN app_settings.taboola_pixel_id IS 'ID do Pixel da Taboola';
