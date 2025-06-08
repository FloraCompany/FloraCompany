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
import { getAuth, GoogleAuthProvider, signOut, deleteUser, reauthenticateWithPopup } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

var app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function editAccount(){
	document.getElementById('aedit').style.display="none";
	document.getElementById('asave').style.display="block";
	document.getElementById('acancel').style.display="block";
	document.getElementById('name').disabled=false;
	document.getElementById('name').style.borderColor="#333";
}

function editInformation(){
	document.getElementById('iedit').style.display="none";
	document.getElementById('isave').style.display="block";
	document.getElementById('icancel').style.display="block";
	document.getElementById('phone').disabled=false;
	document.getElementById('phone').style.borderColor="#333";
	document.getElementById('street').disabled=false;
	document.getElementById('street').style.borderColor="#333";
	document.getElementById('locality').disabled=false;
	document.getElementById('locality').style.borderColor="#333";
	document.getElementById('pin').disabled=false;
	document.getElementById('pin').style.borderColor="#333";
}

function cancelAccount(){
	document.getElementById('aedit').style.display="block";
	document.getElementById('asave').style.display="none";
	document.getElementById('acancel').style.display="none";
	document.getElementById('name').disabled=true;
	document.getElementById('name').style.borderColor="#ccc";
	updateFields();
}

function cancelInformation(){
	document.getElementById('iedit').style.display="block";
	document.getElementById('isave').style.display="none";
	document.getElementById('icancel').style.display="none";
	document.getElementById('phone').disabled=true;
	document.getElementById('phone').style.borderColor="#ccc";
	document.getElementById('street').disabled=true;
	document.getElementById('street').style.borderColor="#ccc";
	document.getElementById('locality').disabled=true;
	document.getElementById('locality').style.borderColor="#ccc";
	document.getElementById('pin').disabled=true;
	document.getElementById('pin').style.borderColor="#ccc";
	updateFields();
}

function updateFields(){
	let data = JSON.parse(window.localStorage.getItem(String(window.localStorage.getItem('UserID')+'address')));
	let userData = JSON.parse(window.localStorage.getItem(String(window.localStorage.getItem('UserID')+'data')));

	console.log(userData);

	if (userData) {
		document.getElementById('name').value = userData.name;
		document.getElementById('email').value = userData.email;
	}

	if(data){
		document.getElementById('phone').value = data.phone ? data.phone : '';
		document.getElementById('street').value = data.street ? data.street : '';
		document.getElementById('locality').value = data.locality ? data.locality : '';
		document.getElementById('pin').value = data.pincode ? data.pincode : '';
	}
}

function saveUsername(){
	let userData = JSON.parse(window.localStorage.getItem(String(window.localStorage.getItem('UserID')+'data')));
	let name = document.getElementById('name').value;
	if(userData && name.trim() !== ""){
		userData.name = name;
	}
	window.localStorage.setItem(String(window.localStorage.getItem('UserID')+'data'), JSON.stringify(userData));
	updateFields();
	cancelAccount();
}

function saveInfo(){

	let name = String(document.getElementById('name').value);
	let phone = String(document.getElementById('phone').value);
	let street = String(document.getElementById('street').value);
	let locality = String(document.getElementById('locality').value);
	let pincode = String(document.getElementById('pin').value);
	let country = String(document.getElementById('country').value);

	let address = {
		name: name,
		phone: phone,
		street: street,
		locality: locality,
		pincode: pincode,
		fullAdd: '',
		country: country
	};

	let userId = window.localStorage.getItem('UserID');
	window.localStorage.setItem(userId+'address', JSON.stringify(address));
	
	updateFields();
	cancelInformation();
}

function logOut(){
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


function showLongToast(message) {
  var toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 60000);
}

function deleteAccount(){

	const user = auth.currentUser;

	deleteUser(user).then(() => {

		let userId = window.localStorage.getItem('UserID');
		window.localStorage.clear();
		
		showLongToast('Your account has been successfully deleted. Any pending orders will be delevered without fail. Kindly receive the orders on time');
		deleteDocument('users', userId, (error) => {
			if (error) {

			}else{
				window.location.replace('index.html');
			}
		});

	}).catch((error) => {
		console.log(error);
		reauthWithGoogle();
	});
}

const deleteDocument = async (collectionName, documentId, callBack) => {
  try {
  	let db = getFirestore(app);
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    callBack(null);
    console.log(`Document with ID ${documentId} deleted successfully from collection ${collectionName}`);
  } catch (error) {
  	callBack(error);
    console.log("Error deleting document:", error);
  }
};

function reauthWithGoogle() {

	reauthenticateWithPopup(auth.currentUser, new GoogleAuthProvider())
      .then(() => {
      		deleteAccount();
      })
      .catch((error) => {
        console.log(error);
	  	showToast('Error Delete Account. Plase try again or Contact floracompanydot@gmail.com');
	});
}


if (window.localStorage.getItem("FloraCoUserLogIn") === "true") {
	updateFields();
}else{
	window.location.replace('login.html');
}


document.getElementById('deleteAccount').addEventListener('click', ()=>deleteAccount());

document.getElementById('logout').addEventListener('click', ()=>logOut());


document.getElementById('isave').addEventListener('click', ()=>saveInfo());


document.getElementById('iedit').addEventListener('click', ()=>editInformation());


document.getElementById('icancel').addEventListener('click', ()=>cancelInformation());


document.getElementById('asave').addEventListener('click', ()=>saveUsername());


document.getElementById('aedit').addEventListener('click', ()=>editAccount());


document.getElementById('acancel').addEventListener('click', ()=>cancelAccount());

