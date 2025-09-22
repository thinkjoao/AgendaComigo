const db = require('./database');

// Dados iniciais
const services = [
  { name: 'Corte Masculino', price: 30.00, duration: 30 },
  { name: 'Corte Feminino', price: 40.00, duration: 45 },
  { name: 'Barba', price: 20.00, duration: 20 },
  { name: 'Combo Corte + Barba', price: 45.00, duration: 50 },
  { name: 'Lavagem + Corte', price: 35.00, duration: 40 },
  { name: 'Corte Infantil', price: 25.00, duration: 25 }
];

const clients = [
  { name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-0001' },
  { name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 99999-0002' },
  { name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(11) 99999-0003' },
  { name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 99999-0004' },
  { name: 'Carlos Mendes', email: 'carlos@email.com', phone: '(11) 99999-0005' }
];

async function seedData() {
  console.log('🌱 Iniciando população de dados...\n');

  try {
    // Popular serviços
    console.log('📋 Inserindo serviços...');
    const serviceStmt = db.prepare(`
      INSERT INTO services (name, price, duration) 
      SELECT ?, ?, ? 
      WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = ?)
    `);

    let servicesAdded = 0;
    services.forEach(service => {
      const result = serviceStmt.run([service.name, service.price, service.duration, service.name]);
      if (result.changes > 0) {
        console.log(`  ✅ ${service.name} - R$ ${service.price.toFixed(2)}`);
        servicesAdded++;
      } else {
        console.log(`  ℹ️  ${service.name} já existe`);
      }
    });
    serviceStmt.finalize();

    console.log(`\n📊 ${servicesAdded} novos serviços adicionados.\n`);

    // Popular clientes
    console.log('👥 Inserindo clientes...');
    const clientStmt = db.prepare(`
      INSERT INTO clients (name, email, phone)
      SELECT ?, ?, ? 
      WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = ?)
    `);

    let clientsAdded = 0;
    clients.forEach(client => {
      const result = clientStmt.run([client.name, client.email, client.phone, client.email]);
      if (result.changes > 0) {
        console.log(`  ✅ ${client.name} - ${client.email}`);
        clientsAdded++;
      } else {
        console.log(`  ℹ️  ${client.name} já existe`);
      }
    });
    clientStmt.finalize();

    console.log(`\n📊 ${clientsAdded} novos clientes adicionados.\n`);

    // Mostrar estatísticas finais
    db.get('SELECT COUNT(*) as count FROM services', (err, servicesCount) => {
      if (!err) {
        console.log(`📋 Total de serviços no banco: ${servicesCount.count}`);
      }
    });

    db.get('SELECT COUNT(*) as count FROM clients', (err, clientsCount) => {
      if (!err) {
        console.log(`👥 Total de clientes no banco: ${clientsCount.count}`);
      }
    });

    db.get('SELECT COUNT(*) as count FROM users', (err, usersCount) => {
      if (!err) {
        console.log(`👤 Total de usuários no banco: ${usersCount.count}`);
      }
    });

    console.log('\n✅ População de dados concluída com sucesso!');
    
    db.close();

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
    db.close();
  }
}

// Executar
seedData();