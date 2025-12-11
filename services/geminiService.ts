import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Challenge, Difficulty } from "../types";

// Initialize Gemini Client
// CRITICAL: Ensure process.env.API_KEY is available in your environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const modelName = 'gemini-2.5-flash';

const challengeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING, description: "The specific C programming topic (e.g., Pointers, Structs, Macros)." },
    question: { type: Type.STRING, description: "The challenge question text." },
    codeSnippet: { type: Type.STRING, description: "A valid C code snippet relevant to the question. Use standard formatting." },
    correctAnswer: { type: Type.STRING, description: "The precise correct answer. If code, keep it short." },
    explanation: { type: Type.STRING, description: "A brief educational explanation of why the answer is correct." },
    type: { type: Type.STRING, enum: ['SHORT_ANSWER', 'MULTIPLE_CHOICE'] },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4 options if type is MULTIPLE_CHOICE. One must be the correct answer."
    }
  },
  required: ["topic", "question", "codeSnippet", "correctAnswer", "explanation", "type"]
};

export const generateChallenge = async (difficulty: Difficulty, topic?: string): Promise<Challenge> => {
  const prompt = `
    Generate a unique, single C programming challenge for a ${difficulty} level player.
    ${topic ? `Focus specifically on the topic: ${topic}.` : 'Choose a random topic from: Basic Syntax, Control Flow, Functions, Pointers, Arrays, Strings, Structs, Unions, Dynamic Memory, Bitwise Ops, Preprocessor, File I/O, Advanced Pointers, Standard Library.'}
    
    Constraints:
    - Code snippets should be valid C.
    - Questions should test understanding of output, memory layout, syntax, or potential bugs (segfaults).
    - If specific topics like "Pointers" are chosen, ensure the question involves pointer arithmetic or dereferencing.
    - Keep answers concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: challengeSchema,
        temperature: 0.8, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback in case of API failure to prevent crash
    return {
      id: 'fallback',
      topic: 'Fallback',
      question: 'What is the output of printf("%d", 10 + 20);?',
      codeSnippet: '#include <stdio.h>\n\nint main() {\n  printf("%d", 10 + 20);\n  return 0;\n}',
      correctAnswer: '30',
      explanation: 'Basic arithmetic addition.',
      type: 'SHORT_ANSWER'
    };
  }
};