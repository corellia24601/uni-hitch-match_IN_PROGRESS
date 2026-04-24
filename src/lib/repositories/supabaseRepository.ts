import { localRepository } from './localRepository'
import { supabase } from '../supabase/client'
import type { AppRepository } from './types'

/**
 * Placeholder adapter for progressive migration.
 * Until server tables are fully wired, we fallback locally.
 */
export const supabaseRepository: AppRepository = {
  async load() {
    if (!supabase) return localRepository.load()
    // Future: fetch normalized data from Supabase.
    return localRepository.load()
  },
  async save(next) {
    if (!supabase) return localRepository.save(next)
    // Future: persist writes to Supabase RPC/functions.
    return localRepository.save(next)
  },
}

