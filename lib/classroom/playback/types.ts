export type PlaybackState = "idle" | "playing" | "paused" | "live";

export interface PlaybackStatus {
  readonly state: PlaybackState;
  readonly currentSceneIndex: number;
  readonly currentActionIndex: number;
  readonly totalScenes: number;
  readonly isImmersive: boolean;
}

export type PlaybackEvent =
  | { type: "play" }
  | { type: "pause" }
  | { type: "stop" }
  | { type: "next_scene" }
  | { type: "prev_scene" }
  | { type: "goto_scene"; index: number }
  | { type: "next_action" }
  | { type: "toggle_immersive" }
  | { type: "go_live" };
