const generateImage = async (prompt, options = {}) => {
  const count = options.count ?? 1;
  const images = [];

  for (let i = 0; i < count; i++) {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HF: ${response.status} ${await response.text()}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    images.push(base64);
  }

  return images;
};

const editImage = async (base64Image, prompt) => {
  const response = await fetch(
    "https://router.huggingface.co/fal-ai/fal-ai/flux-kontext/dev",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        image_url: `data:image/png;base64,${base64Image}`,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur HF edit: ${response.status} ${await response.text()}`);
  }

  const result = await response.json();
  // fal-ai renvoie une URL d'image, on la télécharge et on la convertit en Base64
  const imageUrl = result.images?.[0]?.url || result.image?.url;
  const imgResponse = await fetch(imageUrl);
  const arrayBuffer = await imgResponse.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
};
export { generateImage, editImage };