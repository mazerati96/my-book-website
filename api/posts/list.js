// api/posts/list.js
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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = verifyToken(req);
        const { status } = req.query; // Filter by status

        // Get all post IDs
        const postIds = await kv.get('posts:list') || [];

        // Fetch all posts
        const posts = [];
        for (const postId of postIds) {
            const post = await kv.get(postId);
            if (post) {
                // If not authenticated, only show published posts
                if (!user && post.status !== 'published') {
                    continue;
                }

                // If status filter is provided
                if (status && post.status !== status) {
                    continue;
                }

                posts.push(post);
            }
        }

        return res.status(200).json({
            success: true,
            posts,
            total: posts.length
        });

    } catch (error) {
        console.error('List posts error:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
}