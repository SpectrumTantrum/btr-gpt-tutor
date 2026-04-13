import { nanoid } from "nanoid"
import type { GuidePlan } from "@/lib/core/types"
import type { GuideRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

const GUIDE_ID_PREFIX = "guide_"

export class DexieGuideRepository implements GuideRepository {
  constructor(private readonly db: TutorDatabase) {}

  async createGuide(data: Omit<GuidePlan, "id">): Promise<GuidePlan> {
    const guide: GuidePlan = { ...data, id: `${GUIDE_ID_PREFIX}${nanoid()}` }
    await this.db.guides.add(guide)
    return guide
  }

  async getGuide(id: string): Promise<GuidePlan | null> {
    const guide = await this.db.guides.get(id)
    return guide ?? null
  }

  async updateGuide(id: string, data: Partial<Omit<GuidePlan, "id">>): Promise<GuidePlan> {
    await this.db.guides.update(id, data)
    const updated = await this.db.guides.get(id)
    if (!updated) throw new Error(`Guide ${id} not found`)
    return updated
  }

  async listGuides(knowledgeBaseId: string): Promise<GuidePlan[]> {
    return this.db.guides.where("knowledgeBaseId").equals(knowledgeBaseId).toArray()
  }

  async deleteGuide(id: string): Promise<void> {
    await this.db.guides.delete(id)
  }
}
