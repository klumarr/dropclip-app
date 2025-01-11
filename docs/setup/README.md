# DropClip Setup Guide

This guide provides detailed instructions for setting up the DropClip development environment.

## Prerequisites

### Required Software
- Node.js (v18.19.0)
- npm (v8.0.0 or higher)
- Git
- AWS CLI
- PostgreSQL

### AWS Account Setup
1. Create an AWS account
2. Configure AWS CLI with appropriate credentials
3. Set up required AWS services:
   - S3
   - CloudFront
   - Cognito
   - RDS (PostgreSQL)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dropclip-app.git
   cd dropclip-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment files:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```env
   VITE_AWS_REGION=your-region
   VITE_AWS_COGNITO_USER_POOL_ID=your-user-pool-id
   VITE_AWS_COGNITO_CLIENT_ID=your-client-id
   VITE_AWS_S3_BUCKET=your-bucket-name
   VITE_AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain
   ```

## Development Environment Setup

### IDE Configuration
1. Install Visual Studio Code
2. Install recommended extensions:
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features

### Code Quality Tools
1. ESLint configuration is provided in `.eslintrc.json`
2. TypeScript configuration is in `tsconfig.json`
3. Husky hooks are set up for pre-commit checks

### Database Setup
1. Install PostgreSQL
2. Create a new database:
   ```sql
   CREATE DATABASE dropclip;
   ```
3. Run migrations:
   ```bash
   npm run migrate
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the application:
   - Open http://localhost:5173 in your browser
   - Use the development credentials provided in `.env.local`

## Testing

1. Run unit tests:
   ```bash
   npm run test
   ```

2. Run E2E tests:
   ```bash
   npm run test:e2e
   ```

## Common Issues and Solutions

### AWS Configuration
- Ensure AWS credentials are properly configured
- Verify all required AWS services are set up
- Check IAM permissions

### Database Connection
- Verify PostgreSQL is running
- Check database credentials
- Ensure proper network access

### Development Server
- Clear npm cache if modules are not loading
- Check for port conflicts
- Verify environment variables

## Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Material-UI Documentation](https://mui.com/)

## Support

For additional support:
1. Check the issue tracker
2. Review existing documentation
3. Contact the development team

## Auth Types

Creating auth types file with necessary interfaces.