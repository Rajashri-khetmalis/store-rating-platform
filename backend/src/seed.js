require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const ownerPassword = await bcrypt.hash('Owner@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`
      INSERT INTO users (name,email,password_hash,address,role)
      VALUES
      ('System Administrator Demo','admin@example.com',?,'Pune, Maharashtra, India','ADMIN'),
      ('Demo Store Owner Account','owner@example.com',?,'Pune, Maharashtra, India','STORE_OWNER'),
      ('Demo Normal User Account','user@example.com',?,'Pune, Maharashtra, India','USER')
      ON DUPLICATE KEY UPDATE email=email
    `, [adminPassword, ownerPassword, userPassword]);

    const [owners] = await connection.query('SELECT id FROM users WHERE email = ?', ['owner@example.com']);
    const ownerId = owners[0].id;

    const [stores] = await connection.query('SELECT id FROM stores WHERE email = ?', ['demo-store@example.com']);
    if (!stores.length) {
      await connection.query(
        'INSERT INTO stores (name,email,address,owner_id) VALUES (?,?,?,?)',
        ['Demo Store For Evaluation', 'demo-store@example.com', 'Pune, Maharashtra, India', ownerId]
      );
    }

    await connection.commit();
    console.log('Seed complete.');
    console.log('Admin: admin@example.com / Admin@123');
    console.log('Owner: owner@example.com / Owner@123');
    console.log('User: user@example.com / User@123');
  } catch (err) {
    await connection.rollback();
    console.error(err);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();
