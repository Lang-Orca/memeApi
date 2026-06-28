import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generatePrompt = async (context, userPrompt) => {
  const instruction = `Tu es un expert en génération de prompts pour stickers/memes.
Contexte : ${context}
Demande : ${userPrompt}
Génère un prompt détaillé en anglais pour une IA de génération d'image,
décrivant le visuel (style, couleurs, sujet, fond). Réponds UNIQUEMENT par le prompt, rien d'autre.`;

  const interaction = await ai.interactions.create({
    model: "gemini-2.5-flash",
    input: instruction,
  });

  return interaction.output_text.trim();
};

export { generatePrompt };