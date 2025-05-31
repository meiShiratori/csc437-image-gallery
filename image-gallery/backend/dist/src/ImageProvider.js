"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProvider = void 0;
class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const name = process.env.IMAGES_COLLECTION_NAME;
        if (!name)
            throw new Error("Missing IMAGES_COLLECTION_NAME");
        this.collection = this.mongoClient.db().collection(name);
    }
    getAllImages() {
        return this.collection.find().toArray();
    }
}
exports.ImageProvider = ImageProvider;
