require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const SECRET = process.env.JWT_SECRET || 'segredo_super_secreto_para_jwt';
const saltRounds = 10;

// -----------------------
// Middleware JWT
// -----------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// -----------------------
// Rotas de Autenticação
// -----------------------
app.post('/api/register', async (req, res) => {
  const { name, email, password, role = 'barber' } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    
    db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [name, email, hash, role],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
          }
          return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
        
        res.json({ 
          success: true, 
          message: 'Usuário criado com sucesso',
          userId: this.lastID 
        });
      }
    );
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      console.error('Erro na consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          role: user.role 
        }, 
        SECRET, 
        { expiresIn: '8h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Erro na autenticação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
});

// -----------------------
// Rotas de Agendamentos
// -----------------------
app.post('/api/appointments', authenticateToken, (req, res) => {
  const { client_name, date, time, service_id, notes, client_id } = req.body;
  
  if (!client_name || !date || !time) {
    return res.status(400).json({ error: 'Nome do cliente, data e hora são obrigatórios' });
  }

  // Verificar se já existe agendamento no mesmo horário
  db.get(
    `SELECT id FROM appointments WHERE date = ? AND time = ? AND barber_id = ? AND status != 'cancelado'`,
    [date, time, req.user.id],
    (err, existing) => {
      if (err) {
        console.error('Erro ao verificar disponibilidade:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (existing) {
        return res.status(400).json({ error: 'Horário já ocupado' });
      }

      // Criar agendamento
      db.run(
        `INSERT INTO appointments (barber_id, client_id, client_name, date, time, service_id, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, client_id || null, client_name, date, time, service_id || null, notes || ''],
        function(err) {
          if (err) {
            console.error('Erro ao criar agendamento:', err);
            return res.status(500).json({ error: 'Erro ao criar agendamento' });
          }
          
          res.json({ 
            success: true, 
            message: 'Agendamento criado com sucesso',
            appointmentId: this.lastID 
          });
        }
      );
    }
  );
});

app.get('/api/appointments', authenticateToken, (req, res) => {
  const { date, status } = req.query;
  
  let query = `
    SELECT a.*, s.name as service_name, s.price as service_price, c.phone as client_phone
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN clients c ON a.client_id = c.id
    WHERE a.barber_id = ?
  `;
  const params = [req.user.id];

  if (date) {
    query += ` AND a.date = ?`;
    params.push(date);
  }

  if (status) {
    query += ` AND a.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY a.date DESC, a.time`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar agendamentos:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const updates = [];
  const params = [];
  
  if (status) {
    updates.push('status = ?');
    params.push(status);
  }
  
  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nenhuma atualização fornecida' });
  }
  
  params.push(req.user.id, id);
  
  db.run(
    `UPDATE appointments SET ${updates.join(', ')} WHERE barber_id = ? AND id = ?`,
    params,
    function(err) {
      if (err) {
        console.error('Erro ao atualizar agendamento:', err);
        return res.status(500).json({ error: 'Erro ao atualizar agendamento' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      
      res.json({ success: true, message: 'Agendamento atualizado com sucesso' });
    }
  );
});

// -----------------------
// Rotas de Serviços
// -----------------------
app.get('/api/services', (req, res) => {
  db.all(`SELECT * FROM services ORDER BY name`, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar serviços:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

app.post('/api/services', authenticateToken, (req, res) => {
  const { name, price, duration } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  db.run(
    `INSERT INTO services (name, price, duration) VALUES (?, ?, ?)`,
    [name, parseFloat(price), duration || 30],
    function(err) {
      if (err) {
        console.error('Erro ao criar serviço:', err);
        return res.status(500).json({ error: 'Erro ao criar serviço' });
      }
      
      res.json({ 
        success: true, 
        message: 'Serviço criado com sucesso',
        serviceId: this.lastID 
      });
    }
  );
});

// -----------------------
// Rotas de Clientes
// -----------------------
app.get('/api/clients', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM clients ORDER BY name`, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar clientes:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

app.post('/api/clients', authenticateToken, (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  db.run(
    `INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)`,
    [name, email || null, phone || null],
    function(err) {
      if (err) {
        console.error('Erro ao criar cliente:', err);
        return res.status(500).json({ error: 'Erro ao criar cliente' });
      }
      
      res.json({ 
        success: true, 
        message: 'Cliente criado com sucesso',
        clientId: this.lastID 
      });
    }
  );
});

// -----------------------
// Rota para dashboard/estatísticas
// -----------------------
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Buscar estatísticas do dia
  db.all(
    `SELECT 
      COUNT(*) as total_appointments,
      COUNT(CASE WHEN status = 'concluido' THEN 1 END) as completed_appointments,
      COUNT(CASE WHEN status = 'agendado' THEN 1 END) as pending_appointments,
      COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelled_appointments
    FROM appointments 
    WHERE barber_id = ? AND date = ?`,
    [req.user.id, today],
    (err, stats) => {
      if (err) {
        console.error('Erro ao buscar estatísticas:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      res.json({
        today: today,
        stats: stats[0] || {
          total_appointments: 0,
          completed_appointments: 0,
          pending_appointments: 0,
          cancelled_appointments: 0
        }
      });
    }
  );
});

// -----------------------
// Rota principal
// -----------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -----------------------
// Inicializar servidor
// -----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});