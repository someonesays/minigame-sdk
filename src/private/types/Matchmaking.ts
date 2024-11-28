import { MatchmakingType } from "../../";

export interface MatchmakingResponse {
  authorization: string;
  data: MatchmakingData;
}

export interface MatchmakingData {
  type: "matchmaking";
  user: {
    id: string;
    displayName: string;
    avatar: string;
  };
  room: {
    id: string;
    server: {
      id: string;
      url: string;
      location: string;
    };
  };
  metadata: MatchmakingResponseMetadata;
  iat: number;
  exp: number;
}

export type MatchmakingResponseMetadata = MatchmakingResponseTesting;

export interface MatchmakingResponseTesting {
  type: MatchmakingType.TESTING;
  minigameId: string;
  testingAccessCode: string;
}
