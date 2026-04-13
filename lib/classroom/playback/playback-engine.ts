import type { PlaybackEvent, PlaybackState, PlaybackStatus } from "./types";

interface EngineState {
  readonly state: PlaybackState;
  readonly currentSceneIndex: number;
  readonly currentActionIndex: number;
  readonly isImmersive: boolean;
}

const INITIAL_STATE: EngineState = {
  state: "idle",
  currentSceneIndex: 0,
  currentActionIndex: 0,
  isImmersive: false,
};

export class PlaybackEngine {
  private engineState: EngineState;
  private readonly totalScenes: number;

  constructor(totalScenes: number) {
    this.totalScenes = totalScenes;
    this.engineState = INITIAL_STATE;
  }

  dispatch(event: PlaybackEvent): void {
    this.engineState = this.reduce(this.engineState, event);
  }

  getStatus(): PlaybackStatus {
    return {
      state: this.engineState.state,
      currentSceneIndex: this.engineState.currentSceneIndex,
      currentActionIndex: this.engineState.currentActionIndex,
      totalScenes: this.totalScenes,
      isImmersive: this.engineState.isImmersive,
    };
  }

  private reduce(state: EngineState, event: PlaybackEvent): EngineState {
    switch (event.type) {
      case "play":
        return { ...state, state: "playing" };

      case "pause":
        return { ...state, state: "paused" };

      case "stop":
        return { ...INITIAL_STATE };

      case "next_scene":
        return {
          ...state,
          currentSceneIndex: Math.min(
            state.currentSceneIndex + 1,
            this.totalScenes - 1
          ),
        };

      case "prev_scene":
        return {
          ...state,
          currentSceneIndex: Math.max(state.currentSceneIndex - 1, 0),
        };

      case "goto_scene":
        return {
          ...state,
          currentSceneIndex: Math.max(
            0,
            Math.min(event.index, this.totalScenes - 1)
          ),
        };

      case "next_action":
        return {
          ...state,
          currentActionIndex: state.currentActionIndex + 1,
        };

      case "toggle_immersive":
        return { ...state, isImmersive: !state.isImmersive };

      case "go_live":
        return { ...state, state: "live" };

      default:
        return state;
    }
  }
}
