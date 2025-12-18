
import { GoogleGenAI, Type } from "@google/genai";
import { AIServiceTask } from "../types";

export const geminiService = {
  async processNote(task: AIServiceTask, content: string, title?: string, imageData?: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: this.getPrompt(task, content, title, imageData),
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    const response = await model;
    return response.text;
  },

  getPrompt(task: AIServiceTask, content: string, title?: string, imageData?: string): any {
    switch (task) {
      case AIServiceTask.SUMMARIZE:
        return `Summarize the following note concisely while keeping key information: \n\nTitle: ${title}\nContent: ${content}`;
      case AIServiceTask.REFINE:
        return `Rewrite and refine this note to be more professional, clear, and grammatically correct. Keep the original intent: \n\n${content}`;
      case AIServiceTask.TAGS:
        return `Suggest 3-5 relevant short tags for this note based on its content. Return ONLY a comma-separated list of words: \n\nTitle: ${title}\nContent: ${content}`;
      case AIServiceTask.CONTINUE:
        return `Based on this note, write a natural continuation or next steps: \n\nTitle: ${title}\nContent: ${content}`;
      case AIServiceTask.OCR:
        return {
          parts: [
            { inlineData: { data: imageData!.split(',')[1], mimeType: 'image/jpeg' } },
            { text: "Transcribe all visible text from this image accurately. If it's a note or handwriting, keep the structure." }
          ]
        };
      default:
        return content;
    }
  }
};
