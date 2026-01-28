// api/auth/verify-firebase.js
// This is a helper function to verify Firebase tokens in your Vercel API

import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

export async function verifyFirebaseToken(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);

    try {
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Get user data from Firebase Database
        const userSnapshot = await admin.database()
            .ref(`users/${decodedToken.uid}`)
            .once('value');

        const userData = userSnapshot.val();

        if (!userData) {
            return null;
        }

        return {
            uid: decodedToken.uid,
            username: userData.username,
            email: userData.email,
            isAdmin: userData.isAdmin || false
        };
    } catch (error) {
        console.error('Firebase token verification error:', error);
        return null;
    }
}

// Updated login.js - Now accepts Firebase tokens too
// api/auth/login.js
import { createClient } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from './verify-firebase.js';

const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if this is a Firebase token login
    const firebaseUser = await verifyFirebaseToken(req);

    if (firebaseUser) {
        // User authenticated via Firebase
        // Only allow if admin
        if (!firebaseUser.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Create session token for blog system
        const token = jwt.sign(
            {
                username: firebaseUser.username,
                id: firebaseUser.uid,
                isAdmin: true,
                authType: 'firebase'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            token,
            user: {
                username: firebaseUser.username,
                id: firebaseUser.uid,
                isAdmin: true
            }
        });
    }

    // Original username/password login (legacy)
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Get user from database
        const user = await kv.get(`user:${username}`);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                username: user.username,
                id: user.id,
                authType: 'legacy'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            token,
            user: {
                username: user.username,
                id: user.id
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Updated create.js - Accepts Firebase auth
// api/posts/create.js
import { createClient } from '@vercel/kv';
import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from '../auth/verify-firebase.js';

const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Verify JWT token (legacy)
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Try Firebase auth first, then fall back to JWT
    let user = await verifyFirebaseToken(req);

    if (!user) {
        user = verifyToken(req);
    }

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only admins can create posts
    if (user.isAdmin === false) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { title, content, category, status, images } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content required' });
        }

        // Generate post ID
        const postId = `post-${Date.now()}`;

        // Create post object
        const post = {
            id: postId,
            title,
            content,
            category: category || 'Uncategorized',
            status: status || 'draft',
            images: images || [],
            author: user.username,
            authorId: user.id || user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save post
        await kv.set(postId, post);

        // Add to posts list
        const postsList = await kv.get('posts:list') || [];
        postsList.unshift(postId);
        await kv.set('posts:list', postsList);

        return res.status(200).json({
            success: true,
            post
        });

    } catch (error) {
        console.error('Create post error:', error);
        return res.status(500).json({ error: 'Failed to create post' });
    }
}