import type { Request, Response } from 'express';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import bcrypt from 'bcrypt';

// ============ REGISTER ============
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role, phone } = req.body;

    // 1. Validation
    if (!email || !password || !full_name || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, password, full_name, phone' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // 3. Hash password (your model already does this via hook, but we can double-check)
    // The model's beforeCreate hook will hash it automatically
    
    // 4. Create user
    const user = await User.create({
      email,
      password_hash: password,  // Will be hashed by hook
      full_name,
      role: role || 'technician',
      phone,
    });

    // 5. Generate tokens
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 6. Return response (exclude sensitive fields)
    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      created_at: user.created_at,
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ============ LOGIN ============
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // 2. Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Verify password using model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 5. Generate tokens
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 6. Return response
    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ============ REFRESH TOKEN ============
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Find user to make sure they still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens
    const payload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return res.status(200).json({
      success: true,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });

  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ============ LOGOUT ============
export const logout = async (req: Request, res: Response) => {
  // With stateless JWT, logout is handled client-side
  // (Just discard tokens on client)
  return res.status(200).json({ 
    success: true, 
    message: 'Logout successful. Discard tokens on client.' 
  });
};

// ============ GET ME ============
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk((req as any).user?.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      created_at: user.created_at,
    };
    
    return res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
