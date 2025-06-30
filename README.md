<!-- # MassKribbl - Real-time Multiplayer Drawing Game

A production-grade, real-time multiplayer "Draw & Guess" web game built with Next.js, TypeScript, Socket.IO, and Supabase. Features a stunning, colorful, modern UI designed to attract and retain users.

## 🎨 Features

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

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Real-time**: Socket.IO for multiplayer communication
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Database**: Supabase (for user accounts and game history)
- **UI Components**: Radix UI + Custom components

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional, for persistence)

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
cd ..
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials (optional):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development servers**

Terminal 1 - Socket.IO Server:
```bash
cd server
npm run dev
```

Terminal 2 - Next.js Frontend:
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🎮 How to Play

1. **Enter your username** and email to join
2. **Choose game mode**:
   - **Quick Play**: Join random players instantly
   - **Create Room**: Set up a private game with friends
   - **Join Room**: Enter a friend's room code
3. **Game Flow**:
   - Wait for players to join (2-12 players)
   - Host starts the game
   - Players take turns drawing
   - Drawer chooses from 3 words
   - Other players guess in chat
   - Points awarded for correct guesses and successful drawing
4. **Scoring**:
   - Guessers: 100 points + time bonus
   - Drawer: 50 points per correct guess

## 🏗️ Architecture

### Frontend Structure
```
app/
├── page.tsx              # Home page with login and lobby
├── game/[roomCode]/      # Game room page
├── layout.tsx            # Root layout
└── globals.css           # Global styles

components/
├── auth/                 # Authentication components
├── game/                 # Game-specific components
├── lobby/                # Lobby and room management
└── ui/                   # Reusable UI components

lib/
├── store.ts              # Zustand state management
├── socket.ts             # Socket.IO client management
├── supabase.ts           # Supabase client
└── words.ts              # Word lists and utilities
```

### Backend Structure
```
server/
├── socket-server.js      # Main Socket.IO server
├── words.js              # Word management utilities
└── package.json          # Server dependencies
```

## 🔧 Configuration

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

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Socket.IO Server (Railway/Heroku)
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
```

## 🎨 Customization

### Adding New Words
Edit `lib/words.ts` or `server/words.js`:
```javascript
const WORD_CATEGORIES = {
  // Add new categories
  sports: ['football', 'basketball', 'tennis'],
  // Or add to existing categories
  animals: [...existingAnimals, 'newAnimal']
}
```

### Styling
- Colors: Modify CSS variables in `app/globals.css`
- Animations: Customize Framer Motion variants in components
- Layout: Adjust Tailwind classes for responsive design

### Game Rules
- Scoring: Modify point calculations in `server/socket-server.js`
- Timing: Adjust round and selection timers
- Player limits: Change min/max players per room

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Skribbl.io and Gartic.io
- UI/UX inspiration from Monument Valley and Alto's Adventure
- Built with amazing open-source tools and libraries

---

**Ready to draw and guess? Start playing MassKribbl now!** 🎨✨ -->