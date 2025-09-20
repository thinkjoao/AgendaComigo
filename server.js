require('dotenv').config();
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // pasta para frontend

// -----------------------
// Configuração da planilha
// -----------------------
const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

async function accessSheet() {
  try {
    await doc.useServiceAccountAuth(require('./credentials.json'));
    await doc.loadInfo();
    return doc.sheetsByIndex[0]; // primeira aba
  } catch (err) {
    console.error('Erro ao acessar planilha:', err);
    throw err;
  }
}

// -----------------------
// Funções de agendamento
// -----------------------
async function addAppointment({ name, date, time, service = '', notes = '' }) {
  const sheet = await accessSheet();
  const newRow = {
    Nome_do_Cliente: name,
    Data: date,
    Hora: time,
    Servico: service,
    Observacoes: notes,
    Criado_Em: new Date().toLocaleString()
  };
  await sheet.addRow(newRow);
}

async function getAppointments(filters = {}) {
  const sheet = await accessSheet();
  const rows = await sheet.getRows();

  return rows.filter(row => {
    if (filters.name && !row.Nome_do_Cliente.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.date && row.Data !== filters.date) return false;
    if (filters.time && row.Hora !== filters.time) return false;
    return true;
  });
}

// -----------------------
// Rotas da API
// -----------------------
app.post('/api/appointments', async (req, res) => {
  try {
    await addAppointment(req.body);
    res.json({ success: true, message: 'Agendamento criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const filters = req.query;
    const appointments = await getAppointments(filters);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------
// Inicializar servidor
// -----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

if (!req.body.name || !req.body.date || !req.body.time) {
  return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
}
