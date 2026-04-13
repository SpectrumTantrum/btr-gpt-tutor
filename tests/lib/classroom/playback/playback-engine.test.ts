import { describe, it, expect, beforeEach } from "vitest"
import { PlaybackEngine } from "@/lib/classroom/playback/playback-engine"

describe("PlaybackEngine", () => {
  let engine: PlaybackEngine

  beforeEach(() => {
    engine = new PlaybackEngine(5)
  })

  it("starts in idle state with scene index 0", () => {
    // Arrange — engine created in beforeEach with totalScenes=5

    // Act
    const status = engine.getStatus()

    // Assert
    expect(status.state).toBe("idle")
    expect(status.currentSceneIndex).toBe(0)
    expect(status.currentActionIndex).toBe(0)
    expect(status.totalScenes).toBe(5)
    expect(status.isImmersive).toBe(false)
  })

  it("transitions from idle to playing on play event", () => {
    // Arrange
    expect(engine.getStatus().state).toBe("idle")

    // Act
    engine.dispatch({ type: "play" })

    // Assert
    expect(engine.getStatus().state).toBe("playing")
  })

  it("transitions from playing to paused on pause event", () => {
    // Arrange
    engine.dispatch({ type: "play" })

    // Act
    engine.dispatch({ type: "pause" })

    // Assert
    expect(engine.getStatus().state).toBe("paused")
  })

  it("increments currentSceneIndex on next_scene event", () => {
    // Arrange
    engine.dispatch({ type: "play" })

    // Act
    engine.dispatch({ type: "next_scene" })

    // Assert
    expect(engine.getStatus().currentSceneIndex).toBe(1)
  })

  it("decrements currentSceneIndex on prev_scene event", () => {
    // Arrange
    engine.dispatch({ type: "play" })
    engine.dispatch({ type: "next_scene" })
    engine.dispatch({ type: "next_scene" })
    expect(engine.getStatus().currentSceneIndex).toBe(2)

    // Act
    engine.dispatch({ type: "prev_scene" })

    // Assert
    expect(engine.getStatus().currentSceneIndex).toBe(1)
  })

  it("clamps scene index — does not go below 0 or beyond totalScenes - 1", () => {
    // Arrange — at index 0
    engine.dispatch({ type: "play" })

    // Act: try to go below 0
    engine.dispatch({ type: "prev_scene" })

    // Assert lower clamp
    expect(engine.getStatus().currentSceneIndex).toBe(0)

    // Act: jump to last index then try to exceed it (totalScenes=5, max index=4)
    engine.dispatch({ type: "goto_scene", index: 4 })
    engine.dispatch({ type: "next_scene" })

    // Assert upper clamp
    expect(engine.getStatus().currentSceneIndex).toBe(4)
  })

  it("jumps to the specified index on goto_scene event", () => {
    // Arrange
    engine.dispatch({ type: "play" })

    // Act
    engine.dispatch({ type: "goto_scene", index: 3 })

    // Assert
    expect(engine.getStatus().currentSceneIndex).toBe(3)
  })

  it("resets to idle state and scene index 0 on stop event", () => {
    // Arrange
    engine.dispatch({ type: "play" })
    engine.dispatch({ type: "next_scene" })
    engine.dispatch({ type: "next_scene" })
    expect(engine.getStatus().currentSceneIndex).toBe(2)

    // Act
    engine.dispatch({ type: "stop" })

    // Assert
    const status = engine.getStatus()
    expect(status.state).toBe("idle")
    expect(status.currentSceneIndex).toBe(0)
    expect(status.currentActionIndex).toBe(0)
  })

  it("toggles isImmersive on toggle_immersive event", () => {
    // Arrange
    expect(engine.getStatus().isImmersive).toBe(false)

    // Act
    engine.dispatch({ type: "toggle_immersive" })

    // Assert toggled on
    expect(engine.getStatus().isImmersive).toBe(true)

    // Act again
    engine.dispatch({ type: "toggle_immersive" })

    // Assert toggled off
    expect(engine.getStatus().isImmersive).toBe(false)
  })

  it("transitions to live state on go_live event when playing", () => {
    // Arrange
    engine.dispatch({ type: "play" })

    // Act
    engine.dispatch({ type: "go_live" })

    // Assert
    expect(engine.getStatus().state).toBe("live")
  })

  it("transitions to live state on go_live event when paused", () => {
    // Arrange
    engine.dispatch({ type: "play" })
    engine.dispatch({ type: "pause" })

    // Act
    engine.dispatch({ type: "go_live" })

    // Assert
    expect(engine.getStatus().state).toBe("live")
  })
})
