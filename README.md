# MassKribbl - Blockchain-Powered Real-time Multiplayer Drawing Game

A production-grade, real-time multiplayer "Draw & Guess" web game built with Next.js, TypeScript, Socket.IO, Supabase, and powered by **Massa Blockchain**. Features a stunning, colorful, modern UI with decentralized game mechanics and cryptocurrency rewards.

## 🚀 Massa Blockchain Integration

### Smart Contract Features
- **Decentralized Game Creation**: Create games with cryptocurrency pot pools
- **Trustless Prize Distribution**: Automatic reward distribution via smart contracts
- **On-chain Game State**: Critical game data stored on Massa blockchain
- **MAS Token Integration**: Use MAS tokens for entry fees and winnings
- **Provably Fair**: Word hashing ensures fairness and prevents cheating

### Contract Functions
- `createGame()`: Initialize a new game with pot pool contribution
- `joinGame()`: Join existing games with entry fee
- `startGame()`: Begin the game when all players are ready
- `selectWord()`: Store word hash for verifiable guessing
- `guessWord()`: Validate guesses against stored word hash
- `endGame()`: Finalize game and trigger prize distribution

**Deployed Contract**: `AS12uD3CWuzFqc442vk38EaHDfusV4D2D3KMDjdRPXmj3mZFr4bdt`  
**Deployer Address**: `AU1266rWu76eU1XrjRntBhJVQdWxn3pzGrH3hMV3LwKyvVfEcy3cn`

## 🎨 Features

### Blockchain-Powered Gameplay
- **Cryptocurrency Rewards**: Win real MAS tokens in competitive matches
- **Decentralized Prize Pools**: Smart contract-managed pot distribution
- **Provably Fair Word Selection**: On-chain word hashing prevents cheating
- **Wallet Integration**: Connect with Massa wallet for seamless transactions
- **Transparent Game State**: Critical game data stored on blockchain

### Core Gameplay
- **Turn-based multiplayer**: One player draws, others guess
- **Real-time drawing**: Smooth HTML5 Canvas with optimized stroke synchronization
- **Smart scoring**: Points for fast guesses and successful drawing
- **Room system**: Public matchmaking and private rooms (4-12 players)
- **Word selection**: 3 word choices per turn from curated categories

### Drawing Tools
- Multiple brush sizes (2px to 25px)
- Vibrant color palette (18+ colors)
- Eraser tool
- Undo/Clear canvas functionality
- Smooth mouse and touch support

### Social Features
- **Real-time chat**: Guessing and social interaction
- **Player avatars**: Auto-generated unique avatars
- **Live leaderboard**: Real-time score updates
- **Spectator mode**: Watch games in progress

### UI/UX Design
- **Colorful, modern design**: Glassmorphism, gradients, neon highlights
- **Smooth animations**: Framer Motion powered transitions
- **Responsive**: Fully mobile-optimized
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Tech Stack

### Blockchain Layer
- **Massa Blockchain**: Decentralized game state and prize distribution
- **AssemblyScript**: Smart contract development language
- **Massa Web3**: Blockchain interaction library
- **Massa Wallet Provider**: Wallet connection and transaction signing

### Frontend
- **Next.js 15**: React framework with TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Zustand**: State management

### Backend & Real-time
- **Socket.IO**: Real-time multiplayer communication
- **Node.js**: Backend runtime
- **Supabase**: Database for user accounts and game history

### UI Components
- **Radix UI**: Accessible component primitives
- **Custom Components**: Game-specific UI elements

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional, for persistence)
- **Massa Wallet** (for blockchain features)
- **MAS Tokens** (for game entry fees)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd masskribbl
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install

# Install contract dependencies
cd ../contracts
npm install
cd ..
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Massa Blockchain
PRIVATE_KEY=your_private_key
PUBLIC_KEY=your_public_key
WALLET_ADDRESS=your_wallet_address
```

4. **Smart Contract Deployment** (Optional - Already deployed)
```bash
cd contracts
npm run build
npm run deploy
```

5. **Start the development servers**

Terminal 1 - Socket.IO Server:
```bash
cd server
npm run dev
```

Terminal 2 - Next.js Frontend:
```bash
npm run dev
```

6. **Connect your Massa wallet**
- Install Massa wallet extension
- Navigate to `http://localhost:3000`
- Connect wallet and start playing with MAS tokens

## 🎮 How to Play

### Getting Started
1. **Connect your Massa wallet** and ensure you have MAS tokens
2. **Enter your username** and email to join
3. **Choose game mode**:
   - **Quick Play**: Join random players instantly (requires entry fee)
   - **Create Room**: Set up a private game with friends and pot pool
   - **Join Room**: Enter a friend's room code

### Blockchain Game Flow
1. **Game Creation**: Host deposits MAS tokens for pot pool
2. **Player Joining**: Each player contributes equal share to pot
3. **Game Execution**: Smart contract manages game state
4. **Prize Distribution**: Winners automatically receive MAS tokens

### Traditional Game Flow
1. Wait for players to join (2-12 players)
2. Host starts the game
3. Players take turns drawing
4. Drawer chooses from 3 words (stored as hash on blockchain)
5. Other players guess in chat (verified against on-chain hash)
6. Points awarded for correct guesses and successful drawing

### Scoring & Rewards
- **Traditional Mode**: Points-based leaderboard
- **Blockchain Mode**: Real MAS token prizes
- **Guessers**: 100 points + time bonus
- **Drawer**: 50 points per correct guess
- **Winner**: Largest share of the pot pool

## 🏗️ Architecture

### Blockchain Integration
```
contracts/
├── assembly/contracts/main.ts    # Smart contract logic
├── scripts/
│   ├── deploy.ts                 # Contract deployment
│   ├── hello.ts                  # Contract interaction
│   └── utils.ts                  # Utility functions
├── package.json                  # Contract dependencies
└── README.md                     # Contract documentation

app/api/socket/get-balance/       # Blockchain API endpoints
```

### Frontend Structure
```
app/
├── page.tsx                      # Home page with wallet connection
├── game/[roomCode]/              # Game room page
├── test/                         # Blockchain testing page
├── layout.tsx                    # Root layout
└── globals.css                   # Global styles

components/
├── auth/                         # Authentication components
├── game/                         # Game-specific components
├── lobby/                        # Lobby and room management
└── ui/                           # Reusable UI components

lib/
├── store.ts                      # Zustand state management
├── socket.ts                     # Socket.IO client management
├── supabase.ts                   # Supabase client
└── words.ts                      # Word lists and utilities
```

### Backend Structure
```
server/
├── socket-server.js              # Main Socket.IO server
├── words.js                      # Word management utilities
└── package.json                  # Server dependencies
```

## 🔧 Configuration

### Blockchain Settings
- **Network**: Massa Buildnet/Mainnet
- **Entry Fee**: Configurable MAS token amount per game
- **Pot Distribution**: Winner-takes-all or split by ranking
- **Gas Optimization**: Efficient contract calls for real-time gaming

### Game Settings
- **Round Duration**: 80 seconds per drawing turn
- **Word Selection Time**: 15 seconds to choose word
- **Max Players**: 4-12 players per room
- **Rounds**: 2-5 rounds per game

### Drawing Settings
- **Canvas Size**: Responsive, maintains 4:3 aspect ratio
- **Brush Sizes**: 2, 5, 10, 15, 20, 25 pixels
- **Colors**: 18 predefined colors + black/white
- **Stroke Optimization**: Delta compression for smooth real-time sync

## 🚀 Deployment

### Smart Contract
```bash
cd contracts
npm run build
npm run deploy
```

### Frontend
```bash
npm run build
```

### Socket.IO Server 
```bash
cd server
npm start
```

### Environment Variables
```env
# Production
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SOCKET_SERVER_URL=your_production_socket_server_url

# Massa Blockchain
PRIVATE_KEY=your_production_private_key
PUBLIC_KEY=your_production_public_key
WALLET_ADDRESS=your_production_wallet_address
CONTRACT_ADDRESS=AS12uD3CWuzFqc442vk38EaHDfusV4D2D3KMDjdRPXmj3mZFr4bdt
```

## 💰 Blockchain Features in Detail

### Smart Contract Functions

#### `createGame(noOfRounds, roundTime, totalPlayers, potPool)`
- Creates a new game with specified parameters
- Host must deposit their share of the pot pool in MAS tokens
- Validates player count (2-10) and round time (60-1200 seconds)
- Returns unique game ID for players to join

#### `joinGame(roomId)`
- Allows players to join an existing game
- Requires equal contribution to the pot pool
- Prevents duplicate joins from the same address
- Updates player list in contract storage

#### `selectWord(roomId, wordHash)`
- Stores a hashed version of the selected word on-chain
- Ensures words cannot be viewed by other players
- Enables provably fair guessing verification

#### `guessWord(roomId, guessHash)`
- Compares player's guess hash with stored word hash
- Provides cryptographic proof of correct guesses
- Prevents cheating and ensures fair gameplay

#### `endGame(roomId)`
- Finalizes the game and triggers prize distribution
- Updates game status to completed
- Enables prize withdrawal for winners

### Security Features
- **Hash-based Word Storage**: Prevents word leakage while maintaining verifiability
- **Entry Fee Validation**: Ensures all players contribute equally to pot
- **Reentrancy Protection**: Secure fund handling and distribution
- **Address Verification**: Prevents duplicate entries and unauthorized actions

### Economic Model
- **Entry Fees**: Each player contributes equal MAS tokens to join
- **Prize Distribution**: Winners receive proportional shares of the pot
- **Gas Optimization**: Minimal transaction costs for real-time gaming
- **Transparent Payouts**: All prize distributions are publicly verifiable

## 🎨 Customization & Development

### Contract Customization
```typescript
// Modify game parameters in main.ts
const MAX_PLAYERS = 10;
const MIN_ROUND_TIME = 60; // seconds
const MAX_ROUND_TIME = 1200; // seconds

// Adjust prize distribution logic
function distributePrizes(players: Address[], potPool: u64): void {
  // Custom prize distribution logic
}
```

### Adding New Features
```typescript
// Add new contract functions
export function newFeature(args: StaticArray<u8>): StaticArray<u8> {
  // Implementation
}
```

### Frontend Blockchain Integration
```typescript
// Connect to smart contract
import { SmartContract, JsonRpcProvider } from '@massalabs/massa-web3';

const contract = new SmartContract(provider, CONTRACT_ADDRESS);
const result = await contract.call('createGame', args);
```

### Testing Blockchain Features
```bash
# Test wallet connection and balance
npm run dev
# Navigate to /test page for wallet testing

# Test contract deployment
cd contracts
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


---

## 🌟 What Makes MassKribbl Special

- **First Blockchain Drawing Game**: Pioneering the intersection of casual gaming and DeFi
- **Real Cryptocurrency Rewards**: Win actual MAS tokens, not just points
- **Provably Fair**: Blockchain ensures transparent and verifiable gameplay
- **Low Entry Barriers**: Micro-transactions make it accessible to all players
- **Instant Settlements**: Smart contracts enable immediate prize distribution
- **Community Driven**: Decentralized gaming ecosystem

**Ready to draw, guess, and earn? Start playing MassKribbl now!** 🎨✨💰