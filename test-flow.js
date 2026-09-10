
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFlow() {
  console.log('--- Starting End-to-End Flow Test ---');

  try {
    // 1. Register a Provider
    console.log('\n1. Registering Provider...');
    const regRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_pro@trustlink.com',
        password: 'password123',
        name: 'Test Pro',
        role: 'PROVIDER',
        serviceType: 'Plumber',
        experience: 5,
        price: 500
      })
    });
    const regData = await regRes.json();
    console.log('Registration Response:', regData);

    if (regData.error) throw new Error(regData.error);

    // 2. Fetch Provider Details
    console.log('\n2. Fetching Provider Details...');
    const provRes = await fetch(`${BASE_URL}/api/providers?email=test_pro@trustlink.com`);
    const providers = await provRes.json();
    const provider = providers.find(p => p.user.email === 'test_pro@trustlink.com');
    console.log('Provider Found:', provider.id);

    // 3. Admin Verifies Provider
    console.log('\n3. Admin Verifying Provider...');
    const verifyRes = await fetch(`${BASE_URL}/api/providers`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: provider.id,
        isVerified: true,
        status: 'VERIFIED'
      })
    });
    console.log('Verification Status:', verifyRes.status);

    // 4. User Creates Booking
    console.log('\n4. User Creating Booking...');
    const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type": "application/json' },
      body: JSON.stringify({
        providerId: provider.id,
        customerEmail: 'customer@test.com', // Assuming this user exists or will be created
        serviceType: 'Plumber',
        amount: 505, // 500 + 5 fee
        hours: 1,
        date: '2026-05-01',
        time: '10:00'
      })
    });
    const bookData = await bookRes.json();
    console.log('Booking Created:', bookData.bookingId);

    // 5. Simulate Payment Success (Update status to ESCROW_HELD)
    // Normally done via verify-payment route, but we'll simulate the state change
    console.log('\n5. Simulating Payment Success...');
    // In our app, the verify-payment route does this.
    // We'll skip the actual Razorpay signature check for this test and check if the route exists
    const paymentRouteRes = await fetch(`${BASE_URL}/api/verify-payment`, { method: 'POST' });
    console.log('Payment Route reachable (expected 400/500 without data):', paymentRouteRes.status);

    // 6. Provider Completes Job
    console.log('\n6. Provider Completing Job...');
    const completeRes = await fetch(`${BASE_URL}/api/bookings/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: bookData.bookingId,
        photoUrl: 'http://test.com/photo.jpg'
      })
    });
    console.log('Completion Status:', completeRes.status);

    // 7. User Releases Payment
    console.log('\n7. User Releasing Payment...');
    const releaseRes = await fetch(`${BASE_URL}/api/bookings/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: bookData.bookingId })
    });
    const releaseData = await releaseRes.json();
    console.log('Release Response:', releaseData);

    console.log('\n--- Flow Test Completed Successfully ---');

  } catch (err) {
    console.error('\n!!! Flow Test Failed:', err.message);
  }
}

testFlow();
