const functions = require('firebase-functions');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors')({ origin: true }); 

const instance = new Razorpay({
      key_id: "rzp_test_ODWUFUWozm48C8",
      key_secret: "pPqWmH7slMHAkgeU40CfL0Gw"
});

exports.generateOrder = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const amount = req.body.amount;
    if (!amount) {
      return res.status(400).send("Amount is required");
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: "FloraCo_" + Date.now(),
    };

    instance.orders.create(options, (err, order) => {
      if (err) {
        console.error("Order creation failed:", err);
        return res.status(500).send("Error creating order");
      }
      res.status(200).send({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    });
  });
});

exports.verifyPayment = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { order_id, payment_id, signature } = req.body;
    if (!order_id || !payment_id || !signature)
      return res.status(400).send('Missing fields');

    const hmac = crypto.createHmac('sha256', "pPqWmH7slMHAkgeU40CfL0Gw");
    hmac.update(order_id + "|" + payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === signature) {
      res.status(200).send({ success: true });
    } else {
      res.status(403).send({ success: false, error: "Invalid signature" });
    }
  });
});

// exports.generateOrder = functions.https.onCall((data, context) => {

//   const options = {
//     amount: data.data.amount,
//     currency: "INR"
//   };

//   return createOrder(options).then((order) => {
//     return order;
//   }).catch((e) => {
//     return { error: e };
//   });
// });

// exports.verifyPayment = functions.https.onCall( (data, context) => {

//   const { order_id, payment_id, signature } = data.data;

//   const hmac = crypto.createHmac("sha256", "pPqWmH7slMHAkgeU40CfL0Gw");
//   hmac.update(order_id+"|"+payment_id);
//   const generatedSignature = hmac.digest("hex");

//   if (generatedSignature === signature) {
//     return { success: true};
//   }else {
//     throw new functions.https.HttpsError("permission-denied", "Invalid Signature");
//   }
// });

// function createOrder(options) {
//   return new Promise( async (resolve, reject) => {
//      await instance.orders.create(options, (err, order) => {
//       if (err !== null) {
//         console.log("Failed to create order", err);
//         return reject(err);
//       } else{
//         console.log("OrderID: ", order);
//         return resolve({
//           id: order.id,
//           amount: order.amount,
//           currency: order.currency
//         });
//       }
//     });
//   });
// }