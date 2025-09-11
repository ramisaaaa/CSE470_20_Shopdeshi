import React from 'react';
import './Admin.css';
import Sidebar from '../../Components/Sidebar/Sidebar';
import {Routes, Route, Navigate} from 'react-router-dom';
import AddProduct from '../../Components/AddProduct/AddProduct';
import ListProduct from '../../Components/ListProduct/ListProduct';
import ReviewsCheck from '../../Components/ReviewsCheck/ReviewsCheck';
import ComplaintsManager from '../../Components/Complaints/Complaints';


const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar />
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/AddProduct" replace />} />
        <Route path='/admin/AddProduct' element={<AddProduct />} />
        <Route path='/admin/ListProduct' element={<ListProduct />} />
        <Route path='/admin/ReviewsCheck' element={<ReviewsCheck />} />
        <Route path='/admin/Complaints' element={<ComplaintsManager />} />
      </Routes>

    </div>
  )
}

export default Admin