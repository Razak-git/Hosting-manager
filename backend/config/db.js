const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  port: parseInt(process.env.MYSQLPORT) || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const initDatabase = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.query(`CREATE TABLE IF NOT EXISTS verification_codes (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL, code VARCHAR(6) NOT NULL, expires_at DATETIME NOT NULL, used TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await conn.query(`CREATE TABLE IF NOT EXISTS sites (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, domain VARCHAR(255) NOT NULL, name VARCHAR(255), status ENUM('online','offline','unknown') DEFAULT 'unknown', last_checked DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`);
    await conn.query(`CREATE TABLE IF NOT EXISTS files (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, filename VARCHAR(255) NOT NULL, original_name VARCHAR(255) NOT NULL, size BIGINT NOT NULL, mimetype VARCHAR(100), path VARCHAR(500) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`);
    console.log('✅ Database initialized successfully');
  } finally {
    conn.release();
  }
};

module.exports = { pool, initDatabase };
