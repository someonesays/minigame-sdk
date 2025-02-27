# Minigame SDK - Someone Says

Create your own Someone Says minigames! This SDK is used to create minigames for the game "Someone Says".

## Setup

Run `npm i @someonesays/minigame-sdk` to download this library.

You can setup the `MinigameSDK` by doing this below:

```js
import { MinigameSdk, ParentOpcodes } from "@someonesays/minigame-sdk";

// Initiate the MinigameSDK
const sdk = new MinigameSdk();

// Initiate the TestingMinigameSDK
const sdk = new TestingMinigameSdk({
  minigameId: "insert your minigame id here",
  testingAccessCode: "insert your testing access code here",
  playersToStart: 2,
});

// Initiate the TestingMinigameSDK with more advanced settings
const sdk = new TestingMinigameSdk({
  minigameId: "insert your minigame id here",
  testingAccessCode: "insert your testing access code here",
  playersToStart: 2, // (reminder: make sure to change this value on your minigame settings when publishing your minigame!)
  opcode: "Oppack", // Either "Oppack" or "Json"
  displayName: "insert your display name here",
  volume: 100, // Value between 0-100
});

// When your minigame finishes loading and wants to start recieving events, run this event
const minigame = await sdk.ready();

// End the game (host-only)
sdk.endGame();

// Save local data store for the minigame as a string (1KB limit)
sdk.saveLocalData({ data: "string" });

// Advanced: Save local data store for the minigame as an UInt8Array (1KB limit)
sdk.saveLocalData({ data: new UInt8Array([123]) });

// Set the game state (host-only, 1MB limit)
sdk.setGameState({ state });

// Set the player state (host-only, 1MB limit)
sdk.setPlayerState({ user, state });

// Send a game message (host-only, sends it to everyone, 1MB limit)
sdk.sendGameMessage({ message });

// Send a player message (sends it to everyone, 1MB limit)
sdk.sendPlayerMessage({ message });

// Send a private message (user defaults to host, only the host can send messages to other players other than the host, 1MB limit)
sdk.sendPrivateMessage({ user, message });

// Advanced: Send a binary game message (host-only, sends it to everyone, 1MB limit)
sdk.sendBinaryGameMessage(new Uint8Array([1, 2, 3]));

// Advanced: Send a binary player message (sends it to everyone, 1MB limit)
sdk.sendBinaryPlayerMessage(new Uint8Array([1, 2, 3]));

// Advanced: Send a binary private message (user defaults to host, only the host can send messages to other players other than the host, 1MB limit)
sdk.sendBinaryPrivateMessage({ user, message: new Uint8Array([1, 2, 3]) });

// Here are the events
sdk.on(ParentOpcodes.UPDATE_SETTINGS, (evt) => {});
sdk.on(ParentOpcodes.START_GAME, (evt) => {});
sdk.on(ParentOpcodes.MINIGAME_PLAYER_READY, (evt) => {});
sdk.on(ParentOpcodes.PLAYER_LEFT, (evt) => {});
sdk.on(ParentOpcodes.UPDATED_GAME_STATE, (evt) => {});
sdk.on(ParentOpcodes.UPDATED_PLAYER_STATE, (evt) => {});
sdk.on(ParentOpcodes.RECEIVED_GAME_MESSAGE, (evt) => {});
sdk.on(ParentOpcodes.RECEIVED_PLAYER_MESSAGE, (evt) => {});
sdk.on(ParentOpcodes.RECEIVED_PRIVATE_MESSAGE, (evt) => {});
sdk.on(ParentOpcodes.RECEIVED_BINARY_GAME_MESSAGE, (evt) => {});
sdk.on(ParentOpcodes.RECEIVED_BINARY_PLAYER_MESSAGE, (evt) => {});
sdk.on(ParentOpcodes.RECEIVED_BINARY_PRIVATE_MESSAGE, (evt) => {});

// UPDATED_GAME_STATE, UPDATED_PLAYER_STATE, RECEIVED_GAME_MESSAGE, RECEIVED_PRIVATE_MESSAGE, RECEIVED_BINARY_GAME_MESSAGE and RECEIVED_BINARY_PRIVATE_MESSAGE (if it's sent from the host) should be trustworthy if the host is trustworthy and isn't cheating
// Always make sure to validate data from RECEIVED_PLAYER_MESSAGE (since players can send arbitrary).
// Also, make sure to validate data from RECEIVED_PRIVATE_MESSAGE if it isn't from the host
```
