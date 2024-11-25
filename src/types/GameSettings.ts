/** The game settings */
export interface GameSettings {
  language: GameSettingsLanguages;
  volume: number;
}

/** The language the user has set */
export type GameSettingsLanguages = "en-US";
