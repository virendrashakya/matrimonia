# Deployment Guide: MERN Stack on AWS EC2

This guide outlines the steps to deploy the Matrimonia application to an AWS EC2 instance running Ubuntu.

## Prerequisites

- AWS Account
- Domain name (optional, but recommended for SSL)
- SSH Key Pair for accessing the EC2 instance
- **Configuration Details**: See [CONFIGURATION.md](./CONFIGURATION.md) for required environment variables.

## 1. Launch EC2 Instance

1.  **Log in to AWS Console** and navigate to EC2.
2.  **Launch Instance**:
    -   **Name**: `matrimonia-server`
    -   **OS**: Ubuntu Server 22.04 LTS (HVM)
    -   **Instance Type**: `t2.micro` or `t3.micro` (Free Tier eligible)
    -   **Key Pair**: Create a new one or select an existing one. Download the `.pem` file.
    -   **Network Settings**:
        -   Allow SSH traffic from your IP (or Anywhere `0.0.0.0/0`).
        -   Allow HTTP traffic from the internet.
        -   Allow HTTPS traffic from the internet.
3.  **Launch** and wait for the instance to be running.

## 2. Connect to Instance

Open your terminal and use the downloaded key pair:

```bash
chmod 400 keypair.pem
ssh -i "keypair.pem" ubuntu@<your-ec2-public-ip>
```

## 3. Server Setup

Update packages and install necessary tools:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git nginx
```

### Install Node.js (v18.x)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## 4. Clone Repository

```bash
cd ~
git clone https://github.com/virendrashakya/matrimonia.git
cd matrimonia
```

## 5. Backend Deployment

1.  **Install Dependencies**:

    ```bash
    cd backend
    npm install
    ```

2.  **Configure Environment**:
    Create a `.env` file with your production secrets.

    ```bash
    nano .env
    ```

    Paste your environment variables (ensure `NODE_ENV=production`):

    > See [CONFIGURATION.md](./CONFIGURATION.md) for a full list of available keys.

    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_strong_secret
    NODE_ENV=production
    FRONTEND_URL=http://<your-domain-or-ip>
    
    # External Services (Recommended)
    CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    ```

3.  **Start Backend (Using Ecosystem File)**:

    Create a file named `ecosystem.config.js` in the backend root for better management:

    ```javascript
    module.exports = {
      apps : [{
        name   : "matrimonia-api",
        script : "./src/app.js",
        env_production: {
           NODE_ENV: "production",
           PORT: 3000
        }
      }]
    }
    ```

    Start the application:

    ```bash
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
    ```

## 6. Frontend Deployment

1.  **Install Dependencies and Build**:

    ```bash
    cd ../frontend
    npm install
    
    # Create production env file if needed
    nano .env.production
    # Add: VITE_API_URL=http://<your-domain-or-ip>/api
    
    npm run build
    ```

    This creates a `dist` folder. We will serve this using Nginx.

2.  **Move Build Files** (Optional standard location):

    ```bash
    sudo mkdir -p /var/www/matrimonia
    sudo cp -r dist/* /var/www/matrimonia/
    # Grant permissions
    sudo chown -R www-data:www-data /var/www/matrimonia
    sudo chmod -R 755 /var/www/matrimonia
    ```

## 7. Configure Nginx

Create a new configuration block:

```bash
sudo nano /etc/nginx/sites-available/matrimonia
```

Add the following (replace `<your-domain-or-ip>`):

```nginx
server {
    listen 80;
    server_name <your-domain-or-ip>;

    root /var/www/matrimonia;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/matrimonia /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Security Groups & Firewall (Critical)

Ensure your AWS **Security Group** (Inbound Rules) allows:
-   **SSH (22)**: My IP
-   **HTTP (80)**: Anywhere (0.0.0.0/0)
-   **HTTPS (443)**: Anywhere (0.0.0.0/0)
-   *(Optional)* **Custom (3000)**: If you want to test backend directly (Not recommended, use Nginx proxy).

-   *(Optional)* **Custom (3000)**: If you want to test backend directly (Not recommended, use Nginx proxy).

## 8. Database Options (Production)

For production, you have two primary options for MongoDB:

### Option A: MongoDB Atlas (Managed Service) - **Recommended**
The easiest and most secure way.
1.  Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **Deployment** (Shared Tier M0 is free, M10+ for production performance).
3.  **Network Access**: Whitelist your EC2 instance's IP address (or `0.0.0.0/0` temporarily).
4.  **Database Access**: Create a database user.
5.  Get connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/matrimonia?retryWrites=true&w=majority`

### Option B: Self-Hosted on EC2 inside (Same Instance)
Cheaper for small scale, but requires manual maintenance.
1.  Install MongoDB Community Edition:
    ```bash
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt update
    sudo apt install -y mongodb-org
    ```
2.  Start Service:
    ```bash
    sudo systemctl start mongod
    sudo systemctl enable mongod
    ```
3.  Secure Installation:
    -   Edit `/etc/mongod.conf` to bind to localhost (`127.0.0.1`) only.
    -   Enable authorization in config.
    -   Create an admin user.
4.  Connection String: `mongodb://<user>:<password>@localhost:27017/matrimonia?authSource=admin`

## 9. SSL Configuration (Recommended)

If you have a domain name pointing to your EC2 IP:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <your-domain-name>
```

Follow the prompts to enable HTTPS redirect.

## Verification

1.  Open your browser to `http://<your-ec2-public-ip>` (or your domain).
2.  The frontend should load.
3.  Test an API call (e.g., login or register) to ensure backend connectivity.

## Maintenance

-   **Logs**: `pm2 logs`
-   **Restart Backend**: `pm2 restart matrimonia-api`
-   **Update Code**:
    ```bash
    git pull origin main
    # Rebuild frontend if needed
    cd frontend && npm install && npm run build && sudo cp -r dist/* /var/www/matrimonia/
    # Restart backend if needed
    cd ../backend && npm install && pm2 restart matrimonia-api
    ```

    ```

## 9. Database Backup & Management

It is critical to backup your MongoDB data regularly.

### Manual Backup (mongodump)
```bash
# Backup all databases to a 'dump' folder
mongodump --uri="your_mongodb_connection_string" --out=/home/ubuntu/backups/$(date +%F)

# Zip it for download
tar -czvf backup-$(date +%F).tar.gz /home/ubuntu/backups/$(date +%F)
```

### Restore (mongorestore)
```bash
mongorestore --uri="your_mongodb_connection_string" /path/to/backup/dump
```

## 10. Automated Deployment (GitHub Actions)

To enable "push-to-deploy", configure the following secrets in your GitHub Repository settings (**Settings** > **Secrets and variables** > **Actions** > **New repository secret**):

| Secret Name | Description |
| :--- | :--- |
| `EC2_HOST` | The Public IP address of your EC2 instance. |
| `EC2_USER` | The username for SSH access (usually `ubuntu`). |
| `EC2_SSH_KEY` | The **entire content** of your `.pem` key file (including `-----BEGIN RSA PRIVATE KEY-----`). |

**Workflow:**
1.  Push code to the `main` branch.
2.  GitHub Actions will automatically SSH into your server, pull the latest code, install dependencies, build the frontend, and restart the backend.

