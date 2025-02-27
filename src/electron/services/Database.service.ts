import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

let dbInstance: DatabaseType | null = null;

const connect = (): DatabaseType => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = Database(path.join(__dirname, '../../../', 'release/app', 'wault.db'), {
      verbose: console.log,
      fileMustExist: false,
    });
    return dbInstance;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
};



const closeDb = (db: DatabaseType) => {
  if (db) {
    db.close();
    if (db === dbInstance) {
      dbInstance = null;
    }
  }
}

export { connect, closeDb };