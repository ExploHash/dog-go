export const migrations = [
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
  `
    ALTER TABLE User ADD COLUMN lastSpawnLocationLat INTEGER;
  `,
  `
    ALTER TABLE User ADD COLUMN lastSpawnLocationLong INTEGER;
  `,
  `
    ALTER TABLE User ADD COLUMN lastSpawnLocationTime INTEGER;
  `,
];
