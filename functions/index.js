const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: "rzp_test_ODWUFUWozm48C8",
  key_secret: "pPqWmH7slMHAkgeU40CfL0Gw"
});

// Create Razorpay order
exports.createOrder = functions.https.onCall(async (data, context) => {
  const options = {
    amount: data.amount * 100, // Convert to paise
    currency: "INR",
    receipt: "FloraCoReceipt_" + Date.now()
  };

  try {
    const order = await instance.orders.create(options);
    console.log("✅ Order created:", order);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency
    };
  } catch (error) {
    console.error("❌ Failed to create order:", error);
    throw new functions.https.HttpsError("internal", "Order creation failed");
  }
});

// Verify payment signature
exports.verifyPayment = functions.https.onCall((data, context) => {
  const { order_id, payment_id, signature } = data;

  if (!order_id || !payment_id || !signature) {
    console.error("❌ Missing parameters for verification");
    throw new functions.https.HttpsError("invalid-argument", "Missing payment data");
  }

  const hmac = crypto.createHmac("sha256", "pPqWmH7slMHAkgeU40CfL0Gw");
  hmac.update(order_id + "|" + payment_id);
  const generatedSignature = hmac.digest("hex");

  console.log("🔐 Generated:", generatedSignature);
  console.log("📩 Provided:", signature);

  if (generatedSignature === signature) {
    return { success: true };
  } else {
    throw new functions.https.HttpsError("permission-denied", "Invalid Signature");
  }
});
