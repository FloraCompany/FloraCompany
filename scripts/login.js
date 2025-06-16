
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
import { getAuth, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getDatabase, runTransaction, ref, child, get, set, update, remove, goOffline } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

var app = initializeApp(firebaseConfig);

if (window.localStorage.getItem("FloraCoUserLogIn") === "false" || window.localStorage.getItem("FloraCoUserLogIn") === null) {

	const provider = new GoogleAuthProvider();
	const auth = getAuth(app);
	const db = getDatabase(app);

	const googleLogin = document.getElementById('google-login');
	googleLogin.addEventListener('click', ()=>{
		signInWithPopup(auth, provider)
		.then((result) => {

			const { isNewUser } = getAdditionalUserInfo(result);

			if (isNewUser) {
				window.location.replace('signup.html');
			}else{

				get(child(ref(db), 'users/'+result.user.uid)).then((snapshot)=>{
			        var id = snapshot.val();

			        var dataString = {
						name: result.user.displayName.trim(),
						email: result.user.email,
						image: result.user.image,
						id: result.user.uid
			        };

			        dataString = JSON.stringify(dataString);
			        window.localStorage.setItem((id+"data"), dataString);
			        window.localStorage.setItem('UserID', id);
					window.localStorage.setItem("FloraCoUserLogIn", "true");

					goOffline(db);
					let cart = window.localStorage.getItem("FloraCoCart");

					if (cart && cart !== null && cart !== undefined && cart !== "" && cart !== "[]") {
							window.location.replace('cart.html');
					}else {
						window.location.replace('account.html');
					}

			    }).catch((error) => {
			    	console.log(error);
			    });

			}

		}).catch((error) => {
			const errorCode = error.code;
			const erroMessage = error.message;
		});
	});

}else {
	window.location.replace('account.html');
}