import { generatePrompt } from "./texte-service.js";
import { generateImage, editImage } from "./image.service.js";

const createMeme = async (meme) => {
  const optimizedPrompt = await generatePrompt(meme.context, meme.user_prompt);
  const images = await generateImage(optimizedPrompt);
  return { image: images[0] };
};

const updateMeme = async (meme) => {
  const editInstruction = await generatePrompt(
    meme.context ?? "modification d'image",
    meme.user_prompt,
    meme.base_image
  );
  const editedImage = await editImage(meme.base_image, editInstruction);
  return { image: editedImage };
};

export { createMeme, updateMeme };