
# Self-Hosting SLYNC

This document provides instructions for self-hosting the SLYNC application, a productivity tool that syncs your notes, bookmarks, and todos with GitHub.

## Requirements

- Node.js 18+ 
- A GitHub account
- A registered GitHub OAuth application (see below)

## Setting Up a GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "New OAuth App"
3. Fill in the following information:
   - **Application name**: SLYNC
   - **Homepage URL**: `https://yourdomain.com` (or the URL where your app will be hosted)
   - **Application description**: "Self-hosted productivity suite with GitHub sync" (optional)
   - **Authorization callback URL**: `https://yourdomain.com/auth/callback`
4. Click "Register application"
5. On the next screen, check "Enable Device Flow" 
6. Note your `Client ID` and generate a `Client Secret`

## Deployment Options

### Option 1: Docker (Recommended)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  slync:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GITHUB_CLIENT_ID=your_client_id
      - GITHUB_CLIENT_SECRET=your_client_secret
    restart: unless-stopped
```

Start the application with:

```bash
docker-compose up -d
```

### Option 2: Manual Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/slync.git
   cd slync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

- `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
- `PORT`: Server port (default: 3000)

## Supported File Formats

### Bookmarks
- HTML (.html) - Standard browser export format
- JSON (.json) - Structured data format
- CSV (.csv) - Simple spreadsheet format

### Notes
- Markdown (.md) - GitHub-friendly format
- Plain Text (.txt) - Universal compatibility
- JSON (.json) - For notes with structured metadata

### To-Do Lists
- Markdown (.md) - GitHub-style task lists
- CSV (.csv) - Spreadsheet format
- JSON (.json) - Structured format
- iCalendar (.ics) - Calendar format with due dates

## Repository Structure

```
slync/
├── notes/                # Markdown notes with tags
│   ├── work/             # Example folder
│   └── personal/         # Example folder
├── bookmarks/            # Bookmark collections
│   └── collections/      # Organized bookmarks
├── todos/                # Todo lists
├── config/               # App configuration
├── .gitignore            # Git ignore file
└── README.md             # Setup instructions
```

## Security Considerations

- Store your GitHub OAuth credentials securely
- Use HTTPS for production deployments
- Consider adding authentication if deploying to a public server

## Need Help?

If you encounter any issues while self-hosting SLYNC, please open an issue on the repository or refer to the documentation.
