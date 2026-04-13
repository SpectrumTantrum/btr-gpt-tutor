-- =============================================================================
-- Migration: 001_initial_schema
-- Description: Initial schema for multi-user deployment of btr-gpt-tutor.
--              Includes pgvector for semantic search, RLS for per-user isolation,
--              and all core application tables.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- knowledge_bases: user-owned collections of embedded documents
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id                  TEXT        PRIMARY KEY,
  user_id             UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  description         TEXT        NOT NULL DEFAULT '',
  embedding_model     TEXT        NOT NULL,
  embedding_dimension INTEGER     NOT NULL,
  document_count      INTEGER     NOT NULL DEFAULT 0,
  chunk_count         INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- documents: files uploaded into a knowledge base
CREATE TABLE IF NOT EXISTS documents (
  id                TEXT        PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  knowledge_base_id TEXT        NOT NULL REFERENCES knowledge_bases (id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  mime_type         TEXT        NOT NULL,
  size              INTEGER     NOT NULL DEFAULT 0,
  chunk_count       INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- chunks: parsed, embedded text segments for semantic retrieval
CREATE TABLE IF NOT EXISTS chunks (
  id                TEXT    PRIMARY KEY,
  knowledge_base_id TEXT    NOT NULL REFERENCES knowledge_bases (id) ON DELETE CASCADE,
  document_id       TEXT    NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
  content           TEXT    NOT NULL,
  metadata          JSONB   NOT NULL DEFAULT '{}',
  embedding         vector(1536)
);

-- sessions: chat conversation history
CREATE TABLE IF NOT EXISTS sessions (
  id                  TEXT        PRIMARY KEY,
  user_id             UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title               TEXT        NOT NULL,
  knowledge_base_ids  TEXT[]      NOT NULL DEFAULT '{}',
  messages            JSONB       NOT NULL DEFAULT '[]',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- memory: per-user learner profile and progress (one row per user)
CREATE TABLE IF NOT EXISTS memory (
  id         TEXT        PRIMARY KEY,
  user_id    UUID        NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  profile    JSONB       NOT NULL DEFAULT '{}',
  progress   JSONB       NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notebooks: user-created notebooks for persistent notes
CREATE TABLE IF NOT EXISTS notebooks (
  id           TEXT        PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  description  TEXT        NOT NULL DEFAULT '',
  color        TEXT        NOT NULL DEFAULT '#6366f1',
  record_count INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notebook_records: individual notes saved to a notebook
CREATE TABLE IF NOT EXISTS notebook_records (
  id          TEXT        PRIMARY KEY,
  notebook_id TEXT        NOT NULL REFERENCES notebooks (id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  source      TEXT        NOT NULL,
  source_id   TEXT,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- quizzes: AI-generated quizzes tied to a knowledge base
CREATE TABLE IF NOT EXISTS quizzes (
  id                TEXT        PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  knowledge_base_id TEXT        NOT NULL REFERENCES knowledge_bases (id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  questions         JSONB       NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- quiz_attempts: user submissions for a quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              TEXT        PRIMARY KEY,
  quiz_id         TEXT        NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  answers         JSONB       NOT NULL DEFAULT '[]',
  score           INTEGER     NOT NULL DEFAULT 0,
  total_questions INTEGER     NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- guides: structured step-by-step learning plans
CREATE TABLE IF NOT EXISTS guides (
  id                  TEXT        PRIMARY KEY,
  user_id             UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  knowledge_base_id   TEXT        NOT NULL REFERENCES knowledge_bases (id) ON DELETE CASCADE,
  topic               TEXT        NOT NULL,
  steps               JSONB       NOT NULL DEFAULT '[]',
  status              TEXT        NOT NULL DEFAULT 'in_progress',
  current_step_index  INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- classrooms: AI-generated interactive classroom presentations
CREATE TABLE IF NOT EXISTS classrooms (
  id                TEXT        PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  knowledge_base_id TEXT        NOT NULL REFERENCES knowledge_bases (id) ON DELETE CASCADE,
  scenes            JSONB       NOT NULL DEFAULT '[]',
  agents            JSONB       NOT NULL DEFAULT '[]',
  status            TEXT        NOT NULL DEFAULT 'generating',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tutorbots: persistent AI tutor bot configurations
CREATE TABLE IF NOT EXISTS tutorbots (
  id               TEXT        PRIMARY KEY,
  user_id          UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  persona          TEXT        NOT NULL DEFAULT '',
  soul_template_id TEXT,
  status           TEXT        NOT NULL DEFAULT 'stopped',
  model            TEXT        NOT NULL,
  skills           JSONB       NOT NULL DEFAULT '[]',
  heartbeat        JSONB       NOT NULL DEFAULT '{}',
  memory_context   TEXT        NOT NULL DEFAULT '',
  channels         TEXT[]      NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- shared_classrooms: public share tokens for classroom access
CREATE TABLE IF NOT EXISTS shared_classrooms (
  id           TEXT        PRIMARY KEY,
  classroom_id TEXT        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
  token        TEXT        NOT NULL UNIQUE,
  created_by   UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_knowledge_bases_user_id       ON knowledge_bases    (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id             ON documents          (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_knowledge_base_id   ON documents          (knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_chunks_knowledge_base_id      ON chunks             (knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id            ON chunks             (document_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id              ON sessions           (user_id);
CREATE INDEX IF NOT EXISTS idx_memory_user_id                ON memory             (user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id             ON notebooks          (user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_records_notebook_id  ON notebook_records   (notebook_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id               ON quizzes            (user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_knowledge_base_id     ON quizzes            (knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id         ON quiz_attempts      (quiz_id);
CREATE INDEX IF NOT EXISTS idx_guides_user_id                ON guides             (user_id);
CREATE INDEX IF NOT EXISTS idx_guides_knowledge_base_id      ON guides             (knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_user_id            ON classrooms         (user_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_knowledge_base_id  ON classrooms         (knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_tutorbots_user_id             ON tutorbots          (user_id);
CREATE INDEX IF NOT EXISTS idx_shared_classrooms_token       ON shared_classrooms  (token);
CREATE INDEX IF NOT EXISTS idx_shared_classrooms_classroom_id ON shared_classrooms (classroom_id);

-- IVFFlat index for approximate nearest-neighbor vector search on chunks.
-- lists=100 is appropriate for datasets up to ~1M rows.
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE knowledge_bases    ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides             ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorbots          ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_classrooms  ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS Policies: knowledge_bases
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own knowledge bases"
  ON knowledge_bases
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: documents
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own documents"
  ON documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: chunks
-- Chunks are owned via their parent knowledge base's user_id.
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage chunks in their own knowledge bases"
  ON chunks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb
      WHERE kb.id = chunks.knowledge_base_id
        AND kb.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb
      WHERE kb.id = chunks.knowledge_base_id
        AND kb.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: sessions
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own sessions"
  ON sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: memory
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own memory"
  ON memory
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: notebooks
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own notebooks"
  ON notebooks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: notebook_records
-- Records are owned via their parent notebook's user_id.
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage records in their own notebooks"
  ON notebook_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM notebooks nb
      WHERE nb.id = notebook_records.notebook_id
        AND nb.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notebooks nb
      WHERE nb.id = notebook_records.notebook_id
        AND nb.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: quizzes
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own quizzes"
  ON quizzes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: quiz_attempts
-- Attempts are owned via their parent quiz's user_id.
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage attempts for their own quizzes"
  ON quiz_attempts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      WHERE q.id = quiz_attempts.quiz_id
        AND q.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes q
      WHERE q.id = quiz_attempts.quiz_id
        AND q.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: guides
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own guides"
  ON guides
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: classrooms
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own classrooms"
  ON classrooms
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: tutorbots
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can manage their own tutorbots"
  ON tutorbots
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS Policies: shared_classrooms
-- The creating user can manage their share tokens.
-- Anyone can SELECT by token (enables public share link access).
-- ---------------------------------------------------------------------------

CREATE POLICY "Creators can manage their own share tokens"
  ON shared_classrooms
  FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view a classroom via valid share token"
  ON shared_classrooms
  FOR SELECT
  USING (true);
