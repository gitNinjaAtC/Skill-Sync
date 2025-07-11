// src/pages/ErrorPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center p-8">
    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="mb-6 text-gray-600">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="text-blue-500 underline">
      Go to Homepage
    </Link>
  </div>
);

export default ErrorPage;
