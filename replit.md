# Gaming Portal - Full-Stack Application

## Overview
A comprehensive gaming platform built with React + Vite frontend and Express backend. This is a fully-featured gaming community website with user authentication, game management, blogging, tournaments, and various social features.

## Recent Changes
- **2025-09-28**: Successfully imported and configured for Replit environment
- Fixed database enum seeding issues in automated messaging templates
- Configured frontend proxy settings for Replit compatibility
- Set up deployment configuration with autoscale target

## Project Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite development server
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Port**: 5000 (configured for Replit webview)

### Backend (Express + Node.js)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js (Local, Google, Facebook strategies)
- **Session Management**: PostgreSQL-backed sessions
- **Security**: Helmet, rate limiting, input sanitization
- **Port**: 5000 (serves both frontend and API)

### Key Features
- User authentication and verification system
- Game library with categories and search
- Blog system with rich text editing
- Tournament and event management
- Room/voice chat functionality
- Payment integration (Stripe, PayPal, etc.)
- Admin dashboard with comprehensive controls
- Push notifications
- SEO optimization tools
- Translation/internationalization support

## Configuration

### Environment Setup
- **Development**: Uses Vite dev server with HMR
- **Production**: Builds to static files served by Express
- **Database**: PostgreSQL with automatic seeding on startup
- **Host Configuration**: Configured for Replit proxy (`allowedHosts: true`)

### Deployment
- **Target**: Autoscale (stateless web application)
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port**: 5000 (only non-firewalled port on Replit)

## User Preferences
- Project successfully imported from GitHub
- Database seeding working correctly with comprehensive demo data
- All major features functional and tested
- Proper security configurations in place

## Development Notes
- Application includes extensive API integrations (AI content, payment gateways, etc.)
- Rich admin interface for managing all aspects of the platform
- Comprehensive seeding system for demo data
- WebSocket support for real-time features
- Object storage integration for file uploads

## Status
✅ **Ready for Production** - All systems operational and properly configured for Replit environment.