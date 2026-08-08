const db = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const query = `
      SELECT id, name, email, phone, ward, password, role, created_at 
      FROM users 
      WHERE email = $1;
    `;
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, name, email, phone, ward, role, created_at 
      FROM users 
      WHERE id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async create({ name, email, phone, ward, hashedPassword, role }) {
    const query = `
      INSERT INTO users (name, email, phone, ward, password, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, name, email, phone, ward, role, created_at;
    `;
    const values = [name, email, phone, ward, hashedPassword, role];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}

module.exports = UserModel;