# Qalam Project Setup Guide

This guide will help you set up the Qalam project locally and prepare it for deployment.

## Project Overview

Qalam is a full-stack social media application with:
- **Backend**: NestJS with GraphQL, JWT authentication, AWS integration
- **Frontend**: React with Vite, TailwindCSS, Apollo Client

## Quick Start

### 1. Clone and Setup

```bash
# Clone your repository
git clone <your-repo-url>
cd blog

# Make the development script executable
chmod +x scripts/dev.sh

# Start both backend and frontend
./scripts/dev.sh
```

### 2. Manual Setup (Alternative)

If you prefer to start services manually:

```bash
# Backend
cd qalam-backend
npm install
npm run start:dev

# Frontend (in a new terminal)
cd qalamFrontend
npm install
npm run dev
```

## Environment Configuration

### Backend Environment Variables

Create `.env` file in `qalam-backend/`:

```env
# Node Environment
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
AWS_DYNAMODB_TABLE=your-dynamodb-table-name

# OAuth Configuration (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend Environment Variables

Create `.env` file in `qalamFrontend/`:

```env
VITE_API_URL=http://localhost:3000
```

## AWS Setup

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket with your preferred name
3. Configure CORS for your bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 2. Create DynamoDB Table

1. Go to AWS DynamoDB Console
2. Create a new table with:
   - **Table name**: `qalam-users` (or your preferred name)
   - **Partition key**: `userId` (String)
   - **Sort key**: `username` (String)

### 3. Create IAM User

1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach policies for S3 and DynamoDB access
4. Save the Access Key ID and Secret Access Key

## Development Workflow

### 1. Local Development

```bash
# Start development environment
./scripts/dev.sh

# Or manually:
# Terminal 1: Backend
cd qalam-backend && npm run start:dev

# Terminal 2: Frontend
cd qalamFrontend && npm run dev
```

### 2. Testing

```bash
# Backend tests
cd qalam-backend
npm run test

# Frontend tests (if configured)
cd qalamFrontend
npm run test
```

### 3. Building

```bash
# Backend build
cd qalam-backend
npm run build

# Frontend build
cd qalamFrontend
npm run build
```

## Deployment Preparation

### 1. GitHub Repository

1. Create a new repository on GitHub
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Environment Variables for Production

Before deploying, prepare these environment variables:

#### Render (Backend)
- `NODE_ENV=production`
- `PORT=3000`
- `JWT_SECRET=your_production_jwt_secret`
- `AWS_ACCESS_KEY_ID=your_aws_key`
- `AWS_SECRET_ACCESS_KEY=your_aws_secret`
- `AWS_REGION=your_aws_region`
- `AWS_S3_BUCKET=your_s3_bucket`
- `AWS_DYNAMODB_TABLE=your_dynamodb_table`

#### Netlify (Frontend)
- `VITE_API_URL=https://your-backend-url.onrender.com`

## Project Structure

```
blog/
├── qalam-backend/          # NestJS Backend
│   ├── src/               # Source code
│   ├── package.json       # Backend dependencies
│   ├── render.yaml        # Render deployment config
│   └── .env              # Backend environment variables
├── qalamFrontend/         # React Frontend
│   ├── src/              # Source code
│   ├── package.json      # Frontend dependencies
│   ├── netlify.toml      # Netlify deployment config
│   └── .env             # Frontend environment variables
├── scripts/
│   └── dev.sh           # Development script
├── .github/
│   └── workflows/
│       └── ci.yml       # GitHub Actions CI
├── README.md            # Main project documentation
├── DEPLOYMENT.md        # Deployment guide
├── SETUP.md            # This file
└── .gitignore          # Git ignore rules
```

## Available Scripts

### Root Level
- `./scripts/dev.sh` - Start both backend and frontend in development mode

### Backend (`qalam-backend/`)
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter

### Frontend (`qalamFrontend/`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

2. **Node Modules Issues**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment Variables Not Loading**
   - Ensure `.env` files are in the correct directories
   - Restart the development servers
   - Check for typos in variable names

4. **AWS Connection Issues**
   - Verify AWS credentials are correct
   - Check AWS region matches your resources
   - Ensure IAM user has proper permissions

### Getting Help

1. Check the logs in your terminal
2. Verify all environment variables are set
3. Ensure AWS resources are properly configured
4. Check the deployment guide for production issues

## Next Steps

1. **Local Development**: Start with `./scripts/dev.sh`
2. **Testing**: Run tests to ensure everything works
3. **Deployment**: Follow the `DEPLOYMENT.md` guide
4. **Customization**: Modify the code to fit your needs

## Support

- **Backend Issues**: Check NestJS documentation
- **Frontend Issues**: Check React and Vite documentation
- **AWS Issues**: Check AWS documentation
- **Deployment Issues**: Check Render and Netlify documentation 