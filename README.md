# VPS Monitoring Dashboard

> A lightweight, open-source dashboard for real-time monitoring of your VPS servers.

---

## 📌 About

**VPS Monitoring Dashboard** is a comprehensive and secure solution for monitoring key server metrics (CPU, RAM, Disk, Network, Processes, Docker) directly from a web browser. The project uses a **REST API + SSR architecture** with automatic data refresh, supports **multi-language (French/English)**, and integrates advanced security and configuration features.

---

## ✅ Features

### 📊 **Real-time Monitoring**
- **CPU**: Usage percentage, core count, model and speed
- **RAM**: Usage percentage, used/total memory, free memory
- **Disk**: Used, total, available space, usage percentage
- **Network**: Download/Upload in KB/s per active network interface
- **Processes**: Top 5 CPU/RAM consuming processes with user, PID and percentages

### 🎨 **Modern and Responsive Interface**
- Animated progress bars for all metrics
- Responsive design (mobile-friendly) with adaptive CSS grids
- Sortable tables (by CPU or RAM for processes)
- Dynamic refresh without page reload (via configurable setInterval)
- **Dark Mode**: Alternative theme with localStorage persistence, consistently applied across all pages (dashboard, configuration, login)
- **Unified Buttons**: Consistent CSS styling for all buttons (logout, configuration, etc.)
- **Icons**: Font Awesome 6.4.0 integration via CDN for menu icons
- Custom favicon (magnifying glass with blue center and black handle)

### ⚠️ **Smart Alerts**
- Configurable thresholds for CPU, RAM and Disk (via interface or .env)
- **Alert Levels**: Warning (CPU/RAM) and Danger (Disk)
- Real-time notifications with detection of new alerts and resolutions
- Alert history stored in SQLite database
- **Telegram Notifications**: Complete configuration (token, chat ID, cooldown 1-1440 min) with integrated test button
- **Configurable Cooldown**: Delay between notifications to prevent spam (1-1440 minutes)
- **Resolution Notification**: Option to notify when an alert is resolved

### 📈 **History and Analysis**
- **SQLite Storage** (better-sqlite3) with dedicated tables: metrics, alerts, docker_containers, docker_alerts
- **Configurable Retention**: Data storage duration (1-24 months)
- Automatic collection with configurable interval (default: 5 seconds)
- **API Endpoints** for retrieving historical data with time filtering
- **Smart Aggregation**: Data grouped by 30 minutes (day), by day (week/month)
- **Automatic Cleanup**: Removal of old data according to retention period

### ⚙️ **Advanced Configuration**
- **Configuration Menu** accessible from the interface (⚙️ icon)
- **Collection Interval**: Adjustment of metric collection frequency (in ms, minimum 1000ms)
- **Data Retention**: Configuration of storage duration (1-24 months)
- **Data Deletion**: Button to delete all historical data (SQLite + JSON) with explicit confirmation
- **Theme Management**: Switch between light/dark mode from the configuration menu
- **Timezone Offset**: UTC offset (+/- hours, -12 to +14) for historical chart display
- **Docker Engine Visibility**: Option to show or hide the Docker section of the dashboard
- **Multi-language**: Language selector (French/English) with localStorage persistence
- **Alert Thresholds**: Configuration of CPU/RAM/Disk thresholds (0-100%) directly from the modal
- **Telegram Notifications**: Complete configuration with connection test and test message sending
- **Interval Presets**: Predefined buttons for easy configuration

### 🔍 **Advanced Process Monitoring**
- **Top 5 Processes**: Identification of the most CPU and RAM intensive processes
- Dynamic sorting by CPU or memory (active sort buttons)
- Visualization with inline progress bars
- **Consistent Analysis**: Data aligned with global CPU/RAM usage
- **Two Collection Methods**: `ps aux` command (preferred, gives percentages directly) + fallback to systeminformation.processes()
- **Detailed Display**: PID, name, user, %CPU, %RAM

### 🔌 **Port Security**
- **Open Port Monitoring**: List of TCP ports in listening state (LISTEN)
- **Visual Indicator**: 🟢 (local - 127.0.0.1/::1) or 🟠 (external - 0.0.0.0/::)
- **Service Identification**: Known ports database (SSH:22, HTTP:80, HTTPS:443, MySQL:3306, etc.)
- **Security Level**: Star rating (⭐⭐⭐ = system port <1024, ⭐⭐☆ = registered port 1024-49151, ⭐☆☆ = dynamic port >49151)
- **Automatic Classification**: System ports (<1024), registered (1024-49151), dynamic (>49151)
- **Multi-method Detection**: systeminformation.networkConnections() + fallback to `ss -tlnp` command

### 🐳 **Complete Docker Monitoring**
- **Docker Engine**: Status (running/stopped), version, OS, architecture, CPU count, total memory
- **Containers**: Complete list with name, ID (first 12 characters), image, status (Running/Stopped/Paused), published/exposed ports, creation date, command
- **Container Stats**: Total count, running, stopped, paused
- **Images**: Complete list with repoTags (name:tag), ID (first 12 characters), size, creation date, status (dangling/untagged)
- **Image Stats**: Total count, total size, dangling images, untagged images
- **Extended Details**: Toggle button to show/hide detailed tables for containers and images
- **Per-Container Charts**: CPU and RAM evolution with period aggregation
- **Docker Alerts**: Detection of stopped containers, CPU > 90%, RAM > 85%
- **Controls**: Start/Stop/Restart buttons directly from the interface
- **Docker History**: SQLite storage with automatic cleanup after 91 days
- **Simplified Docker API**: `/api/docker-simple` endpoint for basic info (running/stopped/total)
- **Detailed Docker API**: `/api/docker-detailed` endpoint for containers + images with all details

### 🔐 **Enhanced Security**
- **Mandatory Authentication**: Protection of all routes (dashboard + API) via sessions
- **Session Management**: express-session with secure cookie (httpOnly, sameSite: lax, maxAge: 24h)
- **Password Hashing**: bcryptjs with cost factor 10
- **Rate Limiting**: 5 login attempts maximum per 15-minute window, based on IP
- **Strict CORS**: Whitelist of allowed origins (ALLOWED_ORIGINS required)
- **CSRF Protection**: Session ID regeneration after login (session fixation prevention)
- **Input Validation**: Strict verification of API parameters (types, value ranges)
- **Sanitization**: Use of execFile instead of exec to prevent command injection
- **Security Audit**: Documentation of vulnerabilities and protection measures

### 📊 **Chart Visualization**
- **4 Main Charts**: CPU, RAM, Disk (usage %), Network (download/sent in KB/s)
- **Period Selection**: Day, Week, Month, Quarter (independent for each chart)
- **Automatic Update**: Every minute for chart data
- **Technology**: Chart.js (v4.4.0) via CDN
- **Day Aggregation**: 48 data points (1 every 30 minutes) with MAX value
- **Week/Month Aggregation**: 1 data point per day with MAX value
- **Consistent Display**: Use of UTC dates to avoid timezone offsets

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher, recommended v18+)
- npm or yarn
- A VPS or local server for testing
- **Docker Engine** (for Docker monitoring - optional)
- **Git** (for deployment)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SHARKYBLUSTER/vps_monitoring.git
   cd vps_monitoring
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (required):
   ```bash
   cp .env.example .env
   # Edit the .env file with your credentials
   nano .env  # or use your preferred editor
   ```

   **Required Variables**:
   ```ini
   # Authentication
   ADMIN_USER=your_username
   ADMIN_PASSWORD=your_password
   SESSION_SECRET=your_random_secret_key

   # CORS Security (required)
   ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
   ```

   **Generate a secure secret key**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Install Docker (optional - for Docker monitoring)**:

   If you want to monitor your Docker containers, install Docker Engine:

   ```bash
   # For Debian/Ubuntu
   sudo apt-get update
   sudo apt-get install -y docker.io

   # Start and enable Docker
   sudo systemctl enable docker
   sudo systemctl start docker

   # Verify installation
   docker --version
   sudo docker run hello-world
   ```

   **Add your user to the docker group** (to avoid sudo):
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker  # Apply changes without restarting
   ```

   **⚠️ Important**: After adding your user to the docker group, you must restart your session or run `newgrp docker` for the changes to take effect.

5. **Install procps (optional - for process monitoring)**:
   ```bash
   # For Debian/Ubuntu
   sudo apt-get install -y procps
   ```

   **Note**: The `ps aux` command is used by default to get processes with their CPU/RAM percentages.

6. **Start the server**:
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

7. **Use PM2 (Recommended for production)**:

   **PM2** is a Node.js process manager for managing applications in production.

   **Prerequisites**: Before launching PM2, ensure Node.js has the necessary permissions to monitor processes:
   ```bash
   sudo setcap cap_sys_ptrace,cap_dac_read_search+ep /usr/bin/node
   ```

   **Installation** (if not already done):
   ```bash
   npm install -g pm2
   ```

   **Start the server**:
   ```bash
   pm2 start backend/app.js --name "vps_monitoring"
   ```

   **Useful Options**:
   - `--name`: Give a custom name to your process.
   - `--watch`: Automatically restart on file changes (useful in development).
   - `--max-memory-restart 300M`: Restart if memory exceeds 300 MB.

   **Useful PM2 Commands**:

   | Command | Description |
   |----------|-------------|
   | `pm2 list` | List running processes. |
   | `pm2 logs vps_monitoring` | Show real-time logs. |
   | `pm2 logs --lines 100` | Show last 100 lines of logs. |
   | `pm2 restart vps_monitoring` | Restart the process. |
   | `pm2 stop vps_monitoring` | Stop the process. |
   | `pm2 delete vps_monitoring` | Remove the process from the list. |
   | `pm2 save` | Save the process list. |
   | `pm2 startup` | Generate a command to start PM2 on server boot. |

   **Complete Example**:
   ```bash
   pm2 start backend/app.js --name "vps_monitoring" --max-memory-restart 300M
   pm2 save
   pm2 startup
   ```

8. **Deploy with Docker**:

   VPS Monitoring can be deployed in a Docker container for isolated and simplified management.

   **⚠️ Important**: To monitor **global host system metrics** (CPU, RAM, disk, processes, network), the container must be launched in **privileged mode** with access to system namespaces.

   ### Prerequisites
   - Docker Engine installed on your VPS
   - Root or sudo access for Docker commands

   ### Option A: With docker-compose (Recommended)

   The project includes a `docker-compose.yml` file configured for global monitoring:

   ```yaml
   version: '3.8'
   services:
     vps_monitoring:
       build: .
       ports:
         - "3000:3000"
       network_mode: host
       pid: host
       privileged: true
       volumes:
         - ./data:/app/data
         - /var/run/docker.sock:/var/run/docker.sock:ro
       environment:
         - NODE_ENV=production
       restart: unless-stopped
   ```

   **Launch with docker-compose**:
   ```bash
   # 1. Clone and enter the project
   git clone https://github.com/SHARKYBLUSTER/vps_monitoring.git
   cd vps_monitoring

   # 2. Create your .env file (optional - uses defaults otherwise)
   cp .env.example .env
   nano .env  # Edit credentials

   # 3. Launch with docker-compose
   docker-compose up -d --build
   ```

   **What docker-compose does**:
   - `network_mode: host` - Access to host network interfaces
   - `pid: host` - Access to host processes via /proc
   - `privileged: true` - Extended permissions for systeminformation
   - Mounts `/var/run/docker.sock` - To monitor Docker Engine
   - Mounts `./data` - SQLite database persistence

   ### Option B: With docker run

   ```bash
   # Build the image
   docker build -t vps_monitoring .

   # Run the container
   docker run -d \
     --name vps_monitoring \
     --restart unless-stopped \
     --net=host \
     --pid=host \
     --privileged \
     -v $(pwd)/data:/app/data \
     -v /var/run/docker.sock:/var/run/docker.sock:ro \
     -e ADMIN_USER=admin \
     -e ADMIN_PASSWORD=your_password \
     -e SESSION_SECRET=your_secret_key \
     -e ALLOWED_ORIGINS=http://localhost:3000 \
     -p 3000:3000 \
     vps_monitoring
   ```

   ### Useful Docker Commands

   | Command | Description |
   |----------|-------------|
   | `docker-compose logs -f` | View real-time logs |
   | `docker-compose down` | Stop the container |
   | `docker-compose up -d --build` | Update and restart |
   | `docker exec -it vps_monitoring sh` | Access container shell |

   **Dashboard Access**: `http://your-vps-ip:3000`

9. **Access the dashboard**:
   Open your browser and go to:
   ```
   http://localhost:3000
   ```

   **⚠️ Authentication Required**:
   - You will be automatically redirected to `/login` if you are not logged in.
   - Use the credentials defined in your `.env` file (default: `admin`/`changer_mot_de_passe`).
   - After logging in, you will access the complete dashboard.
   - The username is saved in localStorage for your convenience.

10. **Authentication Management**:

    The project includes a complete session-based authentication system:

    - **Configuration File**: `.env` (copy `.env.example` and modify the values)
    - **Default Credentials**:
      ```ini
      ADMIN_USER=admin
      ADMIN_PASSWORD=changer_mot_de_passe
      SESSION_SECRET=your_random_secret_key_here
      ```
    - **Generate a Secure Secret Key**:
      ```bash
      node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
      ```
    - **Authentication Routes**:
      - `GET /login` - Login page
      - `POST /login` - Form processing (with rate limiting)
      - `GET /logout` - Logout (destroys session)
      - `GET /api/user` - Get logged-in user (for frontend)
    - **Protection Middleware**: `requireAuth` (redirects to /login) and `requireApiAuth` (returns 401 JSON)

11. **Project Update**:

    To update your existing installation:
    ```bash
    cd vps_monitoring
    git pull origin main
    npm install --production
    pm2 restart vps_monitoring  # or: npm start
    ```

    **⚠️ Important**: After an update, check that your `.env` file is still present and contains your custom credentials.

---

## 🔐 Permissions for Process Monitoring

> ⚠️ **Important**: Process and Docker monitoring requires elevated permissions.

### Option 1: Run with sudo (recommended for testing)
```bash
sudo node backend/app.js
```

### Option 2: Configure capabilities (recommended for production)
```bash
# Give necessary permissions to Node.js
sudo setcap cap_sys_ptrace,cap_dac_read_search+ep /usr/bin/node

# Then start normally
node backend/app.js
```

### Option 3: Use PM2 with sudo
For optimal production management, use PM2 with necessary permissions:
```bash
sudo npm install -g pm2
sudo pm2 start backend/app.js --name vps_monitoring
sudo pm2 save
sudo pm2 startup
```
> **Note**: For more details on PM2, see the section **[Use PM2 (Recommended for production)](#7-use-pm2-recommended-for-production)**.

### ⚠️ **Additional Docker Permissions**

If you use **Docker monitoring**, ensure that:

1. **Docker is installed and running**:
   ```bash
   sudo systemctl status docker
   ```

2. **Your user is in the docker group**:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Docker daemon is accessible**:
   - Test with: `docker ps` (without sudo)
   - If you get a permission error, restart your session

4. **For complete monitoring in a Docker container**:
   - Use flags `--privileged --pid=host --net=host`
   - Mount `/var/run/docker.sock` to access Docker Engine

---

## 📡 REST API

The backend exposes several endpoints to retrieve data. **All API routes require authentication** (via session) except `/api/config` (GET) and `/api/user` (GET).

### 📊 **System Endpoints**

| Method | Endpoint | Description | Authentication |
|---------|----------|-------------|-----------------|
| GET | `/api/metrics` | All metrics (CPU, RAM, Disk, Network) | ✅ Required |
| GET | `/api/network` | Detailed network metrics (per interface) | ✅ Required |
| GET | `/api/alerts` | Active alerts (calculated in real-time) | ✅ Required |
| GET | `/api/processes` | Top 5 consuming processes | ✅ Required |
| GET | `/api/ports` | List of open listening ports | ✅ Required |
| GET | `/api/health` | Server health status + version | ✅ Required |
| GET | `/api/config` | Current configuration (without secrets) | ❌ Not required |
| POST | `/api/config` | Update configuration | ✅ Required |

### 📈 **History Endpoints**

| Method | Endpoint | Description | Parameters |
|---------|----------|-------------|------------|
| GET | `/api/history` | Metrics history | `limit`, `from`, `to` |
| GET | `/api/history/:metric` | Chart data (cpu, memory, disk) | `limit`, `period` (day/week/month/quarter) |
| GET | `/api/history/alerts` | Alert history | `limit`, `unresolvedOnly` |
| GET | `/api/network-history` | Network history with aggregation | `period` (day/week/month/quarter) |
| POST | `/api/history/cleanup` | Clean history (by days) | `days` |
| POST | `/api/history/clear-all` | **DELETE ALL data** (requires `confirm=DELETE_ALL_DATA`) | `confirm` |

### 🐳 **Docker Endpoints**

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/docker-simple` | Basic Docker Engine status (running/stopped/total) |
| GET | `/api/docker-detailed` | **Detailed Status**: containers + images + Docker Engine info |
| GET | `/api/docker` | Docker Engine status (version, OS, architecture, CPU, memory) |
| GET | `/api/docker/containers` | List of all containers |
| GET | `/api/docker/containers/:id/stats` | Stats of a specific container |
| GET | `/api/docker/stats` | Stats of all active containers |
| GET | `/api/docker/history` | Docker stats history |
| GET | `/api/docker/containers/:id/chart` | Chart data (CPU/RAM) for a container |
| GET | `/api/docker/alerts` | List of Docker alerts |
| GET | `/api/docker/alerts/check` | Check and save Docker alerts |
| POST | `/api/docker/containers/:id/start` | Start a container |
| POST | `/api/docker/containers/:id/stop` | Stop a container |
| POST | `/api/docker/containers/:id/restart` | Restart a container |
| POST | `/api/docker/cleanup` | Clean Docker history |

### 📧 **Telegram Endpoints**

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/telegram/test` | Test Telegram configuration + send a test message |
| GET | `/api/telegram/status` | Telegram configuration status |
| POST | `/api/telegram/send-test` | Send a manual test notification |

### 🔐 **Authentication Endpoints**

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/login` | Login page (HTML form) |
| POST | `/login` | Login processing (with rate limiting) |
| GET | `/logout` | Logout (destroys session) |
| GET | `/api/user` | Check if user is logged in |

---

## 📂 Project Structure

```
vps_monitoring/
├── backend/
│   ├── app.js                      # Backend entry point (Express)
│   ├── config/
│   │   └── config.js               # Central configuration (thresholds, intervals, Docker, Telegram)
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware (sessions, bcrypt)
│   └── services/
│       ├── metrics.js              # System metrics collection (CPU, RAM, Disk, Network)
│       ├── history.js              # History management (SQLite + JSON fallback)
│       ├── docker-simple.js         # Simplified Docker endpoints (containers + images)
│       ├── docker.js               # Complete Docker monitoring (dockerode)
│       ├── telegram.js             # Telegram notifications for alerts
│       ├── db-sqlite.js            # SQLite storage (tables: metrics, alerts, users, docker_*)
│       └── db.js                   # JSON storage fallback (deprecated)
├── frontend/
│   ├── index.html                  # Main dashboard (metrics, charts, alerts)
│   ├── login.html                  # Login page
│   ├── favicon.svg                 # Custom favicon (magnifying glass)
│   └── js/
│       ├── i18n.js                 # Internationalization management
│       └── translations/
│           ├── fr.json             # French translations
│           └── en.json             # English translations
├── data/                          # Historical data (created automatically)
│   └── vps_monitoring.db          # SQLite database
├── docker-compose.yml             # Docker Compose configuration for deployment
├── Dockerfile                     # Docker image for containerized deployment
├── package.json
├── README.md
├── ROADMAP.md
└── .env.example
```

---

## 🛠 Technical Stack

| Component | Technology | Version | Description |
|-----------|-------------|---------|-------------|
| **Backend** | Node.js + Express | v18+ | Web framework for API and routing |
| **Frontend** | Vanilla JS + HTML5 + CSS3 | - | Static interface with i18n |
| **Metrics** | `systeminformation` | v5.22.0 | System metrics collection |
| **Processes** | `ps aux` (command) | - | Reliable CPU/RAM percentage retrieval |
| **Logging** | `morgan` | v1.10+ | HTTP logging middleware |
| **Authentication** | `express-session` + `bcryptjs` | - | Session management and hashing |
| **Rate Limiting** | `express-rate-limit` | v7.1.5 | Protection against brute force attacks |
| **Environment** | `dotenv` | v16.3+ | Environment variable loading |
| **Database** | SQLite (`better-sqlite3`) | v11+ | Persistent metrics storage |
| **Charts** | Chart.js | v4.4.0 | Interactive visualization |
| **Docker** | `dockerode` | v4.0+ | Docker client for monitoring |
| **Notifications** | `axios` | v1.6.2 | HTTP requests for Telegram API |
| **Build** | `nodemon` | v3.0.2 | Automatic reload in development |

---

## 📊 Alert Threshold Configuration

Alert thresholds (CPU, RAM, Disk) are **configurable in two ways**:

### Via .env file
```ini
# Thresholds in percentage (0-100)
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90
```

### Via interface (recommended)
1. Click on the ⚙️ **Configuration** icon in the menu
2. Go to the **"Alert Thresholds"** section
3. Modify the values (0-100%) and save

Changes are applied **immediately** without server restart.

### Alert Levels
- **Warning (⚠️)**: CPU and RAM exceed threshold
- **Danger (🚨)**: Disk exceeds threshold

### Telegram Notifications
To receive Telegram notifications:
1. Enable Telegram in configuration
2. Configure your **Bot Token** (obtained via @BotFather)
3. Configure your **Chat ID** (use @getidsbot to find it)
4. Set the **cooldown** (1-1440 minutes) to prevent spam
5. Enable/disable resolution notification
6. Test the configuration with the "Test Telegram" button

---

## 📊 API Response Examples

### `/api/metrics`
```json
{
  "success": true,
  "data": {
    "cpu": {
      "usage": 45.2,
      "cores": 4,
      "model": "Intel(R) Xeon(R) CPU E5-2686 v4 @ 2.30GHz",
      "speed": 2300
    },
    "memory": {
      "used": 1845493760,
      "total": 4123113472,
      "free": 2277619712,
      "usagePercent": 44.7
    },
    "disk": {
      "used": 12345678,
      "total": 100000000,
      "free": 87654322,
      "usagePercent": 12.3
    },
    "network": {
      "download": 1234,
      "upload": 567,
      "status": "OK",
      "interface": "eth0"
    },
    "timestamp": "2026-06-30T12:00:00.000Z"
  }
}
```

### `/api/processes`
```json
{
  "success": true,
  "data": [
    {
      "pid": 1234,
      "name": "node",
      "cpu": 45.2,
      "mem": 12.5,
      "user": "debian"
    },
    {
      "pid": 5678,
      "name": "nginx",
      "cpu": 12.1,
      "mem": 8.3,
      "user": "root"
    }
  ],
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

### `/api/ports`
```json
{
  "success": true,
  "data": [
    {
      "port": 22,
      "address": "0.0.0.0",
      "pid": 1234,
      "process": "sshd",
      "protocol": "TCP",
      "state": "LISTEN"
    },
    {
      "port": 80,
      "address": "0.0.0.0",
      "pid": 5678,
      "process": "nginx",
      "protocol": "TCP",
      "state": "LISTEN"
    },
    {
      "port": 3000,
      "address": "127.0.0.1",
      "pid": 9012,
      "process": "node",
      "protocol": "TCP",
      "state": "LISTEN"
    }
  ],
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

### `/api/docker-simple`
```json
{
  "success": true,
  "data": {
    "available": true,
    "running": 3,
    "stopped": 1,
    "total": 4,
    "error": null
  },
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

### `/api/docker-detailed`
```json
{
  "success": true,
  "data": {
    "available": true,
    "containers": {
      "running": 3,
      "stopped": 1,
      "paused": 0,
      "total": 4,
      "details": [
        {
          "id": "abc123def456",
          "name": "web-app",
          "image": "nginx:latest",
          "state": "running",
          "status": "Up 2 hours",
          "ports": "0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp",
          "created": "2026-06-30T10:00:00.000Z",
          "command": "nginx -g daemon off;"
        }
      ]
    },
    "images": {
      "total": 5,
      "totalSize": 1234567890,
      "dangling": 0,
      "untagged": 1,
      "details": [...]
    },
    "dockerInfo": {
      "serverVersion": "24.0.7",
      "os": "Linux",
      "architecture": "x86_64",
      "cpus": 4,
      "memory": 8589934592
    },
    "error": null
  },
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

---

## 🎯 Roadmap

See [ROADMAP.md](ROADMAP.md) for next steps and project progress.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report a bug**: Open an [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues) with a detailed description.
2. **Request a feature**: Open an [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues) with the `enhancement` label.
3. **Contribute code**: Fork the repository, create a branch, and submit a Pull Request.
4. **Translations**: Help translate the interface into other languages by adding files to `frontend/js/translations/`.

---

## 📜 License

This project is licensed under **MIT**. See [LICENSE](LICENSE) for more details.

---

## 🙏 Acknowledgments

- [systeminformation](https://github.com/sebhildebrandt/systeminformation) for system metrics collection
- [Express.js](https://expressjs.com/) for the backend framework
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for high-performance SQLite storage
- [Chart.js](https://www.chartjs.org/) for interactive charts
- [dockerode](https://github.com/apoclyps/dockerode) for Docker monitoring
- [Font Awesome](https://fontawesome.com/) for icons
- To all contributors and users!

---

> *Last updated: **June 30, 2026** (Version 0.5.0 - Complete security audit, interval cleanup, multi-language support, advanced configuration, complete Docker monitoring).*
