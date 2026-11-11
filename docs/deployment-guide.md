# CyberGuard Lab - Deployment Guide (VPS & Local Network)

This guide documents the complete deployment architecture for **CyberGuard Lab** in two production environments:
1. **Local Network Mode (Workshop/Classroom LAN using Host IP)**
2. **VPS Internet Production Mode (Domain with HTTPS & WSS WebSockets via Nginx Reverse Proxy)**

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

## Mode 2: VPS Production Mode (Domain with HTTPS & WSS)

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

