import { MongoClient, Collection, UpdateFilter } from "mongodb";
import { ObjectId } from "mongodb";

interface IUser {
  _id: string;
  username: string;
}

interface IImageDocument {
  _id: ObjectId;
  name: string;
  src: string;
  authorId: string;
}

export interface IApiImageData {
  id: string;
  name: string;
  src: string;
  author: {
    id: string;
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

  async getImages(filters: { name?: string; author?: string }): Promise<IApiImageData[]> {
    const query: any = {};

    if (filters.name) {
      query.name = { $regex: filters.name, $options: "i" };
    }

    if (filters.author) {
      query.authorId = filters.author;
    }

    const images = await this.imagesCollection.find(query).toArray();

    const authorIds = [...new Set(images.map((img) => img.authorId))];
    const users = await this.usersCollection
      .find({ _id: { $in: authorIds } })
      .toArray();

    const userMap = new Map(users.map((u) => [u._id, u]));

    return images.map((img) => {
      const user = userMap.get(img.authorId);
      return {
        id: img._id.toString(),
        name: img.name,
        src: img.src,
        author: {
          id: user?._id ?? "unknown",
          username: user?.username ?? "unknown",
        },
      };
    });
  }

  async updateImage(id: string, update: Partial<IImageDocument>) {
    const filter = { _id: new ObjectId(id) };
    const mongoUpdate: UpdateFilter<IImageDocument> = { $set: update };
    return this.imagesCollection.updateOne(filter, mongoUpdate);
  }

  async createImage(image: Omit<IImageDocument, "_id">) {
return this.imagesCollection.insertOne(image as unknown as IImageDocument);

  }
}
