import express, { RequestHandler } from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "../../shared/ValidRoutes";
import { waitDuration } from "../../shared/waitDuration";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

app.use(express.static(STATIC_DIR));
app.use(express.json());

const indexFilePath = path.resolve(STATIC_DIR, "index.html");

let imageProvider: ImageProvider | null = null;

connectMongo()
  .connect()
  .then((client) => {
    console.log("Connected to MongoDB");
    imageProvider = new ImageProvider(client);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/api/hello", (_req, res) => {
  res.send("Hello world");
});

const getImagesHandler: RequestHandler = async (req, res) => {
  await waitDuration(1000);

  if (!imageProvider) {
    res.status(503).json({ error: "Database not ready" });
    return;
  }

  try {
    const author = req.query.author as string | undefined;
    const images = await imageProvider.getImages({ author });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

const updateImageHandler: RequestHandler = async (req, res) => {
  if (!imageProvider) {
    res.status(503).json({ error: "Database not ready" });
    return;
  }

  try {
    const id = req.params.id;
    const update = req.body;
    const result = await imageProvider.updateImage(id, update);
    if (result.modifiedCount > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: "Image not found or not modified" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update image" });
  }
};

app.get("/api/images", getImagesHandler);
app.put("/api/images/:id", updateImageHandler);

for (const route of Object.values(ValidRoutes)) {
  app.get(route, (_req, res) => {
    res.sendFile(indexFilePath);
  });
}

app.get("/images/:id", (_req, res) => {
  res.sendFile(indexFilePath);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
