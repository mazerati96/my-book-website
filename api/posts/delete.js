// api/posts/delete.js
import { createClient } from '@vercel/kv';
import jwt from 'jsonwebtoken';

const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

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

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { postId } = req.body;

        if (!postId) {
            return res.status(400).json({ error: 'Post ID required' });
        }

        // Get existing post
        const existingPost = await kv.get(postId);

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Verify ownership
        if (existingPost.authorId !== user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        // Remove from posts list
        const postsList = await kv.get('posts:list') || [];
        const updatedList = postsList.filter(id => id !== postId);
        await kv.set('posts:list', updatedList);

        // Delete the post
        await kv.del(postId);

        return res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });

    } catch (error) {
        console.error('Delete post error:', error);
        return res.status(500).json({ error: 'Failed to delete post' });
    }
}