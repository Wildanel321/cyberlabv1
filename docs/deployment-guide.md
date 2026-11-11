# CyberGuard Lab - Deployment Guide (Cloudflare Zero Trust, VPS & Local Network)

This guide documents the complete deployment architecture for **CyberGuard Lab** across three environments:
1. **Local Network Mode (Workshop/Classroom LAN using Host IP)**
2. **Cloudflare Zero Trust Tunnel Production Mode (High Security / Recommended)**
3. **VPS Direct Production Mode (Domain with HTTPS & WSS via Nginx + Certbot)**

---

## Mode 1: Local Network Mode (Classroom / Workshop LAN)

In this mode, an instructor runs the server on a local laptop/PC connected to the venue WiFi/LAN. Students connect directly from their smartphones or laptops using the instructor's local IP (e.g., `http://192.168.1.50:5173`).

### 1. Requirements
- Node.js >= 18
- PHP >= 8.2 with `pdo_pgsql`, `mbstring`, `curl`, `xml`, `zip`
- PostgreSQL >= 14 (or SQLite fallback)

### 2. Determine Instructor Local IP
- **Windows**: `ipconfig` (find IPv4 Address under Wi-Fi, e.g. `192.168.1.50`)
- **Linux/macOS**: `ip a` or `ifconfig`

### 3. Backend Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Update `.env`:
   ```env
   APP_URL=http://192.168.1.50:8000
   SANCTUM_STATEFUL_DOMAINS="192.168.1.50,192.168.1.50:5173"
   REVERB_HOST="0.0.0.0"
   REVERB_PORT=8080
   REVERB_SCHEME=http
   ```
3. Run migrations & seeders:
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   ```
4. Start Reverb WebSocket server (background or separate terminal):
   ```bash
   php artisan reverb:start --host=0.0.0.0 --port=8080
   ```
5. Start Laravel API server:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

### 4. Frontend Setup
1. Configure `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://192.168.1.50:8000/api/v1
   ```
2. Build or start Vite dev server:
   ```bash
   cd frontend
   npm run build
   npm run preview -- --host 0.0.0.0 --port 5173
   # OR for development
   npm run dev -- --host 0.0.0.0
   ```

### 5. Windows / Linux Firewall Configuration
Allow inbound traffic on ports `5173`, `8000`, and `8080`:
- **Windows (PowerShell as Admin)**:
  ```powershell
  New-NetFirewallRule -DisplayName "CyberGuard Web" -Direction Inbound -LocalPort 5173,8000,8080 -Protocol TCP -Action Allow
  ```
- **Linux (ufw)**:
  ```bash
  sudo ufw allow 5173/tcp
  sudo ufw allow 8000/tcp
  sudo ufw allow 8080/tcp
  ```

---

## Mode 2: Cloudflare Zero Trust Tunnel Production Mode (High Security - Recommended)

Mengapa Cloudflare Zero Trust Tunnel adalah pilihan utama untuk platform edukasi keamanan siber:
- **Zero Exposed Inbound Ports**: Seluruh port masuk pada server ditutup (`ufw default deny incoming`). Tidak ada port 80, 443, atau 22 yang terbuka ke internet umum.
- **DDoS & Layer 7 Protection**: Semua request disaring terlebih dahulu oleh Jaringan Anycast Global dan WAF Cloudflare sebelum mencapai server Anda.
- **Origin IP Cloaking**: IP publik VPS Anda 100% tersembunyi dari publik, mencegah serangan port-scanning atau targeted IP brute-force.
- **Zero-Touch SSL**: Cloudflare mengelola sertifikat TLS/SSL secara otomatis di edge network tanpa perlu Certbot atau renewal manual.
- **Native WebSocket (WSS) Support**: Lalu lintas Laravel Reverb disalurkan dengan aman melalui tunnel terenkripsi HTTP/2 dan QUIC.

### 1. Pasang Cloudflare Tunnel Agent (`cloudflared`)
Di server Ubuntu/Debian Anda:
```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /etc/apt/trusted.gpg.d/cloudflare.gpg >/dev/null
echo "deb https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared
```

### 2. Autentikasi dan Buat Tunnel
```bash
# Login ke akun Cloudflare
cloudflared tunnel login

# Buat tunnel baru khusus CyberGuard Lab
cloudflared tunnel create cyberlab-tunnel
```
Catat **Tunnel ID** dan path file JSON kredensial yang dihasilkan (misal: `/root/.cloudflared/<TUNNEL_ID>.json`).

### 3. Buat File Konfigurasi Tunnel
Buat file `~/.cloudflared/config.yml`:
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  # Rute seluruh traffic domain ke Nginx lokal di port 80
  - hostname: cyberlab.domainanda.com
    service: http://127.0.0.1:80
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true
  - service: http_status:404
```

### 4. Hubungkan DNS Domain ke Tunnel
```bash
cloudflared tunnel route dns cyberlab-tunnel cyberlab.domainanda.com
```

### 5. Pasang dan Jalankan Daemon Systemd
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### 6. Konfigurasi Nginx Lokal (Hanya Listen di Localhost)
Nginx hanya perlu mendengarkan request di `127.0.0.1:80` dari `cloudflared`:
```nginx
server {
    listen 127.0.0.1:80;
    server_name cyberlab.domainanda.com;

    root /var/www/cyberlab/frontend/dist;
    index index.html;

    real_ip_header CF-Connecting-IP;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend React SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Routing (PHP-FPM)
    location /api {
        alias /var/www/cyberlab/backend/public;
        try_files $uri $uri/ @backend;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME /var/www/cyberlab/backend/public/index.php;
            fastcgi_param SCRIPT_NAME /index.php;
            fastcgi_param HTTPS on;
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
        }
    }

    location @backend {
        rewrite /api/(.*)$ /api/index.php?/$1 last;
    }

    # Laravel Reverb WebSocket Proxy (WSS)
    location /app {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 7. Firewall Lockdown (Tutup Semua Port Publik!)
Karena `cloudflared` membuat koneksi outbound terenkripsi ke edge Cloudflare, Anda dapat menutup **semua port publik inbound** di VPS:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # Khusus SSH remote
sudo ufw enable
```

---

## Mode 3: VPS Direct Production Mode (Domain with HTTPS & WSS via Nginx + Certbot)

In this mode, CyberGuard Lab runs on an Ubuntu 22.04/24.04 VPS with a custom domain (e.g. `cyberguard.yourdomain.com`), secured by Let's Encrypt SSL certificates.

### 1. System Package Installation
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx postgresql postgresql-contrib \
    php8.3-fpm php8.3-cli php8.3-pgsql php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip \
    supervisor git curl
```

### 2. PostgreSQL Configuration
```bash
sudo -u postgres psql -c "CREATE USER cyberuser WITH PASSWORD 'YourStrongDbPassword123!';"
sudo -u postgres psql -c "CREATE DATABASE cyberlab OWNER cyberuser;"
```

### 3. Application Deployment
```bash
cd /var/www
sudo git clone https://github.com/your-org/cyberlab.git
cd cyberlab

# Backend setup
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
# Edit .env with production database credentials and domain
php artisan key:generate
php artisan migrate --force --seed
php artisan config:cache
php artisan route:cache

# Frontend production build
cd ../frontend
npm install
npm run build
```

### 4. Supervisor Configuration for Laravel Reverb
Create `/etc/supervisor/conf.d/cyberlab-reverb.conf`:
```ini
[program:cyberlab-reverb]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/cyberlab/backend/artisan reverb:start --host=127.0.0.1 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/reverb.log
```
Start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start cyberlab-reverb:*
```

### 5. Nginx Reverse Proxy Configuration
Create `/etc/nginx/sites-available/cyberlab.conf`:
```nginx
server {
    server_name cyberguard.yourdomain.com;
    root /var/www/cyberlab/frontend/dist;
    index index.html;

    # Frontend Single Page App Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Laravel Reverb WebSocket Reverse Proxy (WSS)
    location /app {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```
Enable site and acquire SSL:
```bash
sudo ln -s /etc/nginx/sites-available/cyberlab.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d cyberguard.yourdomain.com
```

---

## Troubleshooting Guide

| Problem | Root Cause | Resolution |
|---|---|---|
| **Participants cannot join from phone** | Phone and laptop are on client-isolated Wi-Fi or firewall blocking port | Connect both devices to personal hotspot, or disable client isolation in router |
| **WebSocket / Reverb disconnection** | Corporate firewall blocks port 8080 | CyberGuard automatically switches to 3s HTTP polling fallback seamlessly |
| **Duplicate session code error** | Rare random collision | Code generator automatically retries with new 6-char entropy pool |
| **Database connection refused** | PostgreSQL service stopped | Run `sudo service postgresql status` and `sudo service postgresql start` |

