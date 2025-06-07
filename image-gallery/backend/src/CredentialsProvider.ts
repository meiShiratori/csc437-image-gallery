import { Collection, Db } from "mongodb";
import bcrypt from "bcrypt";

export class CredentialsProvider {
  private collection: Collection<{ _id: string; username: string; password: string }>;
  private usersCollection: Collection<{ _id: string; username: string }>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection(collectionName);
    this.usersCollection = db.collection("users"); // hardcoded name is fine if consistent
  }

  async registerUser(username: string, password: string): Promise<boolean> {
    const existing = await this.collection.findOne({ _id: username });
    if (existing) return false;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insert into userCreds
    await this.collection.insertOne({
      _id: username,
      username,
      password: hash
    });

    // Also insert into users
    await this.usersCollection.insertOne({
      _id: username,
      username
    });

    return true;
  }

  async verifyPassword(username: string, password: string): Promise<boolean> {
    const user = await this.collection.findOne({ _id: username });
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  }
}
