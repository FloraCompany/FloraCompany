
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-functions.js";
import { getDatabase, runTransaction, ref, child, get, set, update, remove, off} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { increase, decrease, changeQuantity, showToast, removeItem, updateSummary, applyCoupon, display, getFinalAmount } from './cartFunctions.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, query, where, updateDoc, deleteDoc, deleteField, Timestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

let finalAmount = 0;

window.increase = increase;
window.decrease = decrease;
window.changeQuantity = changeQuantity;
window.showToast = showToast;
window.removeItem = removeItem;
window.updateSummary = updateSummary;

let address = {};
display();

let cFetched = false;
let modeOfPayment = "2";


const firebaseConfig = {
	apiKey: "AIzaSyDg_cruaRr3dHWuE8Ddzxk6OXlWKE445kA",
	authDomain: "floraco-main.firebaseapp.com",
	projectId: "floraco-main",
	storageBucket: "floraco-main.firebasestorage.app",
	messagingSenderId: "675774592408",
	appId: "1:675774592408:web:765b6016f902858bb267ed",
	measurementId: "G-2T9X6F21LB"
};

var app = initializeApp(firebaseConfig);

function checkout(){

	const selectedRadio = document.querySelector('input[name="payment"]:checked');
	modeOfPayment = selectedRadio ? selectedRadio.value : undefined;

	let name = String(document.getElementById('name').value);
	let phone = String(document.getElementById('phone').value);
	let street = String(document.getElementById('street').value);
	let locality = String(document.getElementById('locality').value);
	let pincode = String(document.getElementById('pin').value);
	let fullAdd = String(document.getElementById('fullAdd').value);
	let country = String(document.getElementById('country').value);

	address = {
		name: name,
		phone: phone,
		street: street,
		locality: locality,
		pincode: pincode,
		fullAdd: fullAdd,
		country: country
	};
				initiatePayment(getFinalAmount(), address);

	if (name && phone && street && locality && pincode && country) {

		let userId = window.localStorage.getItem('UserID');

		window.localStorage.setItem(userId+'address', JSON.stringify(address));

		if (modeOfPayment === undefined) {
			showToast('Select Payment Method');
		}else{


			if (modeOfPayment === "2") {
				uploadOrder();
			}else{
			}

		}

	}else{
		showToast('Fill the (*) fields and cross check');
	}
}

function uploadOrder(){

	const rdb = getDatabase(app);
	const db = getFirestore(app);

	if (window.localStorage.getItem("FloraCoUserLogIn") === "false" || window.localStorage.getItem("FloraCoUserLogIn") === null) {
		window.location.href = 'login.html';
	}else{
		let date = getDateString();
		updateOrderNo(date, rdb, db);
	}

}

async function updateOrderNo(date, rdb, db){

	openLoad();

	runTransaction(child(ref(rdb), 'numericals/orderNo'), (currentValue) => {
			return currentValue+1;
	}).then((result) => {

		let orderID = 'FCOR'+String(result.snapshot.val()).padStart(5, '0');

		runTransaction(child(ref(rdb), 'numericals/orders/'+date), (currentValue) => {
				return currentValue+1;
		}).then((result) => {
			runTransaction(child(ref(rdb), 'numericals/sales/'+date), (currentValue) => {
					return currentValue+getFinalAmount();
			}).then((result) => {
				updateProduct(rdb, db, orderID);
				off(child(ref(rdb), 'numericals/sales/'+date));
				off(child(ref(rdb), 'numericals/orders/'+date));
				off(child(ref(rdb), 'numericals/orderNo'));		
				off(ref(rdb));
			}).catch(err => {
				console.log(err);
				closeLoad();
			});
		}).catch(err => {
			console.log(err);
			closeLoad();
		});	

	}).catch((err)=>{
		console.log(err);
		closeLoad();
	});
}

async function updateProduct(rdb, db, orderID){

	let cart = JSON.parse(window.localStorage.getItem('FloraCoCart'));

	if (cart) {

		let userId = window.localStorage.getItem('UserID');
		let tot = 0;
		const order = {
			id: orderID,
			userId: userId,
			items: [],
			placed: String(new Date().getTime()),
			address: address,
			cost: getFinalAmount(),
			paymentRef: '',
			mode: modeOfPayment,
			status: 0
		};

		cart.forEach((cartItem, index)=>{

			order.items.push(cartItem);
			runTransaction(child(ref(rdb), 'numericals/product/'+String(cartItem.id).replace('FCPS', '')), (currentValue) => {
					return currentValue+cartItem.quantity;
			}).then((result) => {
				off(child(ref(rdb), 'numericals/product/'+String(cartItem.id).replace('FCPS', '')));
			}).catch(err => {
				closeLoad();
				console.log(err);
			});	
		});

		updateOrder(db, cart, order, orderID);

	}
}

async function updateOrder(db, cart, order, orderID){

	if (order) {
		var reff = doc(db, "orders", orderID);

		const docRef = setDoc(reff, order)
		.then(()=>{
			window.localStorage.setItem('FloraCoCart', '[]');
			document.getElementById('ordID').innerHTML = orderID;
			display();
			closeLoad();
		})
		.catch((error)=>{
			console.log('Error'+error);
			closeLoad();
		});
	}else{
		showToast('Order not placed');
		closeLoad();
	}
}

function openLoad(){
	document.getElementById('loader').classList.toggle('openLoader');
	document.getElementById('loader').style.display = "flex";
}

function closeLoad(){
	document.getElementById('loader').style.display = "none";
	document.getElementById('loader').classList.toggle('openLoader');
}

function getDateString(){
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth()+1).padStart(2, "0");

	return `${month}${year}`;
}

async function updateList(callBack){

    const date = new Date();
    const timestampFromDate = Timestamp.fromDate(date);
    const now = Timestamp.now();
	const db = getFirestore(app);
	const usersCollection = collection(db, "coupons");
	const q = query(usersCollection, where("validity", ">=", now));

	var querySnapshot = await getDocs(q);

	if(querySnapshot.docs.length == 0){
		window.localStorage.setItem('FloraCoCoupons', '{}');
	}

	let offers = {};

	querySnapshot.forEach(doc => {
	console.log(doc.data());

		offers[doc.data().code] = doc.data().discount;

	});


	if (Object.keys(offers).length > 0) {
		callBack(true);
	}else{
		callBack(false);
	}

	window.localStorage.setItem('FloraCoCoupons', (JSON.stringify(offers)));
}

async function initiatePayment(orderAmount, userData) {

	let functions = getFunctions(app);

	const createOrder = httpsCallable(functions, 'generateOrder');
	const orderData = await createOrder({amount: (parseInt(orderAmount)*100)});

  const options = {
    key: "rzp_test_ODWUFUWozm48C8",
    amount: orderData['amount'],
    currency: "INR",
    name: "FloraCo",
    description: "Test Payment",
    order_id: orderData['id'],
    handler: function (response) {

		console.log(typeof(orderData));
		console.log(JSON.stringify(orderData)['id']);

	console.log('Hello' + orderData.id);
	console.log('Hello' + orderData['id']);
	console.log('Hello' + orderData.amount);
	console.log('Hello' + orderData['amount']);
	try {

      const verify = httpsCallable(functions, 'verifyPayment');
      const result = verify({
        order_id: response.razorpay_order_id,
        payment_id: response.razorpay_payment_id,
        signature: response.razorpay_signature
      });

	  console.log("Sending to verifyPayment:");
	  console.log({
		order_id: `${response.razorpay_order_id} OID: ${orderData.id}`,
		payment_id: response.razorpay_payment_id,
		signature: response.razorpay_signature
	  });

	  console.log(response);
	  console.log(result);

      if (result.success) {
        uploadOrder();
		console.log('Payment Successful');
        alert("Payment successful!");
      } else {
		console.log('Payment Failed');
        alert("Payment verification failed");
      }
	}catch (error) {
		console.log(error);
	}
    },
    prefill: {
      name: String(userData.name),
      email: "floracompanydot@gmail.com",
      contact: String(userData.phone)
    },
    theme: {
      color: "#3399cc"
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}



/*function getFinalAmount(){
	return parseInt(document.getElementById('final-price').innerHTML);
}*/

window.addEventListener('storage', function(event) {
	display();
});

document.getElementById('menu').addEventListener('click', ()=>{
	document.getElementById('asideMenu').classList.toggle('asideOpen');
});

document.getElementById('close').addEventListener('click', ()=>{
	document.getElementById('asideMenu').classList.toggle('asideOpen');
});

document.getElementById('checkout').addEventListener('click', ()=>{
	
	if (!document.querySelector(".summary-box").checkVisibility()) {
		document.getElementById("left").classList.toggle("openMenu");
		document.querySelector(".summary-box").style.display = "block";	
	} else {
		checkout();
	}
});

document.querySelector('.headingSumm').addEventListener('click', ()=>{
	
	if (!document.getElementById("left").checkVisibility()) {
		document.getElementById("left").classList.toggle("openMenu");
		document.querySelector(".summary-box").style.display = "none";	
	}
});

updateList((fetched) => {
	cFetched = fetched;
});

document.getElementById('apply').addEventListener('click', ()=>{
	
	if (cFetched) {
		applyCoupon();
	}else{
		updateList((fetched) => {
			cFetched = fetched;
		});		
		showToast('No coupons available');
	}

});
