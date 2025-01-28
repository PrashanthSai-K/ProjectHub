const sequelize = require("../../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class UserService {
    async getAllUsers() {
        try {
            const users = await sequelize.query('SELECT id, name, email, role FROM users', { type: sequelize.QueryTypes.SELECT });
            return users;
        } catch (error) {
            throw new Error(`Could not fetch users: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            const user = await sequelize.query(
                'SELECT id, name, email, role FROM users WHERE id = ?',
                {
                    replacements: [id],
                    type: sequelize.QueryTypes.SELECT,
                }
            );
            return user[0];
        } catch (error) {
            throw new Error(`Could not fetch user: ${error.message}`);
        }
    }

    async createUser(userData) {
        let insertedUser;
        const transaction = await sequelize.transaction();
        try {
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const [result] = await sequelize.query(
                'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
                {
                    replacements: [userData.name, userData.email, userData.role, hashedPassword],
                    transaction,
                }
            );
            const userId = result;
            [insertedUser] = await sequelize.query(
                'SELECT id, name, email, role FROM users WHERE id = ?',
                {
                    replacements: [userId],
                    type: sequelize.QueryTypes.SELECT,
                    transaction,
                }
            );
            await transaction.commit();
            return insertedUser[0]

        } catch (error) {
            if (error.original) {
                if (error.original.code === "ER_DUP_ENTRY") {
                    const duplicateField =
                        error.original.sqlMessage.match(/for key '(.*?)'/)[1];
                    if (duplicateField.includes("email")) {
                        // Changed to throw a more structured error
                        await transaction.rollback();
                        throw { message: 'Email already exists', field: 'email' };
                    }
                }
            }
            await transaction.rollback();
            throw { message: `Could not create user: ${error.message}`, field: 'general' };
        }
    }

    async updateUser(id, userData) {
        let updatedUser;
        const transaction = await sequelize.transaction();
        try {
            let hashedPassword;
            if (userData.password) {
                hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            }
            const updateFields = []
            const params = []
            if (userData.name) {
                updateFields.push('name = ?');
                params.push(userData.name)
            }
            if (userData.email) {
                updateFields.push('email = ?');
                params.push(userData.email)
            }
            if (userData.role) {
                updateFields.push('role = ?');
                params.push(userData.role)
            }
            if (hashedPassword) {
                updateFields.push('password = ?');
                params.push(hashedPassword)
            }
            if (updateFields.length === 0) {
                return null;
            }
            params.push(id)
            const query = `UPDATE users SET ${updateFields.join(',')} WHERE id = ?`;
            await sequelize.query(query, { replacements: params, transaction });
            [updatedUser] = await sequelize.query(
                'SELECT id, name, email, role FROM users WHERE id = ?',
                {
                    replacements: [id],
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );
            await transaction.commit();
            return updatedUser;

        } catch (error) {
            await transaction.rollback();
            throw new Error(`Could not update user: ${error.message}`);
        }
    }

    async deleteUser(id) {
        try {
            await sequelize.query('DELETE FROM users WHERE id = ?', { replacements: [id] });
        } catch (error) {
            throw new Error(`Could not delete user: ${error.message}`);
        }
    }
}

module.exports = new UserService();