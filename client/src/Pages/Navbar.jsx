import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <div className=" bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full m-auto bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">DriveLegal</h1>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Traffic Rules
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              Vehicle Status
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600">
              About
            </a>
          </nav>

          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            Login
          </button>
        </div>
      </header>
    </div>
  );
}
