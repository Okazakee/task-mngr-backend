import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import { rateLimit } from 'express-rate-limit';
import { authenticateJWT } from './services/authMiddleware';
import { localhost, exposed } from './services/envsExports';

const app = express();

// Ensure the origins are properly defined
const allowedOrigins = [
  localhost,
  exposed
].filter(origin => origin !== undefined); // Filter out any undefined values

// global rate limit
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // limit each IP to 5 requests per windowMs
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS for preflight requests
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // Explicitly specify allowed headers
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(cookieParser());
app.use(express.json());

// Unprotected auth routes (registration, login, etc.)
app.use('/api/v1/auth', authRoutes);

// Protected routes for tasks and users
app.use('/api/v1/tasks', authenticateJWT, taskRoutes);
app.use('/api/v1/users', authenticateJWT, userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));