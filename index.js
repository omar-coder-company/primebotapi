const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const usersFile = path.join(__dirname, 'database/users.json');
const BOT_CLIENT_ID = '1417208420339027978'
const BOT_CLIENT_SECRET = '-2oVtUCb-0mSEiwHFD07nB81bjU6WTSe'
const REDIRECT_URI = 'https://primebotapi.vercel.app/callback';

// قراءة وكتابة users.json
function readUsers() {
    if (!fs.existsSync(usersFile)) return {};
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}
function writeUsers(data) {
    fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

// صفحة البداية مع رابط OAuth2
app.get('/', (req, res) => {
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${BOT_CLIENT_ID}&response_type=code&scope=identify+guilds.join&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    res.send(`<h1>اضغط لتسجيل</h1><a href="${oauthUrl}">تسجيل</a>`);
});

// صفحة callback بعد الموافقة
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send('❌ لم يتم إرسال الكود');

    try {
        const params = new URLSearchParams({
            client_id: BOT_CLIENT_ID,
            client_secret: BOT_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI
        });

        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenRes.data.access_token;

        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const user = userRes.data;
        const usersData = readUsers();

        if (!usersData[user.id]) {
            usersData[user.id] = { username: user.username, discriminator: user.discriminator };
            writeUsers(usersData);
            res.send(`✅ تم تسجيل المستخدم ${user.username}`);
        } else {
            res.send(`ℹ️ المستخدم ${user.username} موجود مسبقاً`);
        }
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        res.send(`❌ خطأ أثناء التسجيل: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }
});

// API صغير للبوت المحلي
app.get('/api/users', (req, res) => {
    const usersData = readUsers();
    res.json(usersData);
});

app.listen(PORT, () => console.log(`Server running on ${REDIRECT_URI.replace('/callback','')}`));
