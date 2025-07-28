import {
  Context,
  generateEvent,
  Storage,
  transferredCoins,
  Address
} from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';

export function createGame(args: StaticArray<u8>): StaticArray<u8> {
  const receivedAmount = transferredCoins();
  assert(receivedAmount > 0, 'No MAS tokens were sent.');

  const deserializedArgs = new Args(args);
  const noOfRounds = deserializedArgs.nextU8().expect('Invalid number of rounds');
  const roundTime = deserializedArgs.nextU8().expect('Invalid round time');
  const totalPlayers = deserializedArgs.nextU8().expect('Invalid total players');
  const potPool = deserializedArgs.nextU64().expect('Invalid pot pool');

  assert(totalPlayers >= 2 && totalPlayers <= 10, 'Players must be between 2 and 10');
  assert(roundTime >= <u8>60 && roundTime <= <u8>1200, 'Round time must be between 60 and 1200 seconds');

  const hostShare = potPool / totalPlayers;
  assert(receivedAmount >= hostShare, 'Insufficient MAS tokens sent by host');

  const roomId = generateGameId();

  const playersArray = [Context.caller()];
  const players = new Args().addSerializableObjectArray(playersArray).serialize();
  Storage.set(stringToBytes(roomId + "_players"), players);

  const gameDetails = new Args()
    .add(noOfRounds)
    .add(roundTime)
    .add(totalPlayers)
    .add(potPool)
    .add(0)
    .add(0)
    .serialize();
  Storage.set(stringToBytes(roomId + "_details"), gameDetails);

  generateEvent(`Game created with Room ID: ${roomId}`);

  const result = new Args().add(roomId).add(noOfRounds).add(roundTime).add(totalPlayers).add(potPool).serialize();
  return result;
}

export function joinGame(args: StaticArray<u8>): StaticArray<u8> {
  // Ensure caller has sent MAS tokens
  const receivedAmount = transferredCoins();
  assert(receivedAmount > 0, 'No MAS tokens were sent.');

  // Deserialize the arguments to get the room ID
  const deserializedArgs = new Args(args);
  const roomId = deserializedArgs.nextString().expect('Invalid room ID');

  // Check if the room ID is valid
  assert(Storage.has(stringToBytes(roomId + "_details")), 'Room ID is invalid or does not exist');

  // Retrieve the players array and game details
  const playersData = Storage.get(stringToBytes(roomId + "_players"));
  const gameDetailsData = Storage.get(stringToBytes(roomId + "_details"));

  const playersArgs = new Args(playersData);
  const gameDetailsArgs = new Args(gameDetailsData);

  // Deserialize game details
  const totalPlayers = gameDetailsArgs.nextU8().expect('Invalid total players');
  const potPool = gameDetailsArgs.nextU64().expect('Invalid pot pool');

  // Check if the caller has sent enough MAS tokens according to the pot pool
  const playerShare = potPool / totalPlayers;
  assert(receivedAmount >= playerShare, 'Insufficient MAS tokens sent by player');

  // Deserialize the players array
  const currentPlayers = playersArgs.nextStringArray().expect('Invalid players array');

  // Check if the caller is not already in the room
  const callerAddress = Context.caller().toString();
  assert(!currentPlayers.includes(callerAddress), 'Caller is already in the room');

  // Add the caller to the players array
  currentPlayers.push(callerAddress);

  // getting issue in serializing the array for address 
  // const updatedPlayers = new Args().addSerializableObjectArray(currentPlayers).serialize();
  // Storage.set(stringToBytes(roomId + "_players"), updatedPlayers);

  // Emit event with room ID and caller
  generateEvent(`Player ${callerAddress} joined Room ID: ${roomId}`);

  // Return the result with player ID and room ID
  const result = new Args().add(callerAddress).add(roomId).serialize();
  return result;
}

export function startGame(args: StaticArray<u8>): StaticArray<u8> {
  // deserializing the args and getting the room id
  const deserializedArgs = new Args(args);
  const roomId = deserializedArgs.nextString().expect('Invalid room ID');

  // validations for ensuring we are accessing the correct storage
  assert(Storage.has(stringToBytes(roomId + "_details")), 'Room ID is invalid or does not exist');

  // getting the game details
  const gameDetailsData = Storage.get(stringToBytes(roomId + "_details"));
  const gameDetailsArgs = new Args(gameDetailsData);

  // deserializing the game details
  const noOfRounds = gameDetailsArgs.nextU8().expect('Invalid number of rounds');
  const roundTime = gameDetailsArgs.nextU8().expect('Invalid round time');
  const totalPlayers = gameDetailsArgs.nextU8().expect('Invalid total players');
  const potPool = gameDetailsArgs.nextU64().expect('Invalid pot pool');
  const currentRound = gameDetailsArgs.nextU8().expect('Invalid current round');
  const gameStatus = gameDetailsArgs.nextU8().expect('Invalid game status');

  // validations for ensuring the game is not started or ended
  assert(gameStatus == 0, 'Game has already started or ended');

  // updating the game details
  const updatedGameDetails = new Args()
    .add(noOfRounds)
    .add(roundTime)
    .add(totalPlayers)
    .add(potPool)
    .add(currentRound)
    .add(1) // game status: started
    .serialize();
  Storage.set(stringToBytes(roomId + "_details"), updatedGameDetails);

  // emitting the event for the game start
  generateEvent(`Game with Room ID: ${roomId} has started`);

  // returning the room id after serializing it
  const result = new Args().add(roomId).serialize();
  return result;
}

export function selectWord(args: StaticArray<u8>): void {
  // deserializing the args and getting the room id and word hash
  const deserializedArgs = new Args(args);
  const roomId = deserializedArgs.nextString().expect('Invalid room ID');

  // the word will be a hash to prevent the word from being queried from the contract storage
  const wordHash = deserializedArgs.nextString().expect('Invalid word hash');

  // this ensures we are not accessing invalid storage
  assert(Storage.has(stringToBytes(roomId + "_details")), 'Room ID is invalid or does not exist');

  // setting the word hash in the storage
  Storage.set(stringToBytes(roomId + "_word"), stringToBytes(wordHash));

  generateEvent(`Word selected for Room ID: ${roomId}`);
}

export function guessWord(args: StaticArray<u8>): void {
  const deserializedArgs = new Args(args);
  const roomId = deserializedArgs.nextString().expect('Invalid room ID');

  // compares the guessed word hash with the word hash in the storage
  const guessHash = deserializedArgs.nextString().expect('Invalid guess hash');

  // this ensures we are not accessing invalid storage
  assert(Storage.has(stringToBytes(roomId + "_word")), 'No word selected for this room');

  // getting the word hash from the storage
  const storedWordHash = bytesToString(Storage.get(stringToBytes(roomId + "_word")));

  // if wrong guessed this will fail the assert
  assert(storedWordHash == guessHash, 'Incorrect guess');

  generateEvent(`Correct guess for Room ID: ${roomId}`);
}

export function endGame(args: StaticArray<u8>): void {
  const deserializedArgs = new Args(args);
  const roomId = deserializedArgs.nextString().expect('Invalid room ID');

  // this ensures we are not accessing invalid storage
  assert(Storage.has(stringToBytes(roomId + "_details")), 'Room ID is invalid or does not exist');

  // getting the game details
  const gameDetailsData = Storage.get(stringToBytes(roomId + "_details"));
  const gameDetailsArgs = new Args(gameDetailsData);

  // deserializing the game details
  const noOfRounds = gameDetailsArgs.nextU8().expect('Invalid number of rounds');
  const roundTime = gameDetailsArgs.nextU8().expect('Invalid round time');
  const totalPlayers = gameDetailsArgs.nextU8().expect('Invalid total players');
  const potPool = gameDetailsArgs.nextU64().expect('Invalid pot pool');
  const currentRound = gameDetailsArgs.nextU8().expect('Invalid current round');
  const gameStatus = gameDetailsArgs.nextU8().expect('Invalid game status');

  // this ensures only active games can be ended
  assert(gameStatus == 1, 'Game is not currently active');

  // updating the game details
  const updatedGameDetails = new Args()
    .add(noOfRounds)
    .add(roundTime)
    .add(totalPlayers)
    .add(potPool)
    .add(currentRound)
    .add(2) // game status: ended
    .serialize();
  Storage.set(stringToBytes(roomId + "_details"), updatedGameDetails);

  generateEvent(`Game with Room ID: ${roomId} has ended`);
}

// generates a unique game id for the game with timestamp and caller address
function generateGameId(): string {
  const timestamp = Context.timestamp().toString();
  const caller = Context.caller().toString();
  return timestamp.slice(-6) + caller.slice(-3); // Simple ID generation
}