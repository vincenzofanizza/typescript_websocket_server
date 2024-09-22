import express, { Request, Response } from 'express';
import User from '../../db/User';
import { supabase, supabaseAdmin } from '../../utils/supabase';

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req: Request, res: Response) => {
const { email, password, firstName, lastName } = req.body;

try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
    });

    if (error) throw error;

    if (data.user) {
    // Create a corresponding user in your database
    await User.create({
        supabaseId: data.user.id,
        firstName,
        lastName,
        email
    });

    res.status(201).json({
        message: 'User created successfully',
        user: data.user,
    });
    } else {
    // This case happens when email confirmation is required
    res.status(200).json({
        message: 'Signup successful. Please check your email for confirmation.',
    });
    }
} catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: 'Failed to create user' });
}
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
const { email, password } = req.body;

try {
    const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    });

    if (error) throw error;

    if (!data.user) {
    throw new Error('User not found in Supabase');
    }

    res.json({
    message: 'Login successful',
    user: data.user,
    session: data.session,
    });
} catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
}
});

export default router;
