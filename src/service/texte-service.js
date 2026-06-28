import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generatePrompt = async (context, userPrompt, baseImage = null) => {
  let instruction = `Tu es un expert en génération de prompts pour stickers/memes.
Contexte : ${context}
Demande : ${userPrompt}
Génère un prompt détaillé en anglais pour une IA de génération d'image,
décrivant le visuel (style, couleurs, sujet, fond). Réponds UNIQUEMENT par le prompt, rien d'autre.`;

  if (baseImage) {
    instruction = `Tu es un expert en génération de prompts pour stickers/memes.
Contexte : ${context}
Demande : ${userPrompt}
image de base : ${baseImage}
L'utilisateur veut modifier l'image de base donnée.
Génère un prompt détaillé en anglais pour une IA d'édition de cet image,
décrivant comment modifier l'image de base. Réponds UNIQUEMENT par le prompt, rien d'autre.`;
  }

  const interaction = await ai.interactions.create({
    model: "gemini-flash-latest",
    input: instruction,
  });

  return interaction.output_text.trim();
};

export { generatePrompt };