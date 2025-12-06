const nodemailer = require('nodemailer');

const sendOrderConfirmation = async (userEmail, order) => {
    
    // 1. Konfiguráció (Itt majd a saját adataidat kell megadnod .env-ből vagy beírva)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, //|| 'nemethnoel727@gmail.com', 
            pass: process.env.EMAIL_PASS //|| 'Non203027'
        }
    });

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

module.exports = sendOrderConfirmation;