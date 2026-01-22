# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice AI History Expert - a real-time voice conversation application where users can ask questions about world history using push-to-talk. The app uses browser speech recognition for input, streams responses from Groq's Llama 3.3 model, and speaks responses using browser speech synthesis.

## Commands

### Server (from `/server` directory)
```bash
npm start          # Start production server
npm run dev        # Start with watch mode (auto-restart on changes)
```

### Client (from `/client` directory)
```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Running locally
1. Create `/server/.env` with `GROQ_API_KEY=your_key`
2. Start both services - server runs on port 3001, client dev server on port 5173

## Architecture

### Client-Server Communication
- WebSocket connection between React client and Express server
- Client→Server message types: `user_message`, `clear_history`
- Server→Client message types: `connected`, `status`, `assistant_chunk`, `assistant_done`, `error`, `history_cleared`
- Server maintains per-client conversation history in memory via `ConversationManager`

### Client (`/client`)
- React 19 + Vite + Tailwind CSS 4
- Three custom hooks manage core functionality:
  - `useWebSocket.js` - WebSocket connection with auto-reconnect
  - `useSpeechRecognition.js` - Browser Web Speech API for voice input
  - `useSpeechSynthesis.js` - Text-to-speech with voice profile selection
- `App.jsx` orchestrates the hooks and handles the conversation flow
- WebSocket URL configured via `VITE_WS_URL` env var (defaults to `ws://localhost:3001`)

### Server (`/server`)
- Express + WebSocket server
- `groqClient.js` - Streams chat completions from Groq API (Llama 3.3 70B)
- `conversationManager.js` - Manages per-client message history (max 20 messages)
- System prompt configures AI as a history expert optimized for voice responses
- Requires `GROQ_API_KEY` environment variable

### Data Flow
1. User holds voice button → speech recognition captures audio
2. On release, transcript sent via WebSocket as `user_message`
3. Server streams response from Groq, forwarding chunks as `assistant_chunk`
4. When complete, sends `assistant_done` with full text
5. Client speaks the response via speech synthesis
