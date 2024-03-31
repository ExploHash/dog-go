import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";

import { migrations } from "../../migrations";

const instance = SQLite.openDatabase("doggooo.db");

export class DatabaseService {
  static async runQuery(
    query: string,
    args: any[] = undefined,
  ): Promise<SQLite.SQLResultSet> {
    return new Promise((resolve, reject) => {
      instance.transaction((tx) => {
        tx.executeSql(
          query,
          args,
          (_, results) => {
            resolve(results);
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      });
    });
  }

  static async initializeDatabase() {
    // Get current migration index
    const migrationIndex =
      +(await AsyncStorage.getItem("migrationIndex")) || -1;

    if (migrationIndex < migrations.length - 1) {
      console.log(
        `Running ${migrations.length - migrationIndex - 1} migrations`,
      );
    } else {
      console.log("Database is up to date");
      return;
    }

    // Run migrations
    await instance.transactionAsync(async (tx) => {
      for (let i = migrationIndex + 1; i < migrations.length; i++) {
        console.log(`Running migration ${i + 1}/${migrations.length}`);
        await tx.executeSqlAsync(migrations[i]);
        await AsyncStorage.setItem("migrationIndex", i.toString());
      }
    });
  }
}
