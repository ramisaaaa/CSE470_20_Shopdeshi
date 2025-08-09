"use client";
import {AlignLeft} from "lucide-react";
import SideBar from "./SideBar";
import React, { useState } from 'react';


const MobileMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen]= useState(false);
  return (
    <>
       <button onClick= {() => setIsSidebarOpen(!isSidebarOpen)}>
          <AlignLeft className="hover:text-darkColor hoverEffect md:hidden hover:cursor-pointer " />


       </button>
       <div className="md:hidden">
         <SideBar
           isOpen={isSidebarOpen} 
           onClose={() => setIsSidebarOpen(false)}
         
         
         />
       </div>
       
    
    
    
    
    
    </>
  );

};

export default MobileMenu   ;