export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Meme API",
      version: "1.0.0",
      description: "API pour les memes",
    },
    components: {
      schemas: {
        MemeDto: {
          type: "object",
          required: ["context", "user_prompt"],
          properties: {
            context: {
              type: "string",
              description: "Context du meme",
            },
            user_prompt: {
              type: "string",
              description: "Prompt de l'utilisateur",
            },
            temperature: {
              type: "number",
              description: "Température de l'image",
              default: 0.7,
            },
          },
        },
        updateMemeDto: {
          type: "object",
          required: ["base_image", "user_prompt"],
          properties: {
            base_image: {
              type: "string",
              description: "Image de base du meme en base64",
            },
            context: {
              type: "string",
              description: "Context du meme",
            },
            user_prompt: {
              type: "string",
              description: "Prompt de l'utilisateur",
            },
            temperature: {
              type: "number",
              description: "Température de l'image",
              default: 0.7,
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes.js", "./src/dto/*.js"],
};