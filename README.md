# Vehicle Tracking System (Monorepo)

[![Tests & Coverage](https://github.com/pouladzade/vehicle-tracking/actions/workflows/test.yml/badge.svg)](https://github.com/pouladzade/vehicle-tracking/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/pouladzade/vehicle-tracking/branch/main/graph/badge.svg)](https://codecov.io/gh/pouladzade/vehicle-tracking)

A vehicle tracking system built with Next.js and Express.js in a monorepo architecture.

## Project Structure

```
/vehicle-tracking
  /packages
    /backend     # Express.js API
    /frontend    # Next.js frontend
  /shared        # Shared types and utilities
  docker-compose.yml      # Development setup
```

## Repository Notes

- **Log and Environment Files**: Log files and environment (.env) files are intentionally included in this repository to facilitate easier setup and debugging for development purposes. In a production environment, these would typically be gitignored.

## Features

- **Backend API**

  - RESTful endpoints for all entities
  - PostgreSQL database with repositories
  - Authentication
  - Logging and error handling

- **Frontend (Next.js)**

  - Modern UI with Tailwind CSS
  - Vehicle, Driver and Trip dashboard
  - Vehicle position tracking

- **Shared Code**
  - TypeScript interfaces
  - Consistent type definitions across frontend and backend

## Requirements

- Node.js 20+
- Docker and Docker Compose
- yarn

## Getting Started

### Development

1. Clone the repository:

```bash
git clone https://github.com/pouladzade/vehicle-tracking.git
cd vehicle-tracking
```

2. Build and start the production containers:

```bash
docker-compose up
```

Or for a clean start

```bash
docker-compose down -v --rmi all --remove-orphans
docker-compose build && docker-compose up
```

3. Access the applications:
   - Backend API: http://localhost:5000/api
   - Backend API Docs: http://localhost:5000/api-docs
   - Frontend: http://localhost:3000

### Sample Login Credentials

The application is pre-populated with two sample customers that you can use to log in:

1. **Speedy Logistics**

   - Email: contact@speedylogistics.com
   - Customer ID: 1

2. **Global Transit Solutions**
   - Email: info@globaltransit.com
   - Customer ID: 2

You can use either the email address or customer ID to log in to the system.

### Working on the Backend

The backend code is located in the `backend` directory. It's a standard Express.js application with TypeScript.

### Working on the Frontend

The frontend code is located in the `frontend` directory. It's a Next.js application with TypeScript and Tailwind CSS.

### Working on Shared Code

The shared code is located in the `shared` directory. It contains TypeScript interfaces and utility functions used by both the backend and frontend.

## Testing and Code Coverage

Tests are set up with Jest and can be run with the following commands:

```bash
cd backend
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage
```

Coverage reports are generated in the `backend/coverage` directory. You can:
View the HTML report by opening `backend/coverage/lcov-report/index.html` in your browser

## License

MIT
