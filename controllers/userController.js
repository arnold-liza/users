const getConnection = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Utility function to remove sensitive data from user objects
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

// ==========================================
// 1. REGISTER A NEW USER
// ==========================================
exports.register = async (req, res) => {
  try {
    const { full_name, address, email, password, role } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await getConnection();
    const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const now = new Date();
    const [result] = await connection.query(
      'INSERT INTO users (full_name, address, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, address || '', email, hashed, role || 'trainee', now, now]
    );

    const [userRows] = await connection.query(
      'SELECT id, full_name, address, email, role, created_at, updated_at FROM users WHERE id = ?', 
      [result.insertId]
    );
    
    res.status(201).json({ user: sanitizeUser(userRows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==========================================
// 2. USER LOGIN
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (!rows.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    res.json({ 
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message }); 
  }
};

// ==========================================
// 3. GET ALL USERS
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT id, full_name, address, email, role, created_at, updated_at FROM users');
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==========================================
// 4. GET SINGLE USER BY ID
// ==========================================
exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const connection = await getConnection();
    const [rows] = await connection.query('SELECT id, full_name, address, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    const user = rows[0];

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==========================================
// 4.1 GET CURRENT AUTHENTICATED USER
// ==========================================
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await getConnection();
    const [rows] = await connection.query(
      'SELECT id, full_name, address, email, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==========================================
// 5. UPDATE USER
// ==========================================
exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { full_name, address, email, password, role } = req.body;
    const fields = [];
    const values = [];
    
    if (full_name) { fields.push('full_name = ?'); values.push(full_name); }
    if (address) { fields.push('address = ?'); values.push(address); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (role && req.user.role === 'admin') { fields.push('role = ?'); values.push(role); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }
    
    values.push(new Date()); // updated_at
    const set = fields.length ? fields.join(', ') + ', updated_at = ?' : 'updated_at = ?';

    const connection = await getConnection();
    await connection.query(`UPDATE users SET ${set} WHERE id = ?`, [...values, id]);
    
    const [rows] = await connection.query('SELECT id, full_name, address, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    res.json({ user: sanitizeUser(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==========================================
// 6. DELETE USER
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const connection = await getConnection();
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};