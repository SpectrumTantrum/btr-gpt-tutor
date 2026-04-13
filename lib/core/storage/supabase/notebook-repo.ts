import type { SupabaseClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"
import type { Notebook, NotebookRecord } from "@/lib/core/types"
import type { NotebookRepository } from "@/lib/core/storage/repository"

function toNotebook(row: Record<string, unknown>): Notebook {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    color: row.color as string,
    recordCount: row.record_count as number,
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  }
}

function toNotebookRecord(row: Record<string, unknown>): NotebookRecord {
  return {
    id: row.id as string,
    notebookId: row.notebook_id as string,
    title: row.title as string,
    content: row.content as string,
    source: row.source as NotebookRecord["source"],
    sourceId: row.source_id as string | undefined,
    tags: (row.tags as string[]) ?? [],
    createdAt: new Date(row.created_at as string).getTime(),
  }
}

export class SupabaseNotebookRepository implements NotebookRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async listNotebooks(): Promise<Notebook[]> {
    const { data, error } = await this.supabase
      .from("notebooks")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toNotebook)
  }

  async getNotebook(id: string): Promise<Notebook | null> {
    const { data, error } = await this.supabase
      .from("notebooks")
      .select("*")
      .eq("id", id)
      .eq("user_id", this.userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? toNotebook(data) : null
  }

  async createNotebook(data: Omit<Notebook, "id">): Promise<Notebook> {
    const row = {
      id: `nb_${nanoid()}`,
      user_id: this.userId,
      name: data.name,
      description: data.description,
      color: data.color,
      record_count: data.recordCount,
    }

    const { data: inserted, error } = await this.supabase
      .from("notebooks")
      .insert(row)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toNotebook(inserted)
  }

  async updateNotebook(id: string, data: Partial<Omit<Notebook, "id">>): Promise<Notebook> {
    const updates: Record<string, unknown> = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.description !== undefined) updates.description = data.description
    if (data.color !== undefined) updates.color = data.color
    if (data.recordCount !== undefined) updates.record_count = data.recordCount
    if (data.updatedAt !== undefined) updates.updated_at = new Date(data.updatedAt).toISOString()

    const { data: updated, error } = await this.supabase
      .from("notebooks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", this.userId)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toNotebook(updated)
  }

  async deleteNotebook(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("notebooks")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId)

    if (error) throw new Error(error.message)
  }

  async addRecord(data: Omit<NotebookRecord, "id">): Promise<NotebookRecord> {
    const row = {
      id: `rec_${nanoid()}`,
      notebook_id: data.notebookId,
      title: data.title,
      content: data.content,
      source: data.source,
      source_id: data.sourceId ?? null,
      tags: data.tags,
    }

    const { data: inserted, error } = await this.supabase
      .from("notebook_records")
      .insert(row)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toNotebookRecord(inserted)
  }

  async getRecords(notebookId: string): Promise<NotebookRecord[]> {
    const { data, error } = await this.supabase
      .from("notebook_records")
      .select("*")
      .eq("notebook_id", notebookId)
      .order("created_at", { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toNotebookRecord)
  }

  async deleteRecord(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("notebook_records")
      .delete()
      .eq("id", id)

    if (error) throw new Error(error.message)
  }
}
