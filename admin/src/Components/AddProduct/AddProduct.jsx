import React, { useState } from 'react'
import './AddProduct.css'
import uploadIcon from '../../assets/products/upload_icon.png'

const AddProduct = () => {
    const [image, setImage] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: '',
        old_price: '',
        new_price: '',
        category: 'crochet',
        image: ''
    })

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    }

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    }

    const Add_Product = async () => {
        try {
            let responseData;
            const product = { ...productDetails };

            if (!image) {
                alert('Please select an image');
                return;
            }

            const formData = new FormData();
            // Field name must be 'image' to match backend multer.single('image')
            formData.append('image', image);

            const uploadResp = await fetch('http://localhost:4000/upload', {
                method: 'POST',
                body: formData,
            });
            if (!uploadResp.ok) {
                const text = await uploadResp.text();
                throw new Error(`Upload failed: ${uploadResp.status} ${text}`);
            }
            responseData = await uploadResp.json();

            if (responseData.success) {
                product.image = responseData.image_url;
                // Ensure numeric types
                const newPriceNum = Number(product.new_price || product.old_price || 0);
                const oldPriceNum = Number(product.old_price || product.new_price || 0);

                const saveResp = await fetch('http://localhost:4000/addproduct', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: product.name,
                        image: product.image,
                        category: product.category, // expect slug values like 'crochet'
                        new_price: newPriceNum,
                        old_price: oldPriceNum,
                        description: product.description || '',
                    }),
                });

                if (!saveResp.ok) {
                    const text = await saveResp.text();
                    throw new Error(`Save failed: ${saveResp.status} ${text}`);
                }
                const saveData = await saveResp.json();
                if (saveData.success) {
                    alert('Product added successfully');
                    setProductDetails({
                        name: '',
                        old_price: '',
                        new_price: '',
                        category: 'crochet',
                        image: ''
                    });
                    setImage(false);
                } else {
                    alert('Failed to add product');
                }
            } else {
                alert('Failed to upload image');
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'An error occurred');
        }
    }

    return (
        <div className='add-product'>
            <div className="addproduct-itemfield">
                <p>Product Title</p>
                <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type'/>
            </div>

            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Old Price</p>
                    <input value={productDetails.old_price} onChange={changeHandler} type="number" step="0.01" name='old_price' placeholder='0.00'/>
                </div>
                
                <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input value={productDetails.new_price} onChange={changeHandler} type="number" step="0.01" name='new_price' placeholder='0.00'/>
                </div>
            </div>

            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
                    <option value="crochet">Crochet</option>
                    <option value="doll">Plush Doll</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                    <option value="furniture">Furniture</option>
                    <option value="rug">Rug</option>
                </select>
            </div>

            <div className="addproduct-itemfield">
                <label htmlFor="file-input">
                    <img 
                        src={image ? URL.createObjectURL(image) : uploadIcon} 
                        style={{ width: '120px', height: '120px' }} 
                        className='addproduct-thumnail-img' 
                        alt="Upload"
                    />
                </label>
                <input onChange={imageHandler} type="file" name='image' id='file-input' accept='image/*' hidden />
            </div>

            <button onClick={() => { Add_Product() }} className='addproduct-btn'>ADD</button>
        </div>
    )
}

export default AddProduct