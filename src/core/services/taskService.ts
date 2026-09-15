import { taskRepository } from '../repositories'
import { StudyTask, createTask } from '../domain/models/Task'

export class TaskService {
  async getAll(): Promise<StudyTask[]> {
    return taskRepository.getAll()
  }

  async getByDate(date: string): Promise<StudyTask[]> {
    return taskRepository.getByDate(date)
  }

  async getToday(): Promise<StudyTask[]> {
    return taskRepository.getToday()
  }

  async create(data: Partial<StudyTask> & { subjectId: string; topic: string }): Promise<StudyTask> {
    const task = createTask(data)
    return taskRepository.create(task)
  }

  async update(id: string, updates: Partial<StudyTask>): Promise<StudyTask | null> {
    return taskRepository.update(id, updates)
  }

  async delete(id: string): Promise<void> {
    return taskRepository.delete(id)
  }

  async toggleStatus(id: string): Promise<StudyTask | null> {
    const task = await taskRepository.getById(id)
    if (!task) return null
    const statusOrder: Record<string, string> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
      partial: 'done',
      cancelled: 'todo'
    }
    return taskRepository.update(id, { status: statusOrder[task.status] as any })
  }

  async getByDateRange(start: string, end: string): Promise<StudyTask[]> {
    return taskRepository.getByDateRange(start, end)
  }
}

export const taskService = new TaskService()
