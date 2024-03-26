import * as SQLite from "expo-sqlite";

const instance = SQLite.openDatabase("dog-go6.db", "1.1");

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
    // Check if the table journals exists
    await instance.transactionAsync(async (tx) => {
      const results = await tx.executeSqlAsync(
        'SELECT name FROM sqlite_master WHERE type="table" AND name="User"',
        [],
      );

      if (results.rows.length === 0) {
        console.log("Initializing database");
        const queries = [
          `
            CREATE TABLE User (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              level INTEGER,
              currentXp INTEGER
            );
          `,
          `
            INSERT INTO User (id, level, currentXp) VALUES (1, 1, 0);
          `,
        ];

        for (const query of queries) {
          await tx.executeSqlAsync(query, []);
        }
      }
    });
  }
}
