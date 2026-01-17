// api/auth/setup.js
// RUN THIS ONCE to create your author accounts
// Then DELETE this file for security!

import { createClient } from '@vercel/kv';
import bcrypt from 'bcryptjs';

const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Create Amaro's account
        const amaroPassword = await bcrypt.hash('ChangeMe123!', 10);
        await kv.set('user:Amaro', {
            id: 'amaro-001',
            username: 'Amaro',
            passwordHash: amaroPassword,
            createdAt: new Date().toISOString()
        });

        // Create Matthew's account
        const matthewPassword = await bcrypt.hash('ChangeMe456!', 10);
        await kv.set('user:Matthew', {
            id: 'matthew-001',
            username: 'Matthew',
            passwordHash: matthewPassword,
            createdAt: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: 'Author accounts created!',
            accounts: [
                { username: 'Amaro', tempPassword: 'ChangeMe123!' },
                { username: 'Matthew', tempPassword: 'ChangeMe456!' }
            ],
            warning: 'DELETE THIS FILE NOW FOR SECURITY!'
        });

    } catch (error) {
        console.error('Setup error:', error);
        return res.status(500).json({ error: 'Setup failed' });
    }
}