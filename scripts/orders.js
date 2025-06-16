const firebaseConfig = {
apiKey: "AIzaSyDg_cruaRr3dHWuE8Ddzxk6OXlWKE445kA",
authDomain: "floraco-main.firebaseapp.com",
projectId: "floraco-main",
storageBucket: "floraco-main.firebasestorage.app",
messagingSenderId: "675774592408",
appId: "1:675774592408:web:765b6016f902858bb267ed",
measurementId: "G-2T9X6F21LB"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { displayDetails } from './cartFunctions.js';

window.displayDetails = displayDetails;

var app = initializeApp(firebaseConfig);


if (window.localStorage.getItem("FloraCoUserLogIn") === "true") {

	try{
		fetch("./assets/products.json")
		.then((res) => {if (!res.ok) {} return res.json();})
		.then((products) => {

			if (window.localStorage.getItem('FloraCoUserLogIn') === "true") {
				
				try{
					updateList(products['products']['all']);
				}catch(error){
					noProduct();
				}
			}else{
				noProduct();
				window.location.replace("login.html");
			}

		}).catch((error)=>{
			console.log(error);
			noProduct();
		});
	}catch (error) {
		console.log(error);
		noProduct();
	}


}else{
	window.location.replace('login.html');
}




async function updateList(products){

	let ordersDoc = document.getElementById('orders');
	ordersDoc.innerHTML = '';

	let userId = window.localStorage.getItem("UserID");

  	if (userId) {
		const db = getFirestore(app);
  		const usersCollection = collection(db, "orders");
  		const q = query(usersCollection, where("userId", "==", userId), orderBy("id", "desc"));
		var querySnapshot = await getDocs(q);

		if(querySnapshot.docs.length == 0){
			noProduct();
		}

		querySnapshot.forEach((doc) => {
			try{
				if (doc.data()) {
					appendOrder(products, ordersDoc, doc.data());
				}else{
					noProduct();
				}
			}catch(err) {
				console.log(err);
				noProduct();
			}
		});

	}else{
		noProduct();
	}

}

function appendOrder(products, ordersDoc, order) {
	let orderDiv = document.createElement('div');
	orderDiv.className = "order";
	orderDiv.innerHTML = `
        <div class="orderContent">
          <div class="orderHead">
            <h2 class="orderId">${order.id} (${(order.items.length)} items)</h2>
            <p class="status ${(order.mode==="2") ? "pending" : "delivered"}"> • ${(order.mode === "2") ? "COD" : "PAID"}</p>
          </div>
          ${getList(products, order)}
          <div class="final">
            <div class="orderHead">
              <p>Total: <span class="price">Rs.${order.cost}</span></p>
              <button class="detailButton" onclick="displayDetails('${order.id}shipAddress');">Details</button>
            </div>
            <div class="orderHead">
              <p class="shipping" id="${order.id}shipAddress">${getDateAndMonth(order.placed)}<br>${getAddress(order.address)}</p>
            </div>
          </div>
	`;
	ordersDoc.appendChild(orderDiv);
}

function getAddress(address) {
	return `
		${address.name}<br>
		${address.phone}<br>
		${address.street}<br>
		${address.locality}<br>
		${address.pincode}<br>
		${address.country}
	`;
}

function getDateAndMonth(timeee){
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const d = new Date();
	d.setTime(parseInt(timeee));

	var date = d.getDate();
	var mon = months[d.getMonth()];
	var year = d.getFullYear();

	return `${date}-${mon.toUpperCase()}-${year}`;

}

function getIndex(arr, value){
	return arr.findIndex((obj)=> obj['id'] === value);
}

function getList(products, order){

	let orderList = `<ul class="orderList">`;

	order.items.forEach((item) => {
		let product = (products[item.category][item.sub][item.id]);
		let varIndex = getIndex(product.variations, item.variation);			
		let content = `
			<li class="orderItem">
              <div class="item">
                <div class="image">
                  <img src="${product.variations[varIndex].image}" alt="${item.name}" onerror="src='media/fc.png'">
                </div>
                <div class="details">
                  <h5 class="name">${item.name} (${item.quantity})</h5>
                  <p class="description">${item.variation}</p>
                </div>
              </div>
            </li>
		`;
		orderList = orderList.concat(content);
	});

	return orderList.concat('</ul>');
}


function noProduct(){
	document.getElementById('orders').style.display = 'none';
	document.getElementById('error').style.display = 'flex';
}

function logOut(){
	const auth = getAuth(app);
	signOut(auth).then(() => {
		window.localStorage.setItem('FloraCoUserLogIn', "false");
		showToast('Logged out successfully');
		window.location.replace('index.html');
	}).catch((error) => {
		showToast('Oops!! Please try again later');
	});
}

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 2000);
}


document.getElementById('logout').addEventListener('click', ()=>logOut());
