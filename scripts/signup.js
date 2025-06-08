import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, deleteField } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getDatabase, runTransaction, ref, child, get, set, update, remove, off } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";


const firebaseConfig = {
	apiKey: "AIzaSyDg_cruaRr3dHWuE8Ddzxk6OXlWKE445kA",
	authDomain: "floraco-main.firebaseapp.com",
	projectId: "floraco-main",
	storageBucket: "floraco-main.firebasestorage.app",
	messagingSenderId: "675774592408",
	appId: "1:675774592408:web:765b6016f902858bb267ed",
	measurementId: "G-2T9X6F21LB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app);
const rdb = getDatabase(app);

onAuthStateChanged(auth, (user) => {
	if (user) {
		updateName(user);
		const uid = user.uid;
		addUser(db, user);
		return uid;
	}else{
		window.location.replace('login.html');
	}
});


function updateName(user){
	document.getElementById('username').value = user.displayName;
	document.getElementById('mail').innerHTML = user.email;
}

async function addUser(db, user){

	let count = 0; 
	document.getElementById('submit').addEventListener('click', ()=>{

		let name = document.getElementById('username').value;
		let email = user.email;
		let image = user.photoURL;
		document.getElementById('submit').disabled = true;

		if (String(document.getElementById('username').value).length > 3) {
			
			runTransaction(child(ref(rdb), 'numericals/users'), (currentValue) => {
					return (count == 0) ? currentValue+1 : currentValue;
			}).then((result) => {
				document.getElementById('submit').disabled = true;
				if (result.committed) {
					count = count+1;
					let id = result.snapshot.val();
					let userId = 'FCUS'+String(id).padStart(5, "0");
					var reff = doc(db, "users", userId);
					const data = {
						name: name.trim(),
						email: email,
						image: image,
						id: userId
					};

					const dataStore = {
						name: name.trim(),
						email: email,
						image: image,
						id: userId
					};

					let dataString = JSON.stringify(dataStore);

					set(ref(rdb, 'users/'+user.uid), userId)
						.then(()=>{
						const docRef = setDoc(reff, data)
						.then(()=>{
							window.localStorage.setItem((userId+"data"), dataString);
							window.localStorage.setItem("FloraCoUserLogIn", "true");
							window.localStorage.setItem('UserID', userId);

							let cart = window.localStorage.getItem("FloraCoCart");

							if (cart && cart !== null && cart !== undefined) {
									window.location.replace('cart.html');
							}else {
								window.location.replace('account.html');
							}
							off(child(ref(rdb), 'numericals/users'));
							off(ref(rdb, 'users/'+user.uid));
							off(rdb);
							off(db);
						})
						.catch((error)=>{
							console.log('Er'+error);
							document.getElementById('submit').disabled = false;
						});
					})
					.catch((e)=>{
						console.log('Err'+e);
						document.getElementById('submit').disabled = false;
					});
				}else{
					count = 0;
					document.getElementById('submit').disabled = false;
				}
			}).catch((err)=>{
					count = 0;
					console.log('Error '+err);
					document.getElementById('submit').disabled = false;
			});

		}else{
			alert('Invalid Details');
			document.getElementById('submit').disabled = false;
		}
	});
	
};