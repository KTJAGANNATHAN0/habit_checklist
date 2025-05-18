export type ProgressTheme = "mecha" | "katana"

export interface Habit {
  id: string
  name: string
  description: string
  reminderTime?: string
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
}
