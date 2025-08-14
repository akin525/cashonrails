// ollamaApi.ts

interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    prompt_eval_duration?: number;
    eval_duration?: number;
  }
  
  interface GenerateOptions {
    model?: string;
    prompt: string;
    context?: number[];
    stream?: boolean;
    template?: string;
    system?: string;
    temperature?: number;
    top_p?: number;
    top_k?: number;
  }
  
  export class OllamaAPI {
    private baseUrl: string;
    private defaultModel: string;
  
    constructor(baseUrl = process.env.NEXT_PUBLIC_AI_BASE_URL, defaultModel = 'llama3.2') {
      this.baseUrl = baseUrl ?? "";
      this.defaultModel = defaultModel;
    }
  
    async generateCompletion({
      model = this.defaultModel,
      prompt,
      context,
      stream = false,
      template,
      system,
      temperature = 0.7,
      top_p = 0.9,
      top_k = 40
    }: GenerateOptions): Promise<OllamaResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            prompt,
            context,
            stream,
            template,
            system,
            options: {
              temperature,
              top_p,
              top_k,
            }
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("data", data)
        return data;
      } catch (error) {
        console.error('Error calling Ollama API:', error);
        throw error;
      }
    }
  
    async streamCompletion(options: GenerateOptions): Promise<ReadableStream<OllamaResponse>> {
      try {
        const response = await fetch(`${this.baseUrl}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...options,
            stream: true,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        if (!response.body) {
          throw new Error('Response body is null');
        }
  
        return response.body as unknown as ReadableStream<OllamaResponse>;
      } catch (error) {
        console.error('Error streaming from Ollama API:', error);
        throw error;
      }
    }
  
    // Helper method for text completion suggestions
    async getSuggestion(currentText: string): Promise<string> {
      try {
        const response = await this.generateCompletion({
          prompt: currentText,
          temperature: 0.3, // Lower temperature for more focused suggestions
          top_p: 0.1, // More deterministic
          system: "You are a helpful writing assistant. Complete the user's text naturally."
        });
        console.log("response", response)
        return response.response;
      } catch (error) {
        console.error('Error getting suggestion:', error);
        return '';
      }
    }
  }
  
  // Example usage:
  const ollama = new OllamaAPI();
  
  // For single completion:
  async function getCompletion(text: string) {
    try {
      const completion = await ollama.generateCompletion({
        prompt: text,
        system: "You are a helpful writing assistant."
      });
      return completion.response;
    } catch (error) {
      console.error('Error:', error);
      return '';
    }
  }
  
  // For streaming completion:
  async function streamCompletion(text: string) {
    try {
      const stream = await ollama.streamCompletion({
        prompt: text,
        system: "You are a helpful writing assistant."
      });
  
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log('Received chunk:', value.response);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // For quick suggestions:
  async function getSuggestion(currentText: string) {
    return await ollama.getSuggestion(currentText);
  }