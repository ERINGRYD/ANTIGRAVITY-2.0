// src/types/navigation.types.ts
export type ActiveView =
  | 'main'
  | 'timeStats'
  | 'battleStats'
  | 'notifications'
  | 'history'
  | 'battleHistory'
  | 'achievements'
  | 'management'
  | 'goalsManagement'
  | 'battleSelection'
  | 'importJson'

export type ActiveModal =
  | null
  | 'battleSelection'
  | 'importJson'
