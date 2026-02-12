# Multan Academy - Project Documentation & Architecture

## 1. Project Overview
- **Name:** Multan Academy (Online Teaching Platform)
- **Objective:** A comprehensive Learning Management System (LMS) for students, teachers, and administrators.
- **Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js)
- **Current State:** Production-ready with core features implemented and critical bug fixes applied.

---

## 2. System Architecture

### **Backend (Node.js/Express)**
- **API Structure:** RESTful API with structured routes for each resource.
- **Database:** MongoDB (via Mongoose) with schemas for Users, Courses, Categories, Subjects, etc.
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC) middleware (`protect`, `authorize`).
- **File Handling:** Image/Video uploads handled via Multer (local storage).
- **Security:**
    - `helmet` for HTTP headers.
    - `cors` for Cross-Origin Resource Sharing.
    - `express-mongo-sanitize` to prevent NoSQL injection.
    - `xss-clean` to prevent XSS attacks.
    - Rate limiting for API protection.

### **Frontend (React.js)**
- **Routing:** `react-router-dom` for client-side navigation.
- **State Management:** `Redux Toolkit` (for auth) + `useState`/`useEffect` (local state).
- **Styling:** `Tailwind CSS` for responsive, modern UI.
- **HTTP Client:** `axios` instance with interceptors for token handling.
- **UI Components:** Reusable components (Modals, Form Inputs, Cards) and `react-icons`.

---

## 3. Core Features & workflows

### **User Roles & Permissions**
- **Student:** Sign up/Login, Enroll in courses, Watch videos, Take quizzes, View grades, Get certificates.
- **Teacher:** Create/Edit courses, Manage content, Schedule live classes, View enrolled students.
- **Admin:** Full system control. Manage users, Approve/Reject courses, Manage categories/subjects, View financial reports.

### **Course Management Workflow**
1.  **Hierarchy:**
    - **Category:** Top-level grouping (e.g., "MDCAT", "FSc").
    - **Subject:** Specific subject linked to a Category (e.g., "Biology" under "MDCAT").
    - **Course:** The actual learning module linked to a Subject (and thus Category).
2.  **Creation (Teacher/Admin):**
    - Select Category -> Select Subject (Filtered by Category) -> Enter Details -> Upload Media.
3.  **Approval (Admin):**
    - Courses created by Teachers default to `draft`/`pending`.
    - Admin reviews and approves courses to make them public (`isPublished: true`).

### **Learning Experience**
- **Video Player:** Custom video player with quality controls and progress tracking.
- **Quizzes:** Multiple-choice questions with automated grading.
- **Assignments:** File upload submissions for teachers to grade.
- **Live Classes:** Integration for scheduling and joining live sessions.

---

## 4. Recent Fixes & Enhancements

### **Critical Course Management Fixes (Feb 2026)**
We addressed critical bugs in the Course Creation and Editing workflows that were causing "Invalid ID" errors and blocking admins from assigning categories.

#### **1. Fixed: Missing Category in "Create Course" (Admin)**
- **Issue:** The Admin Dashboard's "Create Course" modal lacked a Category dropdown.
- **Fix:** check `ManageCourses.jsx`
    - Added `fetchCategories` API call.
    - Added **Category Dropdown** to the modal.
    - Implemented **Dynamic Subject Filtering**: Selecting a category now strictly filters the subject list to only show relevant subjects.
    - Ensures the correct `category._id` is sent to the backend.

#### **2. Fixed: "Invalid ID format" in "Edit Course"**
- **Issue:** Editing a course would fail if the frontend sent a full object (e.g., `{ _id: "...", name: "..." }`) instead of just the ID string for `category` or `subject`.
- **Fix:** check `EditCourse.jsx`
    - Refactored `handleSaveCourse` to sanitize the payload.
    - Explicitly extracts `_id` from `category` and `subject` objects before sending the PUT request.

#### **3. Image Support for Categories & Subjects (Feb 2026)**
- **Goal:** Replace text/icon placeholders with professional cover images.
- **Implementation:**
    - Added `image` field to `Category` and `Subject` schemas.
    - Updated Admin Panel (`ManageCategories`, `ManageSubjects`) to accept image URLs.
    - Updated `Courses.jsx` to display images as backgrounds with overlay text.
    - Fallback to original design if no image is provided.

#### **4. Backend Validation Improvements**
- **Issue:** Generic error messages made debugging difficult.
- **Fix:** check `courseController.js`
    - Added robust validation in `updateCourse`.
    - Checks if `req.params.id` is a valid ObjectId.
    - Validates `req.body.category` and `subject` IDs if present.
    - Added specific error messages (e.g., "Invalid Category ID format").

---

## 5. Deployment Instructions

To deploy the latest changes to the production server:

1.  **Connect via SSH:**
    ```bash
    ssh root@<server-ip>
    ```

2.  **Navigate to Project Directory:**
    ```bash
    cd /root/learning
    ```

3.  **Update Files:**
    - Upload the modified files to their respective locations:
        - `backend/src/controllers/courseController.js`
        - `frontend/src/pages/ManageCourses.jsx`
        - `frontend/src/pages/EditCourse.jsx`
        - `backend/src/models/Category.js`
        - `backend/src/models/Subject.js`
        - `frontend/src/pages/ManageCategories.jsx`
        - `frontend/src/pages/ManageSubjects.jsx`
        - `frontend/src/pages/Courses.jsx` 

4.  **Rebuild Frontend:**
    ```bash
    cd frontend
    npm install
    npm run build
    ```

5.  **Restart Backend:**
    ```bash
    cd ../backend
    pm2 restart all
    ```

6.  **Verify:**
    - Log in as Admin.
    - Create a new course -> Verify Category/Subject selection works.
    - Edit an existing course -> Verify changes save without error.
    - Log in as Admin -> Manage Categories -> Add Image URL -> Verify listing.
    - Go to `/courses` -> Verify Category covers.

---

## 6. Project Structure Overview

```
d:\learning\
├── backend\
│   ├── src\
│   │   ├── config\         # DB connection, etc.
│   │   ├── controllers\    # Logic for API endpoints (e.g., courseController.js)
│   │   ├── middleware\     # Auth, Error handling, Uploads
│   │   ├── models\         # Mongoose Schemas (User, Course, Category, Subject)
│   │   ├── routes\         # API Routes definition
│   │   └── utils\          # Helper functions (e.g., sendEmail.js)
│   └── server.js           # Entry point
│
└── frontend\
    ├── src\
    │   ├── components\     # Reusable UI components
    │   ├── context\        # Global state context
    │   ├── pages\          # Application pages (e.g., ManageCourses.jsx, EditCourse.jsx)
    │   ├── redux\          # Redux store slices
    │   └── utils\          # Axios instance, helpers
    └── App.jsx             # Main routing component
```
