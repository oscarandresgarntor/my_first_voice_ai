import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { streamChatCompletion } from './groqClient.js';
import { ConversationManager } from './conversationManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store conversation managers per client
const conversations = new Map();

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(7);
  console.log(`Client connected: ${clientId}`);

  // Create a conversation manager for this client
  conversations.set(clientId, new ConversationManager());

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'user_message') {
        const conversationManager = conversations.get(clientId);

        // Add user message to history
        conversationManager.addMessage('user', message.text);

        // Send acknowledgment
        ws.send(JSON.stringify({
          type: 'status',
          status: 'thinking'
        }));

        // Stream response from Groq
        let fullResponse = '';

        await streamChatCompletion(
          conversationManager.getMessages(),
          (chunk) => {
            fullResponse += chunk;
            ws.send(JSON.stringify({
              type: 'assistant_chunk',
              text: chunk,
            }));
          }
        );

        // Add assistant response to history
        conversationManager.addMessage('assistant', fullResponse);

        // Signal completion
        ws.send(JSON.stringify({
          type: 'assistant_done',
          fullText: fullResponse,
        }));
      }

      if (message.type === 'clear_history') {
        conversations.get(clientId)?.clear();
        ws.send(JSON.stringify({ type: 'history_cleared' }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message || 'An error occurred',
      }));
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    conversations.delete(clientId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Voice AI History Expert',
  }));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
});
