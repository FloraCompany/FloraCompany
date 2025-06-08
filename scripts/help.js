import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, doc, deleteDoc, setDoc, query, where, updateDoc, getDocs, limit, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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
let db = getFirestore(app);

function logOut(){
	var app = initializeApp(firebaseConfig);
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


function setDefaultSub(){
	const params = new URLSearchParams(window.location.search);
	const sub = params.get('sub');

	if (sub) {
  		document.getElementById('subject').value  = sub;
	}
}

document.getElementById('logout').addEventListener('click', ()=>logOut());


document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const mode = document.getElementById('mode').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;

  if (String(name).trim() !== "" && String(email).trim() !== "" && String(subject).trim() !== "" && String(message).trim() !== "") {

  		const data = {
  			id: '',
  			name: name,
  			category: mode,
  			sub: subject,
  			email: email,
  			content: message,
  			time: Timestamp.fromDate(new Date()),
  			status: false
  		}

  		let problem = mode;

  		if (mode === "Other") {
  			problem = 'feedback';
  		}

  		addDataWithCustomId(data);

		document.getElementById('name').value = '';
		document.getElementById('mode').value = '';
		document.getElementById('email').value = '';
		document.getElementById('subject').value = '';
		document.getElementById('message').value = '';

  		showToast('We have received your '+mode+ '. We\'ll get back to you via email');

  }


});

async function addDataWithCustomId(data) {
   const collectionRef = collection(db, "feedbacks");
   const docRef = doc(collectionRef);
   const uniqueId = docRef.id;
   data.id += uniqueId;
   await setDoc(docRef, data);
   console.log("Document ID:", data);
   return uniqueId;
}
setDefaultSub();
