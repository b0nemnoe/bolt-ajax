const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

const sendOrderConfirmation = async (userEmail, order) => {

    const itemsList = order.items.map(item => 
        `<li>${item.name} - ${item.quantity} db - ${item.price} Ft/db</li>`
    ).join('');

    const mailOptions = {
        from: '"SuperShop Bolt" <no-reply@supershop.hu>',
        to: userEmail,
        subject: `Rendelés visszaigazolás #${order._id.toString().slice(-6)}`,
        html: `
            <h1>Köszönjük a rendelésed! 👋</h1>
            <p>A rendelésedet sikeresen rögzítettük.</p>
            
            <h3>Rendelés részletei:</h3>
            <ul>${itemsList}</ul>
            
            <h3>Végösszeg: <strong>${order.totalPrice} Ft</strong></h3>
            
            <p>Üdvözlettel,<br>A SuperShop csapata 🛒</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email elküldve ide: ${userEmail}`);
    } catch (error) {
        console.error('Hiba az email küldésekor:', error);
    }
};

const sendPasswordResetEmail = async (userEmail, token) => {
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
        from: '"SuperShop Bolt" <no-reply@supershop.hu>',
        to: userEmail,
        subject: 'Jelszó visszaállítás kérése 🔒',
        html: `
            <h1>Elfelejtetted a jelszavad?</h1>
            <p>Semmi gond! Kattints az alábbi linkre a jelszó visszaállításához:</p>
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Jelszó visszaállítása</a>
            <p>A link 1 óráig érvényes.</p>
            <p><small>Ha nem te kérted ezt a módosítást, hagyd figyelmen kívül ezt az emailt.</small></p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset email elküldve: ${userEmail}`);
    } catch (error) {
        console.error('Hiba az email küldésekor:', error);
    }
};

module.exports = { sendOrderConfirmation, sendPasswordResetEmail };