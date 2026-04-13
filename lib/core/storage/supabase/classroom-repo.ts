import type { SupabaseClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"
import type { Classroom } from "@/lib/core/types"
import type { ClassroomRepository } from "@/lib/core/storage/repository"

const CLASSROOM_ID_PREFIX = "cls_"

function toClassroom(row: Record<string, unknown>): Classroom {
  return {
    id: row.id as string,
    title: row.title as string,
    knowledgeBaseId: row.knowledge_base_id as string,
    scenes: (row.scenes as Classroom["scenes"]) ?? [],
    agents: (row.agents as Classroom["agents"]) ?? [],
    status: row.status as Classroom["status"],
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  }
}

export class SupabaseClassroomRepository implements ClassroomRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async createClassroom(data: Omit<Classroom, "id"> & { id?: string }): Promise<Classroom> {
    const row = {
      id: data.id ?? `${CLASSROOM_ID_PREFIX}${nanoid()}`,
      user_id: this.userId,
      title: data.title,
      knowledge_base_id: data.knowledgeBaseId,
      scenes: data.scenes,
      agents: data.agents,
      status: data.status,
    }

    const { data: inserted, error } = await this.supabase
      .from("classrooms")
      .insert(row)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toClassroom(inserted)
  }

  async getClassroom(id: string): Promise<Classroom | null> {
    const { data, error } = await this.supabase
      .from("classrooms")
      .select("*")
      .eq("id", id)
      .eq("user_id", this.userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? toClassroom(data) : null
  }

  async updateClassroom(id: string, data: Partial<Omit<Classroom, "id">>): Promise<Classroom> {
    const updates: Record<string, unknown> = {}
    if (data.title !== undefined) updates.title = data.title
    if (data.knowledgeBaseId !== undefined) updates.knowledge_base_id = data.knowledgeBaseId
    if (data.scenes !== undefined) updates.scenes = data.scenes
    if (data.agents !== undefined) updates.agents = data.agents
    if (data.status !== undefined) updates.status = data.status
    if (data.updatedAt !== undefined) updates.updated_at = new Date(data.updatedAt).toISOString()

    const { data: updated, error } = await this.supabase
      .from("classrooms")
      .update(updates)
      .eq("id", id)
      .eq("user_id", this.userId)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toClassroom(updated)
  }

  async listClassrooms(): Promise<Classroom[]> {
    const { data, error } = await this.supabase
      .from("classrooms")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toClassroom)
  }

  async deleteClassroom(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("classrooms")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId)

    if (error) throw new Error(error.message)
  }
}
