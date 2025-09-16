const express = require('express'); // CommonJS
const path = require('path');

const app = express();
const PORT = 3000;

// ضبط view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // تأكد من فولدر views

// Route رئيسية
app.get('/', (req, res) => {
    res.render('index'); // اسم الملف بدون .ejs
});

// مثال على مسار تسجيل الدخول (زر "توثيق")
app.get('/login', (req, res) => {
    res.send('هنا تحط عملية تسجيل الدخول/التوثيق مع ديسكورد');
});

// Callback بعد التفويض
app.post('/auth/discord/callback', express.urlencoded({ extended: true }), (req, res) => {
    const code = req.body.code;
    console.log('Discord code received:', code);
    // هنا تعالج الـ code مع Discord API
    res.send('تم استلام كود التفويض');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
