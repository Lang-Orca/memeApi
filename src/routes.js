import { Router } from "express";
import { MemeDto, updateMemeDto } from "./dto/memedto.js";
import { createMeme, updateMeme } from "./service/meme.service.js";
import path from "path";

const router = Router();

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
    res.sendFile(path.resolve("public/index.html"));
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
router.post("/api/new", async (req, res) => {
    const body = MemeDto.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ error: body.error });
    }
    const validateBody = body.data;

    //ici on fait la fonction pour traiter le meme 
    const result = await createMeme(validateBody);

    return res.status(200).json({ result : result });
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