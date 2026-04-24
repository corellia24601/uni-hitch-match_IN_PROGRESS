import type { AppData } from '../../types'

export type AppRepository = {
  load(): Promise<AppData>
  save(next: AppData): Promise<void>
}

