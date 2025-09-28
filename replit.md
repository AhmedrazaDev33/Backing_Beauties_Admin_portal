# Bakery Business Admin Panel

## Overview

This is a comprehensive bakery business management system built as a modern web application. The system provides a complete admin panel for managing orders, customers, and business analytics for a bakery business called "The Baking Beauties". It features a warm, pink-themed design that reflects the bakery's brand while maintaining professional admin dashboard functionality.

The application handles the core business operations including order management with image uploads for custom cakes, customer relationship management, delivery tracking, and business analytics. It's designed to streamline bakery operations from order placement to delivery with automated reminders and comprehensive reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system featuring bakery-themed pink color palette
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Upload**: Multer middleware for handling cake image uploads
- **API Design**: RESTful API with comprehensive CRUD operations for orders and customers
- **Session Management**: Express sessions with PostgreSQL session store

### Data Storage Solutions
- **Primary Database**: PostgreSQL for relational data storage
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **File Storage**: Local file system storage for uploaded cake images
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple

### Authentication and Authorization
- **Session-based Authentication**: Express sessions for user state management
- **No Complex Auth**: Simple session-based approach suitable for single-tenant bakery business
- **CSRF Protection**: Built-in session security measures

### Design System
- **Theme**: Custom pink-based color palette reflecting bakery brand identity
- **Typography**: Inter font family for clean, professional appearance
- **Dark Mode**: Complete dark/light theme support with system preference detection
- **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities
- **Component Library**: Consistent design tokens and reusable components

### Key Features Architecture
1. **Order Management**: Full CRUD operations with image upload, status tracking, and delivery date management
2. **Customer Management**: Customer database with order history and search functionality
3. **Dashboard Analytics**: Real-time metrics, revenue tracking, and upcoming order alerts
4. **File Upload System**: Secure image upload handling for custom cake orders
5. **Search and Filtering**: Advanced filtering by date ranges, status, and customer
6. **Responsive UI**: Mobile-optimized interface for on-the-go management

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching solution
- **wouter**: Lightweight routing library for React applications
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Validation resolvers for react-hook-form

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant generation for components
- **clsx**: Conditional className utility
- **lucide-react**: Modern icon library

### Backend Dependencies
- **express**: Web application framework for Node.js
- **drizzle-orm**: Type-safe ORM for database operations
- **@neondatabase/serverless**: Neon Database client for serverless PostgreSQL
- **multer**: Middleware for handling multipart/form-data (file uploads)
- **connect-pg-simple**: PostgreSQL session store for Express

### Development Tools
- **typescript**: Static type checking
- **vite**: Build tool and development server
- **drizzle-kit**: Database migration and schema management
- **esbuild**: Fast JavaScript bundler for production builds

### Date and Utility Libraries
- **date-fns**: Modern date utility library
- **zod**: TypeScript-first schema validation
- **nanoid**: URL-safe unique ID generator

### Email Integration
- **@sendgrid/mail**: Email service integration for automated notifications

### Development and Replit Integration
- **@replit/vite-plugin-***: Replit-specific development plugins for enhanced development experience