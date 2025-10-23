# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Start the Development Server

```bash
cd internship_admin
npm run dev
```

Open browser at `http://localhost:5173`

### Step 2: Create Test User in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **internshipsystem-43e2c**
3. Navigate to **Authentication** → **Users** → **Add user**
4. Create admin user:
   - Email: `admin@test.com`
   - Password: `test123` (or any password)

### Step 3: Create User Document in Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click **Start collection** (if first time) or navigate to existing collections
3. Create collection: `users`
4. Add document:
   - **Document ID**: `admin@test.com` (must match email)
   - **Fields**:
     - `email` (string): `admin@test.com`
     - `role` (string): `admin`
     - `createdAt` (timestamp): Click "Add field" → Type: timestamp → Use current time

### Step 4: Login

1. Go to `http://localhost:5173`
2. Login with:
   - Email: `admin@test.com`
   - Password: `test123`
3. You'll be redirected to the dashboard

## 📊 Add Sample Data (Optional)

### Add Sample Company

Collection: `companies`
```json
{
  "name": "Tech Corp",
  "email": "contact@techcorp.com",
  "status": "active",
  "industry": "Technology",
  "location": "San Francisco, CA",
  "description": "Leading tech company",
  "createdAt": [Current timestamp]
}
```

### Add Sample Internship

Collection: `internships`
```json
{
  "companyId": "company_doc_id",
  "title": "Software Engineering Intern",
  "description": "Join our engineering team",
  "status": "open",
  "location": "Remote",
  "duration": "3 months",
  "requirements": ["JavaScript", "React", "TypeScript"],
  "createdAt": [Current timestamp]
}
```

### Add Sample Student User

Collection: `users`
Document ID: `student@test.com`
```json
{
  "email": "student@test.com",
  "role": "student",
  "createdAt": [Current timestamp]
}
```

### Add Sample Application

Collection: `applications`
```json
{
  "userId": "student@test.com",
  "internshipId": "internship_doc_id",
  "companyId": "company_doc_id",
  "status": "pending",
  "appliedAt": [Current timestamp]
}
```

## 🔐 Firestore Security Rules (Important!)

⚠️ **Before deploying to production**, configure security rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the security rules from README.md
3. Click "Publish"

For development/testing, you can use these permissive rules (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Testing Different User Roles

### Create Company User

1. Firebase Auth: Create user `company@test.com`
2. Firestore `users` collection:
   ```json
   {
     "email": "company@test.com",
     "role": "company",
     "createdAt": [timestamp]
   }
   ```
3. Login → Redirects to `/company/internships`

### Create Student User

1. Firebase Auth: Create user `student@test.com`
2. Firestore `users` collection:
   ```json
   {
     "email": "student@test.com",
     "role": "student",
     "createdAt": [timestamp]
   }
   ```

## 📱 Test Responsive Design

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1440px

## 🐛 Common Issues

### Issue: "No user data found" error after login
**Solution**: Create user document in Firestore `users` collection with matching email

### Issue: Dashboard shows 0 for all stats
**Solution**: Add sample data to Firestore collections

### Issue: "Permission denied" errors
**Solution**: Update Firestore security rules to allow authenticated users

### Issue: Cannot import Firebase modules
**Solution**: Run `npm install` to ensure all dependencies are installed

## ✅ Verification Checklist

- [ ] Development server running on `http://localhost:5173`
- [ ] Firebase Authentication enabled
- [ ] Firestore Database created
- [ ] Test admin user created in Firebase Auth
- [ ] User document created in Firestore with role="admin"
- [ ] Can login successfully
- [ ] Dashboard loads without errors
- [ ] Sidebar navigation works
- [ ] Logout button works
- [ ] Mobile responsive menu works

## 🎉 You're Ready!

Your Firebase Admin Authentication System is now fully set up and running!

Next steps:
- Implement Companies page functionality
- Implement Internships page functionality
- Implement Applications page functionality
- Add user management features
- Deploy to production

