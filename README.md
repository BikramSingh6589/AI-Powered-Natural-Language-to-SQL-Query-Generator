# SQL Analyzer - AI-Powered Natural Language to SQL Query Generator

An intelligent AI-powered system that converts natural language user requirements into SQL queries. The system enables users with little or no database knowledge to interact with databases using simple English sentences and automatically generate valid SQL statements.

## Features

- **Natural Language to SQL**: Convert English sentences into SQL queries using AI
- **CSV Upload**: Import data from CSV files
- **Database Connection**: Connect to PostgreSQL databases
- **Query Execution**: Run generated queries and view results
- **Query History**: Track and manage previously executed queries
- **Export Results**: Export query results to various formats
- **AI-Powered Validation**: Validate and optimize SQL queries
- **User Authentication**: Secure login/register system
- **Responsive UI**: Modern, intuitive user interface

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Groq AI (for SQL generation)
- JWT Authentication
- Cloudinary (file storage)

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Framer Motion
- Lucide Icons

## Project Structure

```
SQL_Analyzer/
├── backend/          # Backend API server
│   ├── prisma/       # Database schema and migrations
│   ├── src/          # Source code
│   │   ├── config/   # Configuration files
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── public/
└── Resource/         # Documentation files
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn
- Groq API key

### Installation

#### 1. Clone the repository

```bash
git clone <repository-url>
cd SQL_Analyzer
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sql_analyzer?schema=public"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
GROQ_API_KEY="your-groq-api-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

Run database migrations:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Start the backend server:

```bash
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory (copy from `.env.example`):

```env
VITE_API_URL="http://localhost:3000/api"
```

Start the frontend development server:

```bash
npm run dev
```

### Docker Setup

Alternatively, you can run the application using Docker:

```bash
docker-compose up --build
```

## Usage

1. **Register/Login**: Create an account or log in
2. **Connect Database**: Connect to your PostgreSQL database or upload a CSV file
3. **Generate SQL**: Describe your query in natural language
4. **Execute Query**: Run the generated SQL and view results
5. **Export Results**: Download results in your preferred format

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-otp` - Verify OTP

### Queries
- `POST /api/query/generate` - Generate SQL from natural language
- `POST /api/query/execute` - Execute SQL query
- `GET /api/query/history` - Get query history

### CSV
- `POST /api/csv/upload` - Upload CSV file
- `GET /api/csv/tables` - Get CSV tables

### Export
- `POST /api/export` - Export query results

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC
