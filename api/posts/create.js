// api/posts/create.js
import { createClient } from '@vercel/kv';
import jwt from 'jsonwebtoken';

const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Verify JWT token
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

    // Verify authentication
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
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
            status: status || 'draft', // 'draft' or 'published'
            images: images || [],
            author: user.username,
            authorId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save post
        await kv.set(postId, post);

        // Add to posts list
        const postsList = await kv.get('posts:list') || [];
        postsList.unshift(postId); // Add to beginning
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