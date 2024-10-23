# Document Manager Client

## Project Overview

This project is the frontend application for the **Document Manager**. It handles user interactions, rendering data, and enforcing role-based access control (RBAC) using **Permit.io** and **CASL.js** for frontend authorization.

The application is built using:
- **React/Next.js**
- **TypeScript**
- **TailwindCSS** for styling
- **Permit.io** for role-based access control
- **CASL.js** for frontend permission checks
- **Clerk** for user authentication

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Features](#features)

## Tech Stack
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Authorization**: CASL.js, Permit.io
- **Authentication**: Clerk
- **State Management**: React Context API
- **API Client**: Axios
- **Package Manager**: Yarn / npm

## Installation

To get started, clone the repository and install dependencies.

```bash
git clone https://github.com/yourusername/document-manager-client.git
cd document-manager-client
yarn install


## Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```bash
NEXT_PUBLIC_CLERK_FRONTEND_API=your-clerk-frontend-api
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api # Backend API URL
NEXT_PUBLIC_PERMIT_BACKEND_URL=http://localhost:5000/api/policies
```

## Project Structure
Here's a high-level overview of the project structure:
```bash
.
├── components/          # Reusable UI components
├── context/             # React context for global states (AppContext)
├── pages/               # Next.js pages
├── public/              # Static assets
├── styles/              # Global CSS files (Tailwind)
├── lib/                 # Axios API client and Permit SDK initialization
└── README.md            # Project documentation
```
## Authentication
This app uses Clerk for authentication. The ClerkProvider wraps the entire app, and SignedIn and SignedOut components handle protected routes.

For sign-in and sign-up flows, refer to:
```jsx
import { SignInButton } from '@clerk/nextjs';

// Usage
<SignInButton>
  <Button className="bg-primary text-white px-6 py-3">Sign In</Button>
</SignInButton>
```

## Authorization
We use CASL.js in combination with Permit.io to manage permissions. User permissions are loaded based on their role assignments and resource instances.
- CASL.js manages frontend permissions.
- Permit.io checks against the backend policy server for role assignments and access rights.

Example of Permission Check:

```tsx
const { checkPermission } = useApp();

const canCreateDocument = await checkPermission('create', 'Document', 'document_id');
if (canCreateDocument) {
  // Show Create Document button
}
```

## Features
- Role-based Dashboard: User interface adapts based on user roles like Viewer, Editor, Owner.
- Document and Category Management: Users can create, edit, or delete documents and categories based on roles.
- Frontend Authorization: Enforces permission checks in real-time.
- Authentication with Clerk: Simple and secure user login flow.