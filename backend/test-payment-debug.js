const axios = require('axios');

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow Debug...\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connection...');
    try {
      const healthResponse = await axios.get('http://localhost:4000/api/health');
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend not running:', error.message);
      return;
    }
    
    // Test 2: Test checkout session creation
    console.log('\n2️⃣ Testing checkout session creation...');
    const testCart = [
      {
        id: 1,
        name: "Test Product",
        price: 10.00,
        quantity: 1,
        image: "/test.jpg"
      }
    ];
    
    const testCustomer = {
      email: "test@example.com",
      name: "Test User",
      phone: "1234567890",
      address: "123 Test St",
      city: "Test City",
      postalCode: "12345",
      country: "US"
    };
    
    const checkoutData = {
      items: testCart,
      customerInfo: testCustomer,
      successUrl: "http://localhost:3000/success_payment",
      cancelUrl: "http://localhost:3000/cart"
    };
    
    console.log('Sending checkout data:', JSON.stringify(checkoutData, null, 2));
    
    const checkoutResponse = await axios.post('http://localhost:4000/api/create-checkout-session', checkoutData);
    console.log('✅ Checkout response:', checkoutResponse.data);
    
    if (checkoutResponse.data.success && checkoutResponse.data.url) {
      console.log('✅ Checkout session created successfully');
      console.log('Session URL:', checkoutResponse.data.url);
      
      // Extract session ID from URL
      const sessionId = checkoutResponse.data.url.split('cs_test_')[1]?.split('?')[0];
      if (sessionId) {
        console.log('✅ Session ID extracted:', sessionId);
        
        // Test 3: Test payment verification
        console.log('\n3️⃣ Testing payment verification...');
        try {
          const verifyResponse = await axios.post('http://localhost:4000/api/verify-payment', {
            sessionId: `cs_test_${sessionId}`
          });
          console.log('✅ Payment verification response:', verifyResponse.data);
        } catch (verifyError) {
          console.log('❌ Payment verification failed:', verifyError.response?.data || verifyError.message);
        }
      } else {
        console.log('❌ Could not extract session ID from URL');
      }
    } else {
      console.log('❌ Checkout session creation failed');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testPaymentFlow();
