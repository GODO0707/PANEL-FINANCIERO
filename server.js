const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'datos.json');

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { categories: [], month: getCurrentMonth() };
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { categories: [], month: getCurrentMonth() };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (pathname === '/api/data' && req.method === 'GET') {
    const data = loadData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  if (pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Datos inválidos' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('No encontrado');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('✅ Panel de Gastos activo');
  console.log('');
  console.log(`   Ordenador: http://localhost:${PORT}`);
  console.log('');
  console.log('   Móvil/tablet: busca tu IP local con ipconfig (Windows)');
  console.log(`   o ifconfig (Mac/Linux) y abre http://TU_IP:${PORT}`);
  console.log('');
  console.log('   Para cerrar: Ctrl + C');
  console.log('');
});
