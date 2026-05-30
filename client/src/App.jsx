import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './Pages/Home'
import TrafficRules from './Pages/TrafficRule'
import Navbar from './Pages/Navbar'
import VehicleSearchModal from './components/Popup'
import VehicleDetails from './Pages/VehicleDetails'




function App() {
  return (
    <>
    <Navbar />
    <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/traffic-rules" element={<TrafficRules/>} />
          <Route path="/vehicle-status" element={<VehicleSearchModal/>} />
          <Route path="/vehicle-detail" element={<VehicleDetails/>} />

    </Routes>
    </>
  )
}

export default App;
