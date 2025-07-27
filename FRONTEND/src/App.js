// C:\Users\Dell\Desktop\Skill-Sync\FRONTEND\src\App.js

import "./style.scss";
import { useContext, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Contexts
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";

// Zustand store
import { useAuthStore } from "./store/useAuthStore";

// Layout Components
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import Footer from "./components/footer/Footer";

// Pages
import LandingPage from "./pages/LandingPage/LandingPage";
import Home from "./pages/home/Home";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import EditProfile from "./pages/ProfilePage/EditProfile";
import Forums from "./pages/forums/Forums";
import CreateForum from "./pages/createForum/createForum";
import Jobs from "./pages/job/job";
import JobDescription from "./pages/job/JobDescription";
import CreateOffer from "./pages/jobs/CreateOffer";
import Events from "./pages/events/Events";
import PeopleSection from "./pages/people/PeopleSection";
import HomePage from "./pages/messages/page/HomePage";
import ErrorPage from "./pages/ErrorPage";
import ComingSoon from "./pages/Comingsoon/Comingsoon";

// Forgot/Reset Password Pages
import ForgotPassword from "./pages/Update Password/ForgotPassword";
import ResetPassword from "./pages/Update Password/ResetPassword";

// Comments Page
import CommentPage from "./pages/forums/CommentPage"; // ✅ make sure this file exists

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const queryClient = new QueryClient();

  const Layout = () => {
    const { connectSocket, setCurrentUser } = useAuthStore();

    useEffect(() => {
      if (currentUser?._id) {
        setCurrentUser(currentUser);
        connectSocket(currentUser._id);
      }
    }, [currentUser, connectSocket, setCurrentUser]);

    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar />
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              <LeftBar />
              <div style={{ flex: 6, overflowY: "auto" }}>
                <Outlet />
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    return currentUser ? children : <Navigate to="/" replace />;
  };

  const router = createBrowserRouter([
    { path: "/", element: <LandingPage /> },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      errorElement: <ErrorPage />,
      children: [
        { path: "/home", element: <Home /> },
        { path: "/profile/:id", element: <ProfilePage /> },
        { path: "/edit-profile/:id", element: <EditProfile /> },
        { path: "/forums", element: <Forums /> },
        { path: "/forums/:id/comments", element: <CommentPage /> }, // ✅ Route added
        { path: "/create-forum", element: <CreateForum /> },
        { path: "/job", element: <Jobs /> },
        { path: "/jobs/:id", element: <JobDescription /> },
        { path: "/jobs/CreateOffer", element: <CreateOffer /> },
        { path: "/events", element: <Events /> },
        { path: "/messages", element: <HomePage /> },
        { path: "/people", element: <PeopleSection /> },
        { path: "/gallery", element: <ComingSoon /> },
        { path: "/fundraiser", element: <ComingSoon /> },
        { path: "/resume-builder", element: <ComingSoon /> },
      ],
    },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password/:token", element: <ResetPassword /> },
    { path: "*", element: <ErrorPage /> },
  ]);

  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}

export default App;
