import React from 'react'
import './Sidebar.css'
import {Link} from 'react-router-dom'
import add_product_icon from '../../assets/emptyCart.png'
import list_product_icon from '../../assets/listProduct.png'    
import warning from '../../assets/warning.png'



const Sidebar = () => {
  return (
    <div className='sidebar'>
        <Link to= {'/admin/AddProduct'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={add_product_icon} alt="" style={{width: '30px', height: '30px'}} />
                <p> Add Product</p>
            </div>
        </Link>

         <Link to= {'/admin/ListProduct'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={list_product_icon} alt="" style={{width: '30px', height: '30px'}} />
                <p> Product List</p>
            </div>
        </Link>

          <Link to= {'/admin/ReviewsCheck'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={warning} alt="" style={{width: '30px', height: '30px'}} />
                <p> Reviews Check</p>
            </div>
        </Link>
        
        <Link to='/admin/Complaints' style={{textDecoration:"none"}}>
           <div className="sidebar-item">
              <img src={complaints_icon} alt="" />
              <p>Manage Complaints</p>
           </div>
        </Link>




    </div>
  )
}

export default Sidebar