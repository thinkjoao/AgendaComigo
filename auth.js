require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

// Escopo de acesso à planilha
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Configura OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // redireciona para console
);

// Gera link de autorização
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES
});

console.log('Abra este link no navegador e autorize o acesso:');
console.log(authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Cole o código de autorização aqui: ', async (code) => {
  rl.close();

  try {
    // Obter tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log('Tokens gerados:', tokens);
    console.log('Autenticado com sucesso!');

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    // --- Função para adicionar agendamento ---
    async function adicionarAgendamento(nome, data, hora, servico, observacoes) {
      const values = [
        [nome, data, hora, servico, observacoes, new Date().toLocaleString()]
      ];

      const resource = { values };
      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: 'Agendamentos!A:F',
        valueInputOption: 'RAW', // insere o valor como está
        resource
      });

      console.log('Agendamento adicionado com sucesso!');
      return result;
    }

    // Adicionar agendamento de teste
    await adicionarAgendamento(
      'João Teste',
      '2025-09-21',
      '14:00',
      'Corte de cabelo',
      'Sem observações'
    );

    // Ler e exibir dados da planilha
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: 'Agendamentos!A:F'
    });

    if (!res.data.values || res.data.values.length === 0) {
      console.log('Planilha vazia.');
    } else {
      console.log('Dados da planilha atualizados:');
      console.table(res.data.values);
    }

  } catch (error) {
    console.error('Erro ao acessar a planilha:', error.message);
  }
});

async function login(email, password) {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    console.log('Login feito:', data.user);
  } else {
    alert(data.error);
  }
}

async function login(email, password) {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    console.log('Login feito:', data.user);
  } else {
    alert(data.error);
  }
}

