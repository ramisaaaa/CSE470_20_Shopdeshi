import React from 'react'
import './ListProduct.css'



const ListProduct = () => {
  return (
    <div className='list-product'>
      <div className= "listproduct-itemfield">
            <p>Product List</p>
            <input type="text" name='name' placeholder='Type'/>
        </div>
      
    </div>
  )
}

export default ListProduct