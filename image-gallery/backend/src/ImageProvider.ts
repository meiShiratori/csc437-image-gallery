import { MongoClient, Collection, ObjectId, UpdateFilter } from "mongodb";

interface IUser {
  username: string;
}

interface IImageDocument {
  _id: ObjectId;
  name: string;
  src: string;
  authorId: string;
}

interface IApiImageData {
  title: string;
  url: string;
  author: {
    username: string;
  };
}

export class ImageProvider {
  private imagesCollection: Collection<IImageDocument>;
  private usersCollection: Collection<IUser>;

  constructor(private readonly mongoClient: MongoClient) {
    const db = this.mongoClient.db(process.env.DB_NAME);
    const imageColl = process.env.IMAGES_COLLECTION_NAME;
    const userColl = process.env.USERS_COLLECTION_NAME;

    if (!imageColl || !userColl) throw new Error("Missing collection names");

    this.imagesCollection = db.collection<IImageDocument>(imageColl);
    this.usersCollection = db.collection<IUser>(userColl);
  }

  async getImages(filters: { author?: string }): Promise<IApiImageData[]> {
    const query: Partial<IImageDocument> = {};
    if (filters.author) {
      query.authorId = filters.author;
    }

    const images = await this.imagesCollection.find(query).toArray();

    const authorUsernames = [...new Set(images.map((img) => img.authorId))];
    const users = await this.usersCollection
      .find({ username: { $in: authorUsernames } })
      .toArray();

    const userMap = new Map(users.map((u) => [u.username, u]));

    return images.map((img) => ({
      title: img.name,
      url: img.src,
      author: {
        username: userMap.get(img.authorId)?.username ?? "unknown"
      }
    }));
  }

  async updateImage(id: string, update: Partial<IImageDocument>) {
    const filter = { _id: new ObjectId(id) };
    const mongoUpdate: UpdateFilter<IImageDocument> = { $set: update };
    return this.imagesCollection.updateOne(filter, mongoUpdate);
  }
}
