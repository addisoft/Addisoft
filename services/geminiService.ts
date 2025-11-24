import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-types' });

export const generateQuizQuestions = async (): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate 10 trivia questions for children in Arabic. The topics must include: Vegetables (الخضر), Fruits (الفواكه), School Supplies (أدوات مدرسية), and Professions (مهن). The questions should be simple. The visualHintPrompt should be a simple English description of the object representing the correct answer (e.g., 'A red apple on a wooden table').",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "An array of exactly 4 possible answers." 
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct answer." },
              visualHintPrompt: { type: Type.STRING, description: "A short, descriptive prompt in English to generate an image of the answer." },
              category: { type: Type.STRING }
            },
            required: ["questionText", "options", "correctAnswerIndex", "visualHintPrompt", "category"]
          }
        },
        systemInstruction: "You are a fun and educational game engine for Arab children. Ensure the Arabic is correct, simple, and encouraging."
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Gemini");
    
    return JSON.parse(jsonText) as Question[];
  } catch (error) {
    console.error("Error generating questions:", error);
    // Fallback questions in case of API failure or limit
    return [
      {
        questionText: "ما هو الحيوان الذي يعطينا الحليب؟",
        options: ["البقرة", "الأسد", "العصفور", "السمكة"],
        correctAnswerIndex: 0,
        visualHintPrompt: "A cute cow in a green field",
        category: "Animals"
      },
      {
        questionText: "ما هو لون الموز؟",
        options: ["أحمر", "أصفر", "أزرق", "أسود"],
        correctAnswerIndex: 1,
        visualHintPrompt: "A bunch of ripe yellow bananas",
        category: "Fruits"
      }
    ];
  }
};

export const generateImageHint = async (prompt: string): Promise<string | null> => {
  try {
    // Using gemini-2.5-flash-image for generation as per instructions for standard image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Generate a high quality, cartoon-style, bright and colorful image for a children's game: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};