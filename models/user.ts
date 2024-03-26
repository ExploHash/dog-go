import { DatabaseService } from "../services/database";

const startLevelXpAmount = 100;
const exponentialRate = 2;

export class UserModel {
  level: number;
  currentXp: number;

  static async get(): Promise<UserModel> {
    // Get the user from the database
    const items = await DatabaseService.runQuery("SELECT * FROM User");
    const user = items.rows.item(0);

    const model = new UserModel();
    model.level = user.level;
    model.currentXp = user.currentXp;

    return model;
  }

  async save() {
    // Save the user to the database with DatabaseService.instance sqllite
    await DatabaseService.runQuery(
      `UPDATE User SET level = ${this.level}, currentXp = ${this.currentXp}`,
    );
  }

  experience(amount: number) {
    const experience = this.currentXp + amount;

    if (experience >= this.experienceNeeded) {
      this.level += 1;
      this.currentXp = 0;
    } else {
      this.currentXp = experience;
    }
  }

  get experienceNeeded() {
    return startLevelXpAmount * Math.pow(this.level, exponentialRate);
  }
}
