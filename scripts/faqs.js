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
import { displayAnswer } from "../scripts/cartFunctions.js";

window.displayAnswer = displayAnswer;

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

setFAQs();

function setFAQs(){
	fetch("./assets/faqs.json")
	.then((res) => {if (!res.ok) {} return res.json();})
	.then((data) => {
		let rightContent = document.getElementById('rightContent');
		let content  = `<h1>Frequently Asked Questions</h1>`;
		data.forEach((QA, index) => {
			let qna = `
				<div class="qna" onclick="displayAnswer('${index}');">
		          <h4 class="question">${QA.question}</h4>
		          <hr id="${index}hr" class="hr">
		          <p class="description" id="${index}p">${QA.answer}</p>
		        </div>
			`;
			content = content.concat(qna);
		});
		rightContent.innerHTML = content;

	}).catch((error) => {console.log(error);});

}

document.getElementById('logout').addEventListener('click', ()=>logOut());

