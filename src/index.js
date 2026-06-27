import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "../doc/swagger.js";

const app = express();
const port = 8080;

app.use(express.json());


const spec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));

app.get("/", (req, res) => {
    res.redirect("/api-docs");
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
  console.log(`Documentation disponible sur http://localhost:${port}/api-docs`);
});
