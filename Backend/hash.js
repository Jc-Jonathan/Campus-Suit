const bcrypt = require('bcryptjs');

const password = 'Blessing@2002'; // change if needed

bcrypt.hash(password, 10).then(hash => {
  console.log('HASHED PASSWORD:', hash);
});
