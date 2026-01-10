export class ConversationManager {
  constructor(maxMessages = 20) {
    this.messages = [];
    this.maxMessages = maxMessages;
  }

  addMessage(role, content) {
    this.messages.push({ role, content });

    // Keep conversation history manageable
    // Remove oldest messages (except keep recent context)
    if (this.messages.length > this.maxMessages) {
      // Keep the last N messages
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getMessages() {
    return [...this.messages];
  }

  clear() {
    this.messages = [];
  }

  getMessageCount() {
    return this.messages.length;
  }
}
