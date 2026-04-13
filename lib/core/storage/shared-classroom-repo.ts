import { nanoid } from "nanoid"
import type { SharedClassroom } from "@/lib/core/types"
import type { SharedClassroomRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

const SHARE_ID_PREFIX = "shr_"

export class DexieSharedClassroomRepository implements SharedClassroomRepository {
  constructor(private readonly db: TutorDatabase) {}

  async createShare(data: Omit<SharedClassroom, "id">): Promise<SharedClassroom> {
    const share: SharedClassroom = {
      ...data,
      id: `${SHARE_ID_PREFIX}${nanoid()}`,
    }
    await this.db.sharedClassrooms.add(share)
    return share
  }

  async getShareByToken(token: string): Promise<SharedClassroom | null> {
    const share = await this.db.sharedClassrooms
      .where("token")
      .equals(token)
      .first()
    return share ?? null
  }

  async listSharesByClassroom(classroomId: string): Promise<SharedClassroom[]> {
    return this.db.sharedClassrooms
      .where("classroomId")
      .equals(classroomId)
      .toArray()
  }

  async deleteShare(id: string): Promise<void> {
    await this.db.sharedClassrooms.delete(id)
  }
}
