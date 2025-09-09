import React from 'react';
import Navbar from './Components/Navbar/Navbar';
import './App.css'
import Admin from './pages/Admin/Admin';

const App = () => {
  return (
    <div className= "App">
      <Navbar /> 
      <Admin />
    </div>
  )
}

export default App