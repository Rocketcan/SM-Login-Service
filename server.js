require('dotenv').config();
const path = require('path');
// ...existing code...

// Serve privacy policy for OAuth providers (if needed)
// (Uncomment if you want to serve a local privacy.html file)
// app.get('/privacy-policy', (req, res) => {
//     res.sendFile(path.join(__dirname, 'privacy.html'));
// });
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { connectDB, getDB } = require('./db');


const app = express();
const PORT = process.env.PORT || 3001;

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Replace with your actual client IDs and secrets
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});



passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    const user = {
        providerId: profile.id,
        displayName: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        provider: 'google'
    };
    try {
        const db = getDB();
        const users = db.collection('users');
        // Upsert user by providerId and provider
        await users.updateOne(
            { providerId: user.providerId, provider: user.provider },
            { $set: user },
            { upsert: true }
        );
    } catch (err) {
        console.error('Error saving user to DB:', err);
    }
    return done(null, user);
}));


passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID,
    clientSecret: LINKEDIN_CLIENT_SECRET,
    callbackURL: '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
    const user = {
        providerId: profile.id,
        displayName: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        provider: 'linkedin'
    };
    try {
        const db = getDB();
        const users = db.collection('users');
        await users.updateOne(
            { providerId: user.providerId, provider: user.provider },
            { $set: user },
            { upsert: true }
        );
    } catch (err) {
        console.error('Error saving user to DB:', err);
    }
    return done(null, user);
}));

// Endpoint to get current user info from the database (if authenticated)
app.get('/api/user', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const db = getDB();
        const users = db.collection('users');
        const user = await users.findOne({ providerId: req.user.providerId, provider: req.user.provider });
        if (!user) {
            return res.status(404).send('<h2>User not found in database</h2>');
        }
        res.send(`
            <html>
            <head>
                <title>User Info</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #f7f7f7; color: #222; padding: 2rem; }
                    .user-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 2rem; max-width: 400px; margin: 2rem auto; }
                    h2 { color: #1976d2; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="user-card">
                    <h2>User Info (from Database)</h2>
                    <p><span class="label">Display Name:</span> ${user.displayName || 'N/A'}</p>
                    <p><span class="label">Provider:</span> ${user.provider}</p>
                    <p><span class="label">Provider ID:</span> ${user.providerId}</p>
                    <p style="color: #888; font-size: 0.9em;">(Data loaded from database)</p>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send(`<h2>Database error</h2><pre>${err.message}</pre>`);
    }
});


app.get('/', (req, res) => {
    res.send('Hello World from Express and MongoDB!');
});

// Google OAuth routes

app.get('/auth/google', (req, res, next) => {
    try {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    } catch (err) {
        console.error('Error in /auth/google:', err);
        res.status(500).send('<h2>Internal Server Error during Google authentication.</h2>');
    }
});


app.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/' }, (err, user, info) => {
        if (err) {
            console.error('Google callback error:', err);
            return res.status(500).send('<h2>Google authentication failed.</h2>');
        }
        if (!user) {
            return res.redirect('/');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error after Google callback:', err);
                return res.status(500).send('<h2>Login failed after Google authentication.</h2>');
            }
            res.redirect('/success');
        });
    })(req, res, next);
});

// LinkedIn OAuth routes

app.get('/auth/linkedin', (req, res, next) => {
    try {
        passport.authenticate('linkedin')(req, res, next);
    } catch (err) {
        console.error('Error in /auth/linkedin:', err);
        res.status(500).send('<h2>Internal Server Error during LinkedIn authentication.</h2>');
    }
});


app.get('/auth/linkedin/callback', (req, res, next) => {
    passport.authenticate('linkedin', { failureRedirect: '/' }, (err, user, info) => {
        if (err) {
            console.error('LinkedIn callback error:', err);
            return res.status(500).send('<h2>LinkedIn authentication failed.</h2>');
        }
        if (!user) {
            return res.redirect('/');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error after LinkedIn callback:', err);
                return res.status(500).send('<h2>Login failed after LinkedIn authentication.</h2>');
            }
            res.redirect('/success');
        });
    })(req, res, next);
});

// Success page for authenticated users
app.get('/success', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`
            <html>
            <head>
                <title>Authentication Successful</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #f7f7f7; color: #222; padding: 2rem; }
                    .success-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 2rem; max-width: 400px; margin: 2rem auto; text-align: center; }
                    h1 { color: #1976d2; }
                    .info-btn { margin-top: 1.5rem; padding: 0.75rem 1.5rem; font-size: 1rem; border: none; border-radius: 5px; background: #1976d2; color: #fff; cursor: pointer; transition: background 0.2s; }
                    .info-btn:hover { background: #145db2; }
                </style>
            </head>
            <body>
                <div class="success-card">
                    <h1>Authentication Successful</h1>
                    <p>Welcome, ${req.user.displayName || 'User'}!</p>
                    <p>Provider: ${req.user.provider}</p>
                    <p style="margin-top:2rem;">If you would like to see your user information, click below:</p>
                    <button class="info-btn" onclick="window.location.href='/api/user'">View User Information</button>
                </div>
            </body>
            </html>
        `);
    } else {
        res.redirect('/');
    }
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});