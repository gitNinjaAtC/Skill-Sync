import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import Forums from "./pages/forums/Forums";
import CreateForum from "./pages/createForum/createForum";
import Jobs from "./pages/jobs/Jobs";
import CreateOffer from "./pages/jobs/CreateOffer";
import Events from "./pages/events/Events";
import EventDescription from "./pages/events/EventDescription";
import "./style.scss";

import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
      </div>
    </QueryClientProvider>
  );

  const ProtectedRoute = ({ children }) =>
    currentUser ? children : <Navigate to="/login" />;

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
        { path: "/profile/:id", element: <Profile /> },
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
