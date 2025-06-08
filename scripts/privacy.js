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


document.getElementById('logout').addEventListener('click', ()=>logOut());

setPrivacyPolicy();


function setPrivacyPolicy(){

	document.title = 'FloraCo • Privacy';

	let privacyPolicy = `
		
  <h1>Privacy Policy for FloraCo</h1>
  <p><strong>Effective Date:</strong> 28/05/2005</p>

  <p>At <strong>FloraCo</strong>, your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>[www.floraco.com]</strong> and interact with our services.</p>

  <h2>Information We Collect</h2>
  <p>We may collect the following types of personal information:</p>
  <ul>
    <li><strong>Contact Information:</strong> such as name, email address, phone number.</li>
    <li><strong>Order Information:</strong> shipping address, billing address, payment method (handled securely via third-party providers).</li>
    <li><strong>Account Information:</strong> username, password (hashed), preferences.</li>
    <li><strong>Feedback and Inquiries:</strong> messages, support queries, or feedback.</li>
    <li><strong>Usage Data:</strong> IP address, browser type, referring pages, device information, and browsing patterns.</li>
  </ul>

  <h2>How We Use Your Information</h2>
  <p>We use your data to:</p>
  <ul>
    <li>Fulfill and manage your orders.</li>
    <li>Provide customer support and respond to inquiries.</li>
    <li>Improve our website and services.</li>
    <li>Send promotional emails or newsletters (with your consent).</li>
    <li>Prevent fraud and ensure website security.</li>
    <li>Comply with legal obligations.</li>
  </ul>

  <h2>Cookies and Tracking Technologies</h2>
  <p>We use cookies and similar technologies to:</p>
  <ul>
    <li>Remember your preferences and improve your experience.</li>
    <li>Analyze website traffic and usage trends.</li>
    <li>Personalize content and ads.</li>
  </ul>
  <p>You can control or disable cookies through your browser settings.</p>

  <h2>Sharing Your Information</h2>
  <p>We do not sell or rent your personal data. We may share it with:</p>
  <ul>
    <li><strong>Service Providers</strong> (e.g., payment processors, shipping companies).</li>
    <li><strong>Analytics Providers</strong> (e.g., Google Analytics) to understand usage patterns.</li>
    <li><strong>Legal Authorities</strong> if required by law or to protect our rights.</li>
  </ul>

  <h2>Data Security</h2>
  <p>We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

  <h2>Your Rights</h2>
  <p>Depending on your location, you may have the right to:</p>
  <ul>
    <li>Access, correct, or delete your personal information.</li>
    <li>Withdraw consent for marketing communications.</li>
    <li>Object to or restrict certain data processing.</li>
  </ul>
  <p>To exercise these rights, contact us at <strong>floracompanydot@gmail.com</strong>.</p>

  <h2>Children’s Privacy</h2>
  <p>FloraCo does not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>

  <h2>Third-Party Links</h2>
  <p>Our site may contain links to other websites. We are not responsible for their privacy practices. Please review their policies independently.</p>

  <h2>Updates to This Policy</h2>
  <p>We may update this Privacy Policy periodically. Any changes will be posted on this page with a new effective date.</p>

  <h2>Contact Us</h2>
  <p>If you have any questions or concerns about this Privacy Policy, please contact:</p>
  <p><strong>FloraCo</strong><br>
  Email: <strong><a href="mailto:floracompanydot@gmail.com">floracompanydot@gmail.com</a></strong><br>
Address: Satyakameswari street, dwaraka nagar<br>kakinada<br>533003<br>Andhra Pradesh India
	`;


	document.getElementById('privacy').innerHTML = privacyPolicy;
}

