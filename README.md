# Multan Academy

A comprehensive online learning platform built with the MERN stack (MongoDB, Express, React, Node.js). This platform provides a robust environment for students and instructors, featuring course management, video lectures, and secure authentication.

## 🚀 Features

- **User Authentication**: Secure signup and login for students and admins.
- **Course Management**: Create, update, and manage courses, subjects, and categories.
- **Video Streaming**: Integration with video services for course content.
- **Admin Dashboard**: diverse administrative tools for managing the platform.
- **Student Dashboard**: Personalized dashboard for tracking progress and accessing courses.
- **Responsive Design**: Fully optimized for mobile and desktop devices.

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS (or custom CSS)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe Integration (configured via env)
- **Media**: Cloudinary / Bunny Stream (configured via env)

## 📂 Project Structure

```
multan-academy/
├── backend/            # Express.js server and API routes
│   ├── src/
│   │   ├── controllers/# specific business logic
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # API endpoints
│   │   └── middleware/ # Auth and error handling
│   └── ...
├── frontend/           # React.js client application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application views
│   │   └── ...
│   └── ...
└── ...
```

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/multan-academy-public.git
   cd multan-academy-public
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory (based on `.env.example`) and configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 🏃‍♂️ Running the Application

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```

## 🚢 Deployment

To deploy for production:
1. Build the frontend: `cd frontend && npm run build`
2. Serve the `dist` or `build` folder from the backend or use a dedicated frontend host (Vercel/Netlify).
3. Ensure Environment Variables are set in your production environment.

## 📄 License

This project is licensed under the MIT License.
