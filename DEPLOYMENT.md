# Deployment Guide

This guide will help you deploy your Qalam application to Render (backend) and Netlify (frontend).

## Prerequisites

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
4. **AWS Account**: For DynamoDB and S3 (already configured in your backend)

## Backend Deployment (Render)

### Step 1: Prepare Environment Variables

Before deploying, you'll need to set up these environment variables in Render:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
AWS_DYNAMODB_TABLE=your_dynamodb_table_name

# OAuth Configuration (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 2: Deploy to Render

1. **Connect GitHub Repository**:
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" and select "Web Service"
   - Connect your GitHub account and select your repository

2. **Configure the Service**:
   - **Name**: `qalam-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Root Directory**: `qalam-backend`

3. **Set Environment Variables**:
   - Add all the environment variables listed above
   - Make sure to use strong, unique values for secrets

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Your backend will be available at: `https://your-app-name.onrender.com`

### Step 3: Verify Deployment

1. Check the health endpoint: `https://your-app-name.onrender.com/health`
2. You should see: `{"status":"ok","timestamp":"...","service":"qalam-backend"}`

## Frontend Deployment (Netlify)

### Step 1: Prepare Environment Variables

Create a `.env` file in the `qalamFrontend` directory:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 2: Deploy to Netlify

1. **Connect GitHub Repository**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Connect your GitHub account and select your repository

2. **Configure the Build**:
   - **Base directory**: `qalamFrontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Set Environment Variables**:
   - Go to Site settings > Environment variables
   - Add `VITE_API_URL` with your backend URL

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your frontend
   - Your frontend will be available at: `https://your-site-name.netlify.app`

### Step 3: Configure Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## Continuous Deployment

Both Render and Netlify support automatic deployments:

- **Render**: Automatically deploys when you push to the main branch
- **Netlify**: Automatically deploys when you push to the main branch

## Environment-Specific Configurations

### Development
```bash
# Backend
cd qalam-backend
npm run start:dev

# Frontend
cd qalamFrontend
npm run dev
```

### Production
- Backend runs on Render with production environment
- Frontend runs on Netlify with production build

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check the build logs in Render/Netlify
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Environment Variables**:
   - Double-check all environment variables are set correctly
   - Ensure no typos in variable names
   - Verify AWS credentials have proper permissions

3. **CORS Issues**:
   - Make sure your backend allows requests from your frontend domain
   - Check the CORS configuration in your NestJS app

4. **Health Check Failures**:
   - Verify the `/health` endpoint is working
   - Check if the application is starting correctly

### Useful Commands

```bash
# Check backend health
curl https://your-backend-url.onrender.com/health

# Check frontend build locally
cd qalamFrontend
npm run build
npm run preview

# Test backend locally
cd qalam-backend
npm run start:prod
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **AWS Permissions**: Use IAM roles with minimal required permissions
3. **HTTPS**: Both Render and Netlify provide HTTPS by default
4. **CORS**: Configure CORS to only allow your frontend domain

## Monitoring

1. **Render**: Monitor logs and performance in the Render dashboard
2. **Netlify**: Check build status and deployment history
3. **AWS**: Monitor DynamoDB and S3 usage in AWS Console

## Cost Optimization

1. **Render**: Free tier available for development
2. **Netlify**: Free tier available for personal projects
3. **AWS**: Monitor usage to avoid unexpected charges

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **NestJS Deployment**: [docs.nestjs.com/deployment](https://docs.nestjs.com/deployment) 