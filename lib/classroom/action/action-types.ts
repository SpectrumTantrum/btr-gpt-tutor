import type { ClassroomAction } from "@/lib/core/types";

export interface ActionHandler {
  readonly type: string;
  execute(action: ClassroomAction): Promise<void>;
}

export interface ActionEngineConfig {
  readonly handlers: readonly ActionHandler[];
  readonly onActionStart?: (action: ClassroomAction) => void;
  readonly onActionComplete?: (action: ClassroomAction) => void;
}
