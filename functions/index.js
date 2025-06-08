const functions = require('firebase-functions');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance with your keys (use environment variables)
const razorpay = new Razorpay({
      key_id: "rzp_test_ODWUFUWozm48C8",
      key_secret: "pPqWmH7slMHAkgeU40CfL0Gw"
});

exports.createOrder = functions.https.onCall(async (data, context) => {
  const { amount, currency = 'INR', receipt } = data;

  if (!amount) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount is required');
  }

  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return { orderId: order.id, amount: order.amount, currency: order.currency };
  } catch (error) {
    console.error('Order creation failed:', error);
    throw new functions.https.HttpsError('internal', 'Order creation failed');
  }
});

// Optional: Function to verify payment signature

exports.verifyPayment = functions.https.onCall((data, context) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  const hmac = crypto.createHmac('sha256', "pPqWmH7slMHAkgeU40CfL0Gw");
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    return { verified: true };
  } else {
    return { verified: false };
  }
});