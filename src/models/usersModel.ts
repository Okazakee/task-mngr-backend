import { openDb } from '../db/database';

export async function checkUser(username: string) {
  const db = await openDb();

  return await db.all(`
    SELECT * FROM users WHERE username = ?
  `, username)
}

export async function uploadPropic(profilePicBuffer: Buffer, userId: number) {
  const db = await openDb();

  return await db.run(`
    UPDATE users
    SET propic = ?
    WHERE id = ?
  `, [profilePicBuffer, userId]);
}

export async function changeUsername(userId: number, newUsername: string) {
  const db = await openDb();

  return await db.run(`
    UPDATE users
    SET username = ?
    WHERE id = ?
  `, [newUsername, userId]);
}

export async function changeEmail(userId: number, newEmail: string) {
  const db = await openDb();

  return await db.run(`
    UPDATE users
    SET email = ?
    WHERE id = ?
  `, [newEmail, userId]);
}

export async function changePassword(userId: number, newPassword: string) {
  const db = await openDb();

  return await db.run(`
    UPDATE users
    SET password = ?
    WHERE id = ?
  `, [newPassword, userId]);
}
