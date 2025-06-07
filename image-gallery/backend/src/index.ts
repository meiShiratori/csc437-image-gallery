import express, { RequestHandler } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { ValidRoutes } from "../../shared/ValidRoutes";
import { waitDuration } from "../../shared/waitDuration";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { CredentialsProvider } from "./CredentialsProvider";
import {
  imageMiddlewareFactory,
  handleImageFileErrors
} from "./imageUploadMiddleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const UPLOAD_DIR = process.env.IMAGE_UPLOAD_DIR || "uploads";
const indexFilePath = path.resolve(STATIC_DIR, "index.html");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(UPLOAD_DIR));

// Global state
let imageProvider: ImageProvider | null = null;
let credentialsProvider: CredentialsProvider | null = null;

// Connect to MongoDB
connectMongo()
  .connect()
  .then((client) => {
    console.log("Connected to MongoDB");
    imageProvider = new ImageProvider(client);
    credentialsProvider = new CredentialsProvider(
      client.db(process.env.DB_NAME),
      process.env.CREDS_COLLECTION_NAME!
    );
    app.locals.JWT_SECRET = process.env.JWT_SECRET!;
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Health check route
app.get("/api/hello", (_req, res) => {
  res.send("Hello world");
});

// Get images
const getImagesHandler: RequestHandler = async (req, res) => {
  await waitDuration(1000);

  if (!imageProvider) {
    res.status(503).json({ error: "Database not ready" });
    return;
  }

  try {
    const author = req.query.author as string | undefined;
    const name = req.query.name as string | undefined;
    const images = await imageProvider.getImages({ author, name });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

// Rename image
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

// Register user
const registerHandler: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Missing username or password" });
    return;
  }

  if (!credentialsProvider) {
    res.status(503).json({ error: "Database not ready" });
    return;
  }

  const success = await credentialsProvider.registerUser(username, password);
  if (!success) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const token = jwt.sign({ username }, app.locals.JWT_SECRET, { expiresIn: "1d" });
  res.status(201).json({ token });
};

// Log in user
const loginHandler: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Missing username or password" });
    return;
  }

  if (!credentialsProvider) {
    res.status(503).json({ error: "Database not ready" });
    return;
  }

  const success = await credentialsProvider.verifyPassword(username, password);
  if (!success) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const token = jwt.sign({ username }, app.locals.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
};

// Upload image
const uploadImageHandler: RequestHandler = async (req, res) => {
  if (!req.file || !req.body.name) {
    res.status(400).json({ message: "Missing image or name" });
    return;
  }

  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const { username } = jwt.verify(auth.slice(7), app.locals.JWT_SECRET) as { username: string };

    const newImage = {
      name: req.body.name,
      src: `/uploads/${req.file.filename}`,
      authorId: username
    };

    await imageProvider?.createImage(newImage);
    res.status(201).end();
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// Mount routes
app.get("/api/images", getImagesHandler);
app.patch("/api/images/:id", updateImageHandler);
app.post("/auth/register", registerHandler);
app.post("/auth/login", loginHandler);
app.post(
  "/api/images",
  imageMiddlewareFactory.single("image"),
  handleImageFileErrors,
  uploadImageHandler
);

// SPA fallback
for (const route of Object.values(ValidRoutes)) {
  app.get(route, (_req, res) => {
    res.sendFile(indexFilePath);
  });
}

app.get("/images/:id", (_req, res) => {
  res.sendFile(indexFilePath);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
