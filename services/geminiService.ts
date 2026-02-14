import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getExplanation = async (topic: string, context: string): Promise<string> => {
  if (!apiKey) {
    return "I'm ready to help, but I need an API key to think! (Check setup)";
  }

  try {
    const prompt = `
      You are a friendly, enthusiastic math tutor for children in grades 1-3.
      Topic: ${topic}
      Current Situation: ${context}
      
      Explain the concept simply, give a hint, or encourage the student. 
      Keep it short (under 50 words). Use emojis! 
      Do not give the direct answer if it's a problem, just a nudge.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Keep trying! You're doing great!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! My brain is taking a nap. Try again later!";
  }
};

export const generateChallenge = async (topic: string): Promise<string> => {
    if (!apiKey) return "Find 3 red items!";
    
    try {
        const prompt = `
          Generate a fun, single-sentence challenge for a 2nd grader learning about ${topic}.
          Make it actionable in a simulation context if possible.
        `;
    
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
    
        return response.text || "Explore the tools and see what you can find!";
      } catch (error) {
        return "Explore the tools and see what you can find!";
      }
}
