import { openDb } from './database';
import bcrypt from 'bcrypt';

async function initDb() {
  const db = await openDb();
  
  // Create tables (this is safe, IF NOT EXISTS prevents errors)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      propic BLOB
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      status TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Check if the test user already exists
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', ['user@example.com']);
  
  if (!existingUser) {
    // Only create test data if it doesn't exist
    const hashedPassword = await bcrypt.hash('123', 10);
    
    const result = await db.run(`
      INSERT INTO users (email, username, password)
      VALUES ('user@example.com', 'user', ?);
    `, [hashedPassword]);
    
    const userId = result.lastID;
    
    // Insert sample tasks only for new users
    const sampleTasks = [
      ['task1', 'done'],
      ['task2', 'on-hold'],
      ['task3', 'pending']
    ];
    
    for (const [text, status] of sampleTasks) {
      await db.run(`
        INSERT INTO tasks (text, status, user_id) 
        VALUES (?, ?, ?);
      `, [text, status, userId]);
    }
    
    console.log('Database initialized with test user and tasks');
  } else {
    console.log('Database already initialized, skipping test data creation');
  }
}

initDb().catch(console.error);