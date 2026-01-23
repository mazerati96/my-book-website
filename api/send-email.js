import { Resend } from 'resend';

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get form data
        const { name, email, subject, message } = req.body;  // ✅ ADD subject

        // Validate inputs
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                received: { name: !!name, email: !!email, subject: !!subject, message: !!message }
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }

        // Check if environment variables are set
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not set');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: Missing API key'
            });
        }

        if (!process.env.RECIPIENT_EMAIL) {
            console.error('RECIPIENT_EMAIL is not set');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: Missing recipient email'
            });
        }

        // Initialize Resend with API key
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send email notification to you
        const emailData = await resend.emails.send({
            from: 'The Measure of Souls <onboarding@resend.dev>',
            to: [process.env.RECIPIENT_EMAIL],
            subject: `📬 [${subject}] Message from ${name}`,  // ✅ NEW - includes the form subject
            replyTo: email, // This lets you hit "Reply" to respond directly to the sender
            html: `
                <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff;">
                    <h2 style="color: #ff0033; border-bottom: 2px solid #ffffff; padding-bottom: 10px;">
                        📢 New Contact Form Submission
                    </h2>
                    
                    <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; border: 1px solid #ffffff;">
                        <p><strong style="color: #ffffff;">From:</strong> ${name}</p>
                        <p><strong style="color: #ffffff;">Email:</strong> <a href="mailto:${email}" style="color: #00d4ff;">${email}</a></p>
                        <p><strong style="color: #ffffff;">Subject:</strong> <span style="color: #00ff88;">${subject}</span></p>  
                        <p><strong style="color: #ffffff;">Sent:</strong> ${new Date().toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                dateStyle: 'full',
                timeStyle: 'long'
            })}</p>
                    </div>
                    
                    <div style="background-color: #1a1a1a; padding: 20px; margin: 20px 0; border: 1px solid #ffffff;">
                        <p style="color: #ffffff;"><strong>Message:</strong></p>
                        <p style="color: #cccccc; line-height: 1.6; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #111111; border-left: 4px solid #ff0033;">
                        <p style="color: #cccccc; font-size: 12px; margin: 0;">
                            💡 Reply directly to this email to respond to ${name}
                        </p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 10px; text-align: center; border-top: 1px solid #ffffff;">
                        <p style="color: #666666; font-size: 10px; margin: 0;">
                            Sent from The Measure of Souls website contact form
                        </p>
                    </div>
                </div>
            `
        });

        console.log('✅ Email sent successfully:', emailData);

        // Success response
        return res.status(200).json({
            success: true,
            messageId: emailData.id,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('❌ Email sending error:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to send email';
        if (error.message.includes('API key')) {
            errorMessage = 'Email service configuration error';
        } else if (error.message.includes('rate limit')) {
            errorMessage = 'Too many requests. Please try again later.';
        }

        return res.status(500).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}