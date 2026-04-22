/**
 * Simple HTTP/2 static file server for FitTrack.
 *
 * - Serves files from ./dist (falls back to project root if dist is missing).
 * - Uses a self-signed TLS cert (generated on first run, cached in ./certs).
 *   HTTP/2 in browsers requires HTTPS, so a cert is mandatory.
 * - Pure JS cert generation via the `selfsigned` package → works on any
 *   machine with Node.js installed, no OpenSSL required.
 *
 * Run:   npm run serve:http2
 * Open:  https://localhost:8443
 */

const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawnSync } = require('child_process');
const selfsigned = require('selfsigned');

const PORT = process.env.PORT || 8443;
const HOST = process.env.HOST || '0.0.0.0';

const CERT_DIR = path.join(__dirname, 'certs');
const KEY_PATH = path.join(CERT_DIR, 'key.pem');
const CRT_PATH = path.join(CERT_DIR, 'cert.pem');
const TRUST_MARKER = path.join(CERT_DIR, '.trusted');

// Augment PATH with common Homebrew locations so `which mkcert` / `which brew`
// work even when Node was launched from a minimal shell (e.g. via an IDE).
(function augmentPath() {
  const extra = ['/opt/homebrew/bin', '/opt/homebrew/sbin', '/usr/local/bin', '/usr/local/sbin'];
  const sep = process.platform === 'win32' ? ';' : ':';
  const current = (process.env.PATH || '').split(sep);
  for (const p of extra) if (!current.includes(p)) current.unshift(p);
  process.env.PATH = current.join(sep);
})();

function which(bin) {
  const cmd = process.platform === 'win32' ? 'where' : 'which';
  const r = spawnSync(cmd, [bin], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.split(/\r?\n/)[0].trim() : null;
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { stdio: 'inherit', ...opts });
}

// Try to install mkcert automatically using the system's package manager.
// Returns path to mkcert on success, null on failure.
function tryInstallMkcert() {
  if (which('mkcert')) return which('mkcert');

  const platform = process.platform;
  console.log('[http2] mkcert not found — attempting auto-install…');

  if (platform === 'darwin' && which('brew')) {
    const r = run('brew', ['install', 'mkcert', 'nss']);
    if (r.status === 0) return which('mkcert');
  } else if (platform === 'linux') {
    if (which('apt-get')) {
      run('sudo', ['apt-get', 'update']);
      const r = run('sudo', ['apt-get', 'install', '-y', 'libnss3-tools', 'mkcert']);
      if (r.status === 0 && which('mkcert')) return which('mkcert');
    }
    if (which('dnf')) {
      const r = run('sudo', ['dnf', 'install', '-y', 'mkcert', 'nss-tools']);
      if (r.status === 0) return which('mkcert');
    }
    if (which('pacman')) {
      const r = run('sudo', ['pacman', '-S', '--noconfirm', 'mkcert', 'nss']);
      if (r.status === 0) return which('mkcert');
    }
  } else if (platform === 'win32') {
    if (which('choco')) {
      const r = run('choco', ['install', 'mkcert', '-y']);
      if (r.status === 0) return which('mkcert');
    }
    if (which('scoop')) {
      const r = run('scoop', ['install', 'mkcert']);
      if (r.status === 0) return which('mkcert');
    }
  }

  console.log('[http2] Could not auto-install mkcert on this system.');
  return null;
}

// Use mkcert to install a local CA and issue a cert trusted by browsers.
// Returns true on success.
function setupMkcertCert() {
  const mkcert = tryInstallMkcert();
  if (!mkcert) return false;

  console.log('[http2] Installing local CA (may prompt for your password once)…');
  const install = run(mkcert, ['-install']);
  if (install.status !== 0) {
    console.log('[http2] `mkcert -install` failed.');
    return false;
  }

  if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });

  const hostnames = ['localhost', '127.0.0.1', '::1'];
  // Also include the LAN IP so the cert works when friends hit it via wifi.
  const lan = getLanIPs();
  const gen = run(mkcert, [
    '-key-file', KEY_PATH,
    '-cert-file', CRT_PATH,
    ...hostnames,
    ...lan,
  ]);
  if (gen.status !== 0) {
    console.log('[http2] mkcert cert generation failed.');
    return false;
  }

  writeTrustMarker('mkcert');
  console.log('[http2] Trusted certificate generated via mkcert ✓');
  return true;
}

function getLanIPs() {
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const addr of ifaces[name] || []) {
      if (!addr.internal && addr.family === 'IPv4') out.push(addr.address);
    }
  }
  return out;
}

// Fallback: generate a self-signed cert and try to trust it at the OS level
// so browsers stop warning and Service Workers register.
function trustSelfSignedCert() {
  try {
    if (process.platform === 'darwin') {
      console.log('[http2] Adding self-signed cert to macOS System keychain (password prompt)…');
      const r = run('sudo', [
        'security', 'add-trusted-cert', '-d', '-r', 'trustRoot',
        '-k', '/Library/Keychains/System.keychain', CRT_PATH,
      ]);
      if (r.status === 0) { writeTrustMarker('macos-keychain'); return true; }
    } else if (process.platform === 'linux') {
      const dest = '/usr/local/share/ca-certificates/fittrack-http2.crt';
      const r1 = run('sudo', ['cp', CRT_PATH, dest]);
      const r2 = run('sudo', ['update-ca-certificates']);
      if (r1.status === 0 && r2.status === 0) { writeTrustMarker('linux-ca'); return true; }
    } else if (process.platform === 'win32') {
      const r = run('certutil', ['-addstore', '-f', 'ROOT', CRT_PATH]);
      if (r.status === 0) { writeTrustMarker('windows-root'); return true; }
    }
  } catch (e) {
    console.log('[http2] OS trust step failed:', e.message);
  }
  return false;
}

async function generateSelfSigned() {
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const opts = {
    days: 365,
    keySize: 2048,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
          ...getLanIPs().map((ip) => ({ type: 7, ip })),
        ],
      },
    ],
  };
  let pems = selfsigned.generate(attrs, opts);
  if (pems && typeof pems.then === 'function') pems = await pems;
  if (!pems || !pems.private || !pems.cert) {
    throw new Error('selfsigned did not return a valid key/cert pair');
  }
  if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });
  fs.writeFileSync(KEY_PATH, pems.private);
  fs.writeFileSync(CRT_PATH, pems.cert);
}

// A per-machine fingerprint stored inside the trust marker. If the project
// gets zipped and moved to another computer, this mismatch forces a fresh
// cert + trust cycle on the new machine.
function machineFingerprint() {
  return [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.userInfo().username,
  ].join('|');
}

function markerIsForThisMachine() {
  try {
    const data = fs.readFileSync(TRUST_MARKER, 'utf8');
    return data.includes(`fp=${machineFingerprint()}`);
  } catch {
    return false;
  }
}

function writeTrustMarker(method) {
  fs.writeFileSync(TRUST_MARKER, `method=${method}\nfp=${machineFingerprint()}\n`);
}

async function ensureCerts() {
  const haveCerts = fs.existsSync(KEY_PATH) && fs.existsSync(CRT_PATH);
  const trusted = fs.existsSync(TRUST_MARKER) && markerIsForThisMachine();

  if (!trusted && haveCerts) {
    console.log('[http2] Existing cert was issued on a different machine — regenerating…');
    try { fs.unlinkSync(KEY_PATH); } catch {}
    try { fs.unlinkSync(CRT_PATH); } catch {}
    try { fs.unlinkSync(TRUST_MARKER); } catch {}
  }

  if (haveCerts && trusted) {
    return { key: fs.readFileSync(KEY_PATH), cert: fs.readFileSync(CRT_PATH) };
  }

  // Preferred path: mkcert. Produces a cert that every browser already trusts.
  if (!haveCerts || !trusted) {
    if (setupMkcertCert()) {
      return { key: fs.readFileSync(KEY_PATH), cert: fs.readFileSync(CRT_PATH) };
    }
  }

  // Fallback: self-signed + OS trust store.
  if (!haveCerts) {
    console.log('[http2] Falling back to self-signed certificate…');
    await generateSelfSigned();
  }

  const osTrusted = trustSelfSignedCert();
  if (!osTrusted) {
    console.log('[http2] ⚠ Could not automatically trust the certificate.');
    console.log('        The site will load, but Service Workers may not register');
    console.log('        until the cert is trusted manually.');
  }

  return { key: fs.readFileSync(KEY_PATH), cert: fs.readFileSync(CRT_PATH) };
}

// Default to project root because the HTML references un-minified asset
// names (style.css, index.js, …) that don't exist under ./dist (which
// contains *.min.css / *.min.js). Set SERVE_DIST=1 to serve ./dist instead.
const ROOT = process.env.SERVE_DIST === '1' && fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.map':  'application/json',
};

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let rel = decoded === '/' ? '/index.html' : decoded;
  const full = path.normalize(path.join(ROOT, rel));
  if (!full.startsWith(ROOT)) return null;
  return full;
}

let server;

async function main() {
  const { key, cert } = await ensureCerts();
  server = http2.createSecureServer({ key, cert, allowHTTP1: true });
  server.on('error', (err) => console.error('[http2] server error:', err));
  server.on('request', handleRequest);
  server.listen(PORT, HOST, () => {
    const lanHints = getLanIPs().map((ip) => `https://${ip}:${PORT}`).join('  ') || `https://<your-ip>:${PORT}`;
    console.log(`\n[http2] Serving  ${ROOT}`);
    console.log(`[http2] Local    https://localhost:${PORT}`);
    console.log(`[http2] Network  ${lanHints}`);
    console.log('[http2] Ready. Open the URL above in any browser.\n');
  });
}

function handleRequest(req, res) {
  let filePath = safeResolve(req.url);
  if (!filePath) {
    res.statusCode = 400;
    return res.end('Bad request');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Fallback: try `.min.<ext>` (e.g. style.css → style.min.css) so the
      // server also works when pointed at ./dist.
      const minCandidate = filePath.replace(/(\.[a-z0-9]+)$/i, '.min$1');
      if (minCandidate !== filePath && fs.existsSync(minCandidate)) {
        return stream(minCandidate, res);
      }
      res.statusCode = 404;
      return res.end('Not found');
    }
    stream(filePath, res);
  });
}

function stream(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache');
  fs.createReadStream(filePath)
    .on('error', () => { res.statusCode = 500; res.end('Server error'); })
    .pipe(res);
}

main().catch((err) => {
  console.error('[http2] failed to start:', err);
  process.exit(1);
});
