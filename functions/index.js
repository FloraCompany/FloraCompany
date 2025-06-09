const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const instance = new Razorpay({
      key_id: "rzp_test_ODWUFUWozm48C8",
      key_secret: "pPqWmH7slMHAkgeU40CfL0Gw"
});

exports.generateOrder = functions.https.onCall((data, context) => {

  const options = {
    amount: data.data.amount,
    currency: "INR"
  };

  return createOrder(options).then((order) => {
    return order;
  }).catch((e) => {
    return { error: e };
  });
});

exports.verifyPayment = functions.https.onCall( (data, context) => {

  const { order_id, payment_id, signature } = data.data;

  console.log("Order ID:", order_id);
  console.log("Payment ID:", payment_id);
  console.log("Signature (from Razorpay):", signature);

  const hmac = crypto.createHmac("sha256", "pPqWmH7slMHAkgeU40CfL0Gw");
  hmac.update(order_id+"|"+payment_id);
  const generatedSignature = hmac.digest("hex");

  console.log('isSame '+(generatedSignature === signature));

  if (generatedSignature === signature) {
    return { success: true};
  }else {
    throw new functions.https.HttpsError("permission-denied", "Invalid Signature");
  }
});

function createOrder(options) {
  return new Promise( async (resolve, reject) => {
     await instance.orders.create(options, (err, order) => {
      if (err !== null) {
        console.log("Failed to create order", err);
        return reject(err);
      } else{
        console.log("OrderID: ", order);
        return resolve({
          id: order.id,
          amount: order.amount,
          currency: order.currency
        });
      }
    });
  });
}

