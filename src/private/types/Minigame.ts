import type { MinigameOrientation } from "../../";

export interface Minigame {
  id: string;
  name: string;
  description: string;
  published: boolean;
  official: boolean;
  currentlyFeatured: boolean;
  previouslyFeaturedDate: string | null;
  author: {
    id: string;
    name: string;
    createdAt: string;
  };
  previewImage: {
    normal: string;
    discord: string;
  } | null;
  proxies: {
    normal: string;
    discord: string;
  } | null;
  minimumPlayersToStart: number;
  supportsMobile: boolean;
  mobileOrientation: MinigameOrientation;
  privacyPolicy: string | null;
  termsOfServices: string | null;
  createdAt: string;
  updatedAt: string;
}
