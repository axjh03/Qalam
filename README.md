# Qalam - Full Stack Application

This is a monorepo containing both the backend and frontend applications for the Qalam project.

## Project Structure

```
├── qalam-backend/     # NestJS Backend (GraphQL API)
├── qalamFrontend/     # React Frontend (Vite)
└── README.md         # This file
```

## Tech Stack

### Backend (`qalam-backend/`)
- **Framework**: NestJS (Node.js/TypeScript)
- **API**: GraphQL with Apollo Server
- **Authentication**: JWT + Passport (GitHub, Google OAuth)
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **Deployment**: Render

### Frontend (`qalamFrontend/`)
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Apollo Client (GraphQL)
- **Routing**: React Router DOM
- **Deployment**: Netlify

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup
```bash
cd qalam-backend
npm install
npm run start:dev
```

### Frontend Setup
```bash
cd qalamFrontend
npm install
npm run dev
```

## Deployment

### Backend Deployment (Render)
The backend is configured to deploy on Render. See `qalam-backend/render.yaml` for configuration.

### Frontend Deployment (Netlify)
The frontend is configured to deploy on Netlify. See `qalamFrontend/netlify.toml` for configuration.

## Environment Variables

### Backend Environment Variables
Create a `.env` file in `qalam-backend/` with:
```
# Add your environment variables here
# Example:
# DATABASE_URL=your_database_url
# JWT_SECRET=your_jwt_secret
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### Frontend Environment Variables
Create a `.env` file in `qalamFrontend/` with:
```
# Add your environment variables here
# Example:
# VITE_API_URL=your_backend_url
```

## Development Workflow

1. Make changes in either `qalam-backend/` or `qalamFrontend/`
2. Test locally
3. Commit and push to GitHub
4. Automatic deployment will trigger on Render (backend) and Netlify (frontend)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 