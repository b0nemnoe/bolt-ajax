// bolt-backend/makeAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// ÍRD ÁT ARRA AZ EMAILRE, AMIVEL REGISZTRÁLTÁL!
const TARGET_EMAIL = "nemethnoel727@gmail.com"; 

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
      console.log('MongoDB csatlakozva...');
      
      const user = await User.findOne({ email: TARGET_EMAIL });
      if (!user) {
          console.log('Nem találtam ilyen felhasználót!');
          process.exit();
      }

      user.isAdmin = true;
      await user.save();
      
      console.log(`SIKER! ${TARGET_EMAIL} mostantól ADMIN.`);
      process.exit();
  })
  .catch(err => {
      console.error(err);
      process.exit(1);
  });