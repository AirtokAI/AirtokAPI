
/**
 * AirTok AI API Client Example
 * 
 * This is a simple example of how to use the AirTok AI API in a JavaScript application.
 */

class AirTokAPIClient {
  constructor(apiKey, baseUrl = 'https://app.airtok.ai/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.userId = localStorage.getItem('airtok_user_id') || null;
  }

  /**
   * Check the health of the API
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('API Health check failed:', error);
      throw error;
    }
  }

  /**
   * Send a message to the AI and get a response
   * @param {string} groupId - The group ID
   * @param {string} message - The user's message
   * @returns {Promise<Object>} The AI's response
   */
  async sendMessage(groupId, message) {
    try {
      const response = await fetch(`${this.baseUrl}/npc/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          groupId,
          userPrompt: message,
          userId: this.userId
        })
      });
      
      const data = await response.json();
      
      // Save the userId for future requests
      if (data.userId) {
        this.userId = data.userId;
        localStorage.setItem('airtok_user_id', data.userId);
      }
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Stream a response from the AI
   * @param {string} groupId - The group ID
   * @param {string} message - The user's message
   * @param {Function} onChunk - Callback for each chunk of the response
   * @param {Function} onComplete - Callback when streaming is complete
   * @param {Function} onError - Callback for errors
   */
  streamMessage(groupId, message, onChunk, onComplete, onError) {
    const evtSource = new EventSource(
      `${this.baseUrl}/npc/chat/stream?groupId=${encodeURIComponent(groupId)}&userPrompt=${encodeURIComponent(message)}&userId=${this.userId || ''}`,
      {
        headers: {
          'x-api-key': this.apiKey
        }
      }
    );
    
    let fullResponse = '';
    
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // First message contains the userId
        if (data.userId) {
          this.userId = data.userId;
          localStorage.setItem('airtok_user_id', data.userId);
          return;
        }
        
        // Process text chunks
        fullResponse += data;
        if (onChunk) onChunk(data);
      } catch (error) {
        // If not JSON, treat as text chunk
        fullResponse += event.data;
        if (onChunk) onChunk(event.data);
      }
    };
    
    evtSource.onerror = (error) => {
      evtSource.close();
      if (onError) onError(error);
    };
    
    evtSource.addEventListener('close', () => {
      evtSource.close();
      if (onComplete) onComplete(fullResponse);
    });
    
    // Return a function to manually close the stream
    return () => evtSource.close();
  }
}

// Example usage:
/*
const client = new AirTokAPIClient('YOUR_API_KEY');

// Regular chat example
async function sendMessage() {
  try {
    const response = await client.sendMessage('-1002212916980', 'Hello AI!');
    console.log('AI response:', response.response);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Streaming chat example
function streamMessage() {
  const closeStream = client.streamMessage(
    '-1002212916980',
    'Tell me a story',
    (chunk) => {
      console.log('Received chunk:', chunk);
      // Append chunk to UI
    },
    (fullResponse) => {
      console.log('Full response:', fullResponse);
      // Update UI with complete response
    },
    (error) => {
      console.error('Stream error:', error);
    }
  );
  
  // To stop streaming early:
  // closeStream();
}
*/
