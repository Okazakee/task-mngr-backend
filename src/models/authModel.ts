import { openDb } from '../db/database';

interface User {
  username: string;
  id: number;
  email: string;
  password: string;
  propic?: Blob;
}

export async function getUsers() {
  const db = await openDb();

  const users = await db.all(
    'SELECT id, username, email FROM users'
  );

  return users;
};

export async function checkAvaliability(email: string, username: string) {
  const db = await openDb();

  const user = await db.all(
    'SELECT * FROM users WHERE email = ? OR username = ?',
    [email, username]
  );

  return user[0];
};

export async function registerUser(email: string, username: string, hashedPassword: string): Promise<User> {
  const db = await openDb();

  return await db.all(
    'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
    [email, username, hashedPassword]
  );
};

export async function loginUser(username: string): Promise<User> {
  const db = await openDb();

  const user = await db.all(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  return user[0];
};