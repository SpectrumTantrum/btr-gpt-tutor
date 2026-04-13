import type { ClassroomAction } from "@/lib/core/types";
import type { ActionHandler, ActionEngineConfig } from "./action-types";

export class ActionEngine {
  private readonly handlerMap: Map<string, ActionHandler>;
  private readonly onActionStart?: (action: ClassroomAction) => void;
  private readonly onActionComplete?: (action: ClassroomAction) => void;

  constructor(config: ActionEngineConfig) {
    this.handlerMap = new Map(
      config.handlers.map((handler) => [handler.type, handler])
    );
    this.onActionStart = config.onActionStart;
    this.onActionComplete = config.onActionComplete;
  }

  async executeAction(action: ClassroomAction): Promise<void> {
    const handler = this.handlerMap.get(action.type);
    if (!handler) {
      return;
    }

    this.onActionStart?.(action);
    await handler.execute(action);
    this.onActionComplete?.(action);
  }

  async executeSequence(actions: readonly ClassroomAction[]): Promise<void> {
    for (const action of actions) {
      await this.executeAction(action);
    }
  }
}
