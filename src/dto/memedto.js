import { z } from "zod";

/**
 * @typedef {object} MemeDto
 * @property {string} context - Context du meme
 * @property {string} user_prompt - Prompt de l'utilisateur
 * @property {number} temperature - Température de l'image
 */
const MemeDto = z.object({
    context: z.string().min(20),
    user_prompt: z.string().min(1),
    temperature: z.number().min(0.0).max(2.0).optional().default(0.7),
});

/**
 * @typedef {object} UpdateMemeDto
 * @property {string} base_image - Image de base du meme
 * @property {string} context - Context du meme
 * @property {string} user_prompt - Prompt de l'utilisateur
 * @property {number} temperature - Température de l'image
 */
const updateMemeDto = z.object({
    base_image: z.string().refine((val) => {
        const base64Regex = /^(data:image\/[a-zA-Z]*;base64,)?(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        return base64Regex.test(val);
    }, {
        message: "Image must be a valid base64 string",
    }),
    context: z.string().min(20).optional(),
    user_prompt: z.string().min(1),
    temperature: z.number().min(0.0).max(2.0).optional().default(0.7),
});

export { MemeDto , updateMemeDto};