/**
 * @fileoverview Supabase client configuration
 * @module supabase
 * 
 * Uses environment variables for all credentials.
 * In production, VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * are injected at build time via GitHub Actions secrets.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables. Auth will not work.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)
