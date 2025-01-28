const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database'); 


exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const [existingUser] = await sequelize.query(
      `SELECT * FROM users WHERE email = ?`,
      { replacements: [email] }
    );
    if (existingUser.length>0) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [newUser] = await sequelize.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING *`,
         {
            replacements: [name, email, hashedPassword, "user"]
         }
    );
      const createdUser = newUser[0];
    res.status(201).json({
        message: 'User created successfully',
      user: { id: createdUser.id, name: createdUser.name, email: createdUser.email, role: createdUser.role },
    });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const [user] = await sequelize.query(
        `SELECT * FROM users WHERE email = ?`,
        { replacements: [email] }
      );

       if (user.length === 0) {
         return res.status(400).json({ message: 'Invalid credentials' });
       }
        const selectedUser = user[0];

      // Check password
      const validPassword = await bcrypt.compare(password, selectedUser.password);
      if (!validPassword) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

    const token = jwt.sign({id:selectedUser.id, name:selectedUser.name, role:selectedUser.role}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
        message: 'Login successful',
      token,
        user: {id:selectedUser.id, name:selectedUser.name, email:selectedUser.email, role:selectedUser.role}
    });
    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).json({ message: 'Login failed', error: error.message });
  }
};