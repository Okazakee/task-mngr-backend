import express, { Request, Response } from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import { authenticateJWT } from '../services/authMiddleware';
import { uploadPropic, changeUsername, checkUser, changeEmail, changePassword } from '../models/usersModel';

const storage = multer.memoryStorage(); // Store the file in memory as a buffer
const upload = multer({ storage });

const router = express.Router();

router.post('/upload-propic', authenticateJWT, upload.single('propic'), async (req: Request, res: Response) => {
  const { userId } = req.body;
  const profilePicBuffer = req.file?.buffer; // The image file is available in `req.file.buffer`

  if (!profilePicBuffer) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Store the image (BLOB) in the database
    await uploadPropic(profilePicBuffer, userId);

    res.status(200).json({ message: 'Profile picture uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading profile picture' });
  }
});

// change username
router.post('/changeUsername', authenticateJWT, async (req: Request, res: Response) => {
  const { username, newUsername } = req.body;

  const user = await checkUser(username);

  if (user.length === 0) {
    return res.status(400).json({ message: 'Missing user' });
  }

  const userID = user[0].id;

  if (!newUsername) {
    return res.status(400).json({ message: 'Missing new username' });
  }

  if (username === newUsername) {
    return res.status(400).json({ message: 'No username change needed' });
  }

  try {
    await changeUsername(userID, newUsername);

    res.status(200).json({ message: 'Username changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error changing username' });
  }
});

// change email
router.post('/changeEmail', authenticateJWT, async (req: Request, res: Response) => {
  const { username, newEmail } = req.body;

  const user = await checkUser(username);

  if (user.length === 0) {
    return res.status(400).json({ message: 'Missing user' });
  }

  if (!newEmail) {
    return res.status(400).json({ message: 'Missing new email' });
  }

  const userID = user[0].id;

  try {
    await changeEmail(userID, newEmail);

    res.status(200).json({ message: 'Email changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error changing Email' });
  }
});

// change pw
router.post('/changePassword', authenticateJWT, async (req: Request, res: Response) => {
  const { username, newPassword } = req.body;

  const user = await checkUser(username);

  if (user.length === 0) {
    return res.status(400).json({ message: 'Missing user' });
  }

  if (!newPassword) {
    return res.status(400).json({ message: 'Missing new password' });
  }

  const userID = user[0].id;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await changePassword(userID, hashedPassword);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error changing password' });
  }
});

export default router;