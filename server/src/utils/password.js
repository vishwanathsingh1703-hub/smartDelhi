const bcrypt = require('bcrypt');

class PasswordUtils {
  static async hash(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async compare(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = PasswordUtils;