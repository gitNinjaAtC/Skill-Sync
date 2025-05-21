import "./style.scss";
import { useContext } from "react";
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

// Layout Components
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import Footer from "./components/footer/Footer"; // ✅ Import Footer

// Pages
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import EditProfile from "./pages/ProfilePage/EditProfile";
import Forums from "./pages/forums/Forums";
import CreateForum from "./pages/createForum/createForum";
import Jobs from "./pages/job/job";
import JobDescription from "./pages/job/JobDescription";
import CreateOffer from "./pages/jobs/CreateOffer";
import Events from "./pages/events/Events";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const queryClient = new QueryClient();

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
        <Footer /> {/* ✅ Footer placed at the bottom */}
      </div>
    </QueryClientProvider>
  );

  const ProtectedRoute = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" replace />;
  };

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
        { path: "/job", element: <Jobs /> },
        { path: "/jobs/:id", element: <JobDescription /> },
        { path: "/jobs/CreateOffer", element: <CreateOffer /> },
        { path: "/events", element: <Events /> },

      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
