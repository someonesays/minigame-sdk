/** The state or message */
export type State =
  | boolean
  | number
  | string
  | null
  | {
      [key: string]: State;
    }
  | State[];
