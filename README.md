# LeadFlow CRM

A modern SaaS CRM web application built for managing leads, customers,
sales opportunities and follow-up activities.

🌐 Live Demo: https://lead-flow-crm-woad.vercel.app

## Features

- User authentication
- Lead management
- Customer management
- Sales pipeline
- Opportunities tracking
- Activities and follow-ups
- Dashboard with business statistics
- Sales analytics and charts
- Lead status and priority management
- Responsive modern interface
- Secure user-specific data

## Tech Stack

- React
- Vite
- JavaScript
- React Router
- Supabase
- Supabase Authentication
- PostgreSQL
- Chart.js
- Lucide React
- CSS

## Screenshots

### Dashboard
Add dashboard screenshot here

### Leads Management
Add leads screenshot here

### Sales Pipeline
Add pipeline screenshot here

## How It Works

Users can create an account and manage their sales workflow from one
dashboard. Each user has access only to their own CRM data.

LeadFlow CRM allows users to track leads through different stages:

New → Contacted → Qualified → Proposal → Won / Lost

## Security

The application uses Supabase Authentication and Row Level Security (RLS)
to protect user data.

Each authenticated user can only access and manage their own records.

## Run Locally

Clone the repository:

git clone https://github.com/VectorForge-prime/LeadFlow-CRM.git

Install dependencies:

npm install

Create a `.env` file and add:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

Start the development server:

npm run dev

## Deployment

The application is deployed with Vercel.

## Project Purpose

This project demonstrates the development of a complete SaaS-style CRM
application including authentication, database integration, CRUD operations,
sales workflow management, analytics and deployment.

## Author

Developed by VectorForge-prime
