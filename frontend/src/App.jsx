import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageCourses from './pages/ManageCourses';
import ManagePayments from './pages/ManagePayments';
import ManageSubjects from './pages/ManageSubjects';
import ManageCategories from './pages/ManageCategories';
import ManageSocialMedia from './pages/ManageSocialMedia';
import ManageTeacherRequests from './pages/ManageTeacherRequests';
import ManageSessionConfig from './pages/ManageSessionConfig';
import ManageHighlights from './pages/ManageHighlights';
import ManageTeachers from './pages/ManageTeachers';
import ManageCounsellingRequests from './pages/ManageCounsellingRequests';
import ManageIntroVideo from './pages/ManageIntroVideo';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import VideoPlayer from './pages/VideoPlayer';
import Quiz from './pages/Quiz';
import Assignment from './pages/Assignment';
import Gradebook from './pages/Gradebook';
import Certificate from './pages/Certificate';
import Certificates from './pages/Certificates';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import IntroVideo from './pages/IntroVideo';
import LiveClass from './pages/LiveClass';
import CreateLiveClass from './pages/CreateLiveClass';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import FAQs from './pages/FAQs';
import Policies from './pages/Policies';
import TermsAndConditions from './pages/TermsAndConditions';
import DataPolicy from './pages/DataPolicy';
import RefundPolicy from './pages/RefundPolicy';
import PaymentPolicy from './pages/PaymentPolicy';
import IntellectualProperty from './pages/IntellectualProperty';
import EmailVerified from './pages/EmailVerified';
import VerificationFailed from './pages/VerificationFailed';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="login/student" element={<StudentLogin />} />
          <Route path="login/teacher" element={<TeacherLogin />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="intro-video/:type/:id?" element={<IntroVideo />} />
          <Route path="live-classes/:id" element={<LiveClass />} />
          <Route path="email-verified" element={<EmailVerified />} />
          <Route path="verification-failed" element={<VerificationFailed />} />

          {/* Public Information Pages */}
          <Route path="about-us" element={<AboutUs />} />
          <Route path="contact-us" element={<ContactUs />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="policies" element={<Policies />} />
          <Route path="terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="data-policy" element={<DataPolicy />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="payment-policy" element={<PaymentPolicy />} />
          <Route path="intellectual-property" element={<IntellectualProperty />} />

          {/* Protected Student Routes */}
          <Route
            path="student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:id/video/:videoId"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <VideoPlayer />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:id/quiz/:quizId"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="courses/:id/assignment/:assignmentId"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Assignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="gradebook"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <Gradebook />
              </ProtectedRoute>
            }
          />
          <Route
            path="certificates"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="certificates/:id"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <Certificate />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment/success"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />

          {/* Protected Teacher Routes */}
          <Route
            path="teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/courses/create"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/courses/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="live-classes/create"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <CreateLiveClass />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/payments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManagePayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/subjects"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageSubjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/social-media"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageSocialMedia />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/teacher-requests"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageTeacherRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/session-config"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageSessionConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/highlights"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageHighlights />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/teachers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageTeachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/counselling-requests"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCounsellingRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/intro-video"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageIntroVideo />
              </ProtectedRoute>
            }
          />

          {/* Error Pages */}
          <Route path="500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;

