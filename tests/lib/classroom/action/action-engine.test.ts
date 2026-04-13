import { describe, it, expect, vi } from "vitest"
import { ActionEngine } from "@/lib/classroom/action/action-engine"
import type { ActionHandler, ActionEngineConfig } from "@/lib/classroom/action/action-types"
import type { ClassroomAction, ActionType } from "@/lib/core/types"

function makeAction(type: ActionType, id = "action_001"): ClassroomAction {
  return {
    id,
    type,
    agentId: "agent_001",
    data: {},
    durationMs: 500,
  }
}

function makeHandler(type: ActionType): ActionHandler {
  return {
    type,
    execute: vi.fn().mockResolvedValue(undefined),
  }
}

describe("ActionEngine", () => {
  describe("executeAction", () => {
    it("executes action with matching handler", async () => {
      // Arrange
      const handler = makeHandler("speech")
      const config: ActionEngineConfig = { handlers: [handler] }
      const engine = new ActionEngine(config)
      const action = makeAction("speech")

      // Act
      await engine.executeAction(action)

      // Assert
      expect(handler.execute).toHaveBeenCalledOnce()
      expect(handler.execute).toHaveBeenCalledWith(action)
    })

    it("fires onActionStart and onActionComplete callbacks", async () => {
      // Arrange
      const handler = makeHandler("navigate")
      const onActionStart = vi.fn()
      const onActionComplete = vi.fn()
      const config: ActionEngineConfig = {
        handlers: [handler],
        onActionStart,
        onActionComplete,
      }
      const engine = new ActionEngine(config)
      const action = makeAction("navigate")

      // Act
      await engine.executeAction(action)

      // Assert
      expect(onActionStart).toHaveBeenCalledOnce()
      expect(onActionStart).toHaveBeenCalledWith(action)
      expect(onActionComplete).toHaveBeenCalledOnce()
      expect(onActionComplete).toHaveBeenCalledWith(action)
    })

    it("skips actions without matching handler", async () => {
      // Arrange
      const handler = makeHandler("speech")
      const config: ActionEngineConfig = { handlers: [handler] }
      const engine = new ActionEngine(config)
      const action = makeAction("pause") // no handler registered for "pause"

      // Act
      await engine.executeAction(action)

      // Assert
      expect(handler.execute).not.toHaveBeenCalled()
    })
  })

  describe("executeSequence", () => {
    it("executes sequence of actions in order", async () => {
      // Arrange
      const order: string[] = []
      const speechHandler: ActionHandler = {
        type: "speech",
        execute: vi.fn().mockImplementation(async (a: ClassroomAction) => {
          order.push(a.id)
        }),
      }
      const navigateHandler: ActionHandler = {
        type: "navigate",
        execute: vi.fn().mockImplementation(async (a: ClassroomAction) => {
          order.push(a.id)
        }),
      }
      const config: ActionEngineConfig = {
        handlers: [speechHandler, navigateHandler],
      }
      const engine = new ActionEngine(config)
      const actions: ClassroomAction[] = [
        makeAction("speech", "action_001"),
        makeAction("navigate", "action_002"),
        makeAction("speech", "action_003"),
      ]

      // Act
      await engine.executeSequence(actions)

      // Assert
      expect(order).toEqual(["action_001", "action_002", "action_003"])
    })
  })
})
