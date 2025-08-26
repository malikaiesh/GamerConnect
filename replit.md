# Overview

This is a comprehensive gaming portal platform that provides an online gaming experience with content management capabilities. The system consists of a React frontend with a Node.js/Express backend, using PostgreSQL with Drizzle ORM for data management. It features game hosting, blog management, user authentication, admin dashboard, SEO optimization, and various content management tools.

## Recent Updates (August 26, 2025)

- **SEO Schema Library Complete**: Successfully resolved all frontend API configuration issues and implemented fully functional SEO Schema Library with 50+ working schemas
- **GitHub Repository Live**: Successfully pushed complete codebase to GitHub at https://github.com/malikaiesh/GamerConnect with professional documentation
- **Frontend Fixes**: Fixed all fetch API calls, resolved Create Schema modal text visibility for dark theme, and implemented working CRUD operations
- **Professional Documentation**: Created comprehensive GitHub setup guide, enhanced README.md, and proper .gitignore for professional repository
- **Production Ready**: Application is fully functional with working admin dashboard, SEO schema management, and ready for deployment

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and developer experience
- **Routing**: Wouter for lightweight client-side routing with lazy loading for performance optimization
- **UI Components**: Radix UI primitives with shadcn/ui design system for consistent, accessible interface
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Rich Text Editor**: TinyMCE integration for content creation and editing

## Backend Architecture
- **Framework**: Express.js with TypeScript for scalable API development
- **Authentication**: Passport.js with local, Google OAuth, and Facebook OAuth strategies
- **Session Management**: Express sessions with PostgreSQL store for persistence
- **File Upload**: Multer middleware for handling image and file uploads
- **Security**: Role-based access control with permissions system, password reset tokens, and session tracking

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Schema**: Comprehensive schema including users, games, blog posts, static pages, settings, notifications, and analytics
- **Migrations**: Manual migration scripts for database schema updates
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Content Management
- **Games**: Support for both API-sourced (GameMonetize) and custom games with categories, ratings, and play tracking
- **Blog System**: Full-featured blog with categories, internal linking, and SEO optimization
- **Static Pages**: Dynamic page management for about, contact, privacy, terms, and custom pages
- **Smart Image Processing**: Automated image compression, WebP conversion, and AI-generated SEO alt text
  - Automatic compression with up to 80% size reduction
  - WebP format conversion for faster loading
  - AI-powered SEO-optimized alt text generation using OpenAI GPT-4 Vision
  - Responsive image resizing with quality optimization
- **Media Management**: File upload system with organized storage structure

## SEO and Performance
- **Sitemap Generation**: Automated XML sitemap creation for games, blog posts, and static pages
- **URL Management**: Custom URL redirects with status code support
- **Meta Management**: Dynamic meta tags and Open Graph integration
- **Performance**: Lazy loading, image optimization, and caching strategies

## Administrative Features
- **Dashboard**: Comprehensive admin panel with analytics and system management
- **User Management**: Role-based permissions with admin, moderator, content editor, and analyst roles
- **Content Moderation**: Tools for managing games, blog posts, and user-generated content
- **System Settings**: Site configuration, API key management, and feature toggles

# External Dependencies

## Third-Party Services
- **GameMonetize API**: External game content integration with API key management
- **SendGrid**: Email service for transactional emails and notifications
- **Google OAuth**: Social authentication provider
- **Facebook OAuth**: Social authentication provider
- **OpenAI API**: AI-powered image analysis for automatic SEO alt text generation

## Development Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Static type checking across frontend and backend
- **Drizzle Kit**: Database migration and introspection tools
- **ESBuild**: Fast bundling for production builds

## UI Libraries
- **Radix UI**: Headless UI components for accessibility and consistency
- **Lucide React**: Icon library for consistent iconography
- **TinyMCE**: Rich text editor for content creation

## Hosting and Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **File System**: Local file storage for uploaded media with organized directory structure
- **Static Assets**: Client-side static file serving with proper MIME types

## Analytics and Monitoring
- **Custom Analytics**: Built-in analytics system for tracking user engagement and system performance
- **Session Tracking**: Detailed user session management with device and location information
- **Push Notifications**: Web push notification system for user engagement