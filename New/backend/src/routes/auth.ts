import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Simple validation helper
const validateInput = (rules: { [key: string]: (value: any) => string | null }) => {
  return (req: Request, res: Response, next: () => void) => {
    const errors: string[] = [];
    
    Object.keys(rules).forEach(field => {
      const value = req.body[field];
      const error = rules[field](value);
      if (error) {
        errors.push(error);
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    next();
  };
};

// Register
router.post('/register', validateInput({
  username: (value) => {
    if (!value || typeof value !== 'string') return 'Username is required';
    if (value.trim().length < 2 || value.trim().length > 30) return 'Username must be between 2 and 30 characters';
    return null;
  },
  email: (value) => {
    if (!value || typeof value !== 'string') return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email';
    return null;
  },
  password: (value) => {
    if (!value || typeof value !== 'string') return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  }
}), async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', validateInput({
  email: (value) => {
    if (!value || typeof value !== 'string') return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email';
    return null;
  },
  password: (value) => {
    if (!value || typeof value !== 'string') return 'Password is required';
    return null;
  }
}), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update user status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    res.json({ user: user?.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
