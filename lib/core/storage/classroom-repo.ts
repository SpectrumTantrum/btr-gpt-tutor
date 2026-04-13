import { nanoid } from "nanoid"
import type { Classroom } from "@/lib/core/types"
import type { ClassroomRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

const CLASSROOM_ID_PREFIX = "cls_"

export class DexieClassroomRepository implements ClassroomRepository {
  constructor(private readonly db: TutorDatabase) {}

  async createClassroom(data: Omit<Classroom, "id"> & { id?: string }): Promise<Classroom> {
    const classroom: Classroom = {
      ...data,
      id: data.id ?? `${CLASSROOM_ID_PREFIX}${nanoid()}`,
    }
    await this.db.classrooms.add(classroom)
    return classroom
  }

  async getClassroom(id: string): Promise<Classroom | null> {
    const classroom = await this.db.classrooms.get(id)
    return classroom ?? null
  }

  async updateClassroom(id: string, data: Partial<Omit<Classroom, "id">>): Promise<Classroom> {
    await this.db.classrooms.update(id, data)
    const updated = await this.db.classrooms.get(id)
    if (!updated) throw new Error(`Classroom ${id} not found`)
    return updated
  }

  async listClassrooms(): Promise<Classroom[]> {
    return this.db.classrooms.toArray()
  }

  async deleteClassroom(id: string): Promise<void> {
    await this.db.classrooms.delete(id)
  }
}
