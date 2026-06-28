import { Router } from "express";
import multer from "multer";
import { MemeDto, updateMemeDto } from "./dto/memedto.js";
import { createMeme, updateMeme } from "./service/meme.service.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * /:  
 *   get:
 *     summary: Retourne un message de bienvenue
 *     description: Retourne un message de bienvenue
 *     responses:
 *       200:
 *         description: Message de bienvenue
 */
router.get("/", (req, res) => {
    res.send("Hello World!");
});


    
/**
 * @swagger
 * /api/new:
 *   post:
 *     summary: Crée un nouveau meme
 *     description: Crée un nouveau meme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemeDto'
 *     responses:
 *       200:
 *         description: Meme créé avec succès
 */
router.post("/api/new", upload.single("audio"), async (req, res) => {
    if (req.file) {
        console.log("Audio file uploaded:", req.file);
        
        // Extract parameters from form-data fields (sent as strings)
        const { context, user_prompt, temperature } = req.body;
        
        // Validate inputs - provide fallbacks if missing for voice notes
        const parsed = MemeDto.safeParse({
            context: context || "Voice note uploaded by user.",
            user_prompt: user_prompt || "Funny audio prompt",
            temperature: temperature ? parseFloat(temperature) : 0.7,
        });

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }

        const result = await createMeme({
            ...parsed.data,
            audioFile: req.file.path,
        });

        return res.status(200).json({ result: result });
    } else {
        // Standard JSON request
        const body = MemeDto.safeParse(req.body);
        if (!body.success) {
            return res.status(400).json({ error: body.error });
        }
        const validateBody = body.data;

        const result = await createMeme(validateBody);

        return res.status(200).json({ result: result });
    }
});

/**
 * @swagger
 * /update:
 *   post:
 *     summary: Met à jour un meme
 *     description: Met à jour un meme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateMemeDto'
 *     responses:
 *       200:
 *         description: Meme mis à jour avec succès
 */
router.post("/update", async (req, res) => {
    const body = updateMemeDto.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ error: body.error });
    }
    const validateBody = body.data;

    //ici on fait la fonction pour traiter le meme
    const result = await updateMeme(validateBody);

    return res.status(200).json({ result: result }); 
    
});

export default router;