"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const ValidRoutes_1 = require("shared/ValidRoutes");
const waitDuration_1 = require("shared/waitDuration");
const connectMongo_1 = require("./connectMongo");
const ImageProvider_1 = require("./ImageProvider");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
app.use(express_1.default.static(STATIC_DIR));
const indexFilePath = path_1.default.resolve(STATIC_DIR, "index.html");
let imageProvider = null;
(0, connectMongo_1.connectMongo)()
    .connect()
    .then((client) => {
    console.log("Connected to MongoDB");
    imageProvider = new ImageProvider_1.ImageProvider(client);
})
    .catch((err) => {
    console.error("MongoDB connection error:", err);
});
app.get("/api/hello", (_req, res) => {
    res.send("Hello world");
});
app.get("/api/images", async (_req, res) => {
    await (0, waitDuration_1.waitDuration)(1000);
    if (!imageProvider) {
        return res.status(503).json({ error: "Database not ready" });
    }
    try {
        const images = await imageProvider.getAllImages();
        res.json(images);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch images" });
    }
});
for (const route of Object.values(ValidRoutes_1.ValidRoutes)) {
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
