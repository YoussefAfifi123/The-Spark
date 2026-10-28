import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  res.type('application/xml');
  if (fs.existsSync(sitemapPath)) {
    let content = fs.readFileSync(sitemapPath, 'utf8');
    const host = req.get('host') || 'localhost:3000';
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    content = content.replace(/https?:\/\/(?:__HOST__|ais-pre-6gnsl5m6lawzqxr3aukziq-540398746585\.europe-west1\.run\.app)/g, `${proto}://${host}`);
    return res.send(content);
  }
  res.status(404).send('sitemap.xml not found');
});

app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(__dirname, 'public', 'robots.txt');
  res.type('text/plain');
  if (fs.existsSync(robotsPath)) {
    let content = fs.readFileSync(robotsPath, 'utf8');
    const host = req.get('host') || 'localhost:3000';
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    content = content.replace(/https?:\/\/(?:__HOST__|ais-pre-6gnsl5m6lawzqxr3aukziq-540398746585\.europe-west1\.run\.app)/g, `${proto}://${host}`);
    return res.send(content);
  }
  const host = req.get('host') || 'localhost:3000';
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
  res.send(`User-agent: *\nAllow: /\n\nSitemap: ${proto}://${host}/sitemap.xml\n`);
});

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  const rootIndex = path.join(__dirname, 'index.html');
  if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  res.status(404).send('index.html not found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
