import * as SQLite from 'expo-sqlite';

// Open or create the database
export const getDB = async () => {
  return await SQLite.openDatabaseAsync('fieldai.db');
};

export const initDB = async () => {
  const db = await getDB();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      project_id TEXT
    );
    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      date TEXT,
      status TEXT,
      FOREIGN KEY(site_id) REFERENCES sites(id)
    );
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspection_id INTEGER,
      uri TEXT,
      timestamp TEXT,
      FOREIGN KEY(inspection_id) REFERENCES inspections(id)
    );
    CREATE TABLE IF NOT EXISTS defects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photo_id INTEGER,
      severity TEXT,
      description TEXT,
      x_coord REAL,
      y_coord REAL,
      FOREIGN KEY(photo_id) REFERENCES photos(id)
    );
  `);
  
  // Seed mock data if empty
  const countResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM sites');
  if (countResult.count === 0) {
    await db.runAsync('INSERT INTO sites (name, location, project_id) VALUES (?, ?, ?)', ['Downtown Highrise', '100 Main St', 'PRJ-001']);
    await db.runAsync('INSERT INTO sites (name, location, project_id) VALUES (?, ?, ?)', ['Substation Alpha', 'Sector 4', 'PRJ-002']);
  }
};
