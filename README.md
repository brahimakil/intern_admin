# Internship Admin - Management Platform

A secure, TypeScript-based React admin authentication system with Firebase integration, featuring role-based access control, modern dashboard layout, and real-time statistics.

## 🚀 Features

- **Firebase Authentication**: Secure email/password authentication
- **Role-Based Access Control**: Admin and Company user roles with protected routes
- **Real-time Dashboard**: Live statistics from Firestore (students, companies, internships, applications)
- **Modern UI**: Professional design with CSS modules, smooth animations, and responsive layout
- **TypeScript**: Fully typed codebase for better developer experience
- **Responsive Design**: Mobile-first approach with collapsible sidebar

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Authentication and Firestore enabled

## 🛠️ Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd internship_admin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Firebase configuration is already set up in `/src/firebase/config.ts`
   - **Important**: Configure Firebase Security Rules in your Firebase Console

## 🔥 Firebase Setup

### Required Firestore Collections

Create the following collections in your Firebase Firestore:

1. **users** - User authentication data
   ```javascript
   {
     email: "admin@example.com",
     role: "admin" | "company" | "student",
     createdAt: Timestamp
   }
   ```

2. **companies** - Company information
   ```javascript
   {
     name: "Company Name",
     email: "company@example.com",
     status: "active" | "inactive",
     industry: "Tech",
     location: "City, Country",
     description: "...",
     createdAt: Timestamp
   }
   ```

3. **internships** - Internship postings
   ```javascript
   {
     companyId: "company_doc_id",
     title: "Software Engineer Intern",
     description: "...",
     status: "open" | "closed",
     location: "Remote",
     duration: "3 months",
     requirements: ["skill1", "skill2"],
     createdAt: Timestamp
   }
   ```

4. **applications** - Student applications
   ```javascript
   {
     userId: "student_doc_id",
     internshipId: "internship_doc_id",
     companyId: "company_doc_id",
     status: "pending" | "accepted" | "rejected",
     appliedAt: Timestamp
   }
   ```

### Firestore Security Rules

Configure these security rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isCompany() {
      return isAuthenticated() && getUserRole() == 'company';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Companies collection
    match /companies/{companyId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || (isCompany() && request.auth.token.email == resource.data.email);
    }
    
    // Internships collection
    match /internships/{internshipId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isCompany();
      allow update, delete: if isAdmin() || (isCompany() && request.auth.token.email == get(/databases/$(database)/documents/companies/$(resource.data.companyId)).data.email);
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
  }
}
```

### Create Test Users

1. Go to Firebase Console → Authentication
2. Create test users:
   - Admin: `admin@example.com` with password
   - Company: `company@example.com` with password

3. Create corresponding documents in Firestore:
   - Collection: `users`
   - Document ID: Use the user's email
   - Fields:
     ```json
     {
       "email": "admin@example.com",
       "role": "admin",
       "createdAt": [Current timestamp]
     }
     ```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🏗️ Project Structure

```
internship_admin/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.module.css
│   │   │   └── ProtectedRoute.tsx
│   │   └── layout/
│   │       ├── DashboardLayout.tsx
│   │       ├── DashboardLayout.module.css
│   │       ├── Header.tsx
│   │       ├── Header.module.css
│   │       ├── Sidebar.tsx
│   │       └── Sidebar.module.css
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── firebase/
│   │   ├── config.ts
│   │   └── auth.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── LoginPage.module.css
│   │   ├── DashboardPage.tsx
│   │   ├── DashboardPage.module.css
│   │   ├── CompaniesPage.tsx
│   │   ├── InternshipsPage.tsx
│   │   ├── ApplicationsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── CompanyInternshipsPage.tsx
│   │   └── PlaceholderPage.module.css
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── README.md
```

## 🔐 Authentication Flow

1. User enters email and password on login page
2. Firebase Authentication validates credentials
3. System fetches user role from Firestore `users` collection
4. User is redirected based on role:
   - **Admin** → `/dashboard`
   - **Company** → `/company/internships`
5. Protected routes validate user authentication and role on every access

## 🛣️ Routes

### Public Routes
- `/` - Login page

### Admin Routes (Protected)
- `/dashboard` - Admin dashboard with statistics
- `/companies` - Manage companies
- `/internships` - Manage internships
- `/applications` - Review applications
- `/settings` - Account settings

### Company Routes (Protected)
- `/company/internships` - Manage company's internship postings

## 🎨 Styling

- **CSS Modules**: Scoped component styles
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 1024px
- **Modern UI**: Gradient backgrounds, smooth transitions, hover effects
- **Dark Sidebar**: Professional dark theme (#1e293b)
- **Light Content Area**: Clean light background (#f8fafc)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (sidebar collapses, mobile menu)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Firebase** - Authentication & Database
- **React Router v6** - Routing
- **Lucide React** - Modern icons
- **CSS Modules** - Scoped styling

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify Firebase configuration in `/src/firebase/config.ts`
- Check that Firebase project has Authentication and Firestore enabled
- Ensure security rules are properly configured

### Authentication Errors
- Verify user exists in Firebase Authentication
- Check that corresponding user document exists in Firestore `users` collection
- Ensure user document has correct `role` field

### Dashboard Statistics Not Loading
- Verify Firestore collections exist: `users`, `companies`, `internships`, `applications`
- Check Firestore security rules allow read access for authenticated users
- Check browser console for error messages

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues or questions, please contact the development team.
