import "./style.scss";
import { useContext } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Contexts
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";

// Layout Components
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";

// Pages
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import EditProfile from "./pages/ProfilePage/EditProfile";
import Forums from "./pages/forums/Forums";
import CreateForum from "./pages/createForum/createForum";
import Jobs from "./pages/jobs/Jobs";
import CreateOffer from "./pages/jobs/CreateOffer";
import Events from "./pages/events/Events";
import EventDescription from "./pages/events/EventDescription";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const queryClient = new QueryClient();

  // Main layout with Navbar, LeftBar, and nested routing (Outlet)
  const Layout = () => (
    <QueryClientProvider client={queryClient}>
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <LeftBar />
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );

  // Redirect unauthenticated users
  const ProtectedRoute = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" replace />;
  };

  // Define application routes
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/", element: <Home /> },
        { path: "/profile/:id", element: <ProfilePage /> },
        { path: "/edit-profile/:id", element: <EditProfile /> },
        { path: "/forums", element: <Forums /> },
        { path: "/create-forum", element: <CreateForum /> },
        { path: "/jobs", element: <Jobs /> },
        { path: "/create-offer", element: <CreateOffer /> },
        { path: "/events", element: <Events /> },
        { path: "/events/:tab", element: <Events /> },
        { path: "/event/:id", element: <EventDescription /> },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
