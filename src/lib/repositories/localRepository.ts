import { loadAppData, saveAppData } from '../../storage'
import { seedAppData } from '../seed'
import type { AppRepository } from './types'

export const localRepository: AppRepository = {
  async load() {
    return loadAppData() ?? seedAppData()
  },
  async save(next) {
    saveAppData(next)
  },
}

