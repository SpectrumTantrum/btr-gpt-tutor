import type { Memory } from "@/lib/core/types"
import type { MemoryRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

const MEMORY_ID = "memory_default"

export class DexieMemoryRepository implements MemoryRepository {
  constructor(private readonly db: TutorDatabase) {}

  async getMemory(): Promise<Memory | undefined> {
    return this.db.memory.get(MEMORY_ID)
  }

  async saveMemory(memory: Memory): Promise<void> {
    await this.db.memory.put({ ...memory, id: MEMORY_ID })
  }
}
