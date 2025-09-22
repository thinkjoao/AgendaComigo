const bcrypt = require('bcrypt');
const db = require('./database');

const saltRounds = 10;

// Usuário inicial (barbeiro/admin)
const user = {
  name: 'Admin Barbeiro',
  email: 'admin@barbershop.com',
  password: '123456',
  role: 'barber'
};

async function createInitialUser() {
  try {
    // Criptografa a senha
    const hash = await bcrypt.hash(user.password, saltRounds);

    // Insere no banco, garantindo que não haja duplicados
    db.run(
      `INSERT INTO users (name, email, password_hash, role) 
       SELECT ?, ?, ?, ? 
       WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = ?)`,
      [user.name, user.email, hash, user.role, user.email],
      function (err) {
        if (err) {
          console.error('❌ Erro ao inserir usuário:', err.message);
        } else if (this.changes === 0) {
          console.log('ℹ️  Usuário já existe no banco.');
        } else {
          console.log(`✅ Usuário criado com sucesso!`);
          console.log(`📧 Email: ${user.email}`);
          console.log(`🔑 Senha: ${user.password}`);
          console.log(`👤 ID: ${this.lastID}`);
        }

        db.close();
      }
    );
  } catch (error) {
    console.error('❌ Erro ao gerar hash da senha:', error);
    db.close();
  }
}

// Executar
createInitialUser();