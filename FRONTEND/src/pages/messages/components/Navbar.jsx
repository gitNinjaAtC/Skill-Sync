// import { Link } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";
// import { LogOut, MessageSquare, Settings, User } from "lucide-react";
// import "./navbar.scss";

// const Navbar = () => {
//   const { logout, authUser } = useAuthStore();

//   return (
//     <header className="navbar">
//       <div className="navbar-container">
//         <div className="navbar-content">
//           <div className="navbar-left">
//             <Link to="/" className="navbar-logo">
//               <div className="logo-icon">
//                 <MessageSquare className="icon-primary" />
//               </div>
//               <h1>Chatty</h1>
//             </Link>
//           </div>

//           <div className="navbar-right">
//             <Link to="/settings" className="navbar-btn">
//               <Settings size={16} />
//               <span className="btn-text">Settings</span>
//             </Link>

//             {authUser && (
//               <>
//                 <Link to="/profile" className="navbar-btn">
//                   <User size={20} />
//                   <span className="btn-text">Profile</span>
//                 </Link>

//                 <button className="logout-btn" onClick={logout}>
//                   <LogOut size={20} />
//                   <span className="btn-text">Logout</span>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
