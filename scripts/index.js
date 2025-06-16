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
import { getFirestore, collection, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

var app = initializeApp(firebaseConfig);


const track = document.getElementById("carouselTrack");
const dotsContainer = document.getElementById("carouselDots");
const slides = document.querySelectorAll(".carousel-slide");
const totalSlides = slides.length;
let currentIndex = 0;
let interval;
let products = [];

const dots = document.querySelectorAll(".dot");

updateList();

document.querySelector(".arrow.left").addEventListener("click", () => {
	prevSlide();
	resetInterval();
});

document.querySelector(".arrow.right").addEventListener("click", () => {
	nextSlide();
	resetInterval();
});

document.getElementById('menu').addEventListener('click', ()=>{
	document.getElementById('asideMenu').classList.toggle('asideOpen');
});

document.getElementById('close').addEventListener('click', ()=>{
	document.getElementById('asideMenu').classList.toggle('asideOpen');
});

document.getElementById('shop').addEventListener('click', ()=>{
	shopNow();
});

document.getElementById('show-more').addEventListener('click', ()=>{
	showMore();
});

async function setUpProductList(){

	let productsOffer = {};

	let offers = JSON.parse(window.localStorage.getItem('FloraCoOffers'));

	offers.forEach((offer) => {

		if (offer.items.length > 0) {

			(offer.items).forEach(item => {
				if (productsOffer[item]) {
					productsOffer[item] += offer.discount;
				}else{
					productsOffer[item] = offer.discount;
				}
			});

		}
	});

	window.localStorage.setItem('FloraCoOfferProducts', JSON.stringify(productsOffer));
}

function setUpDots(){

	  for (let i = 0; i < totalSlides; i++) {
	    const dot = document.createElement("div");
	    dot.className = "dot";
	    if (i === 0) dot.classList.add("active");
	    dot.addEventListener("click", () => {
	      currentIndex = i;
	      updateCarousel();
	      resetInterval();
	    });
	    dotsContainer.appendChild(dot);
	  }

	  let startX = 0;
	  track.addEventListener("touchstart", e => startX = e.touches[0].clientX);
	  track.addEventListener("touchend", e => {
	    let endX = e.changedTouches[0].clientX;
	    if (endX < startX - 50) {
	      nextSlide();
	    } else if (endX > startX + 50) {
	      prevSlide();
	    }
	    resetInterval();
	  });
}

function updateCarousel() {
	track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function nextSlide() {
	currentIndex = (currentIndex + 1) % totalSlides;
	updateCarousel();
}

function prevSlide() {
	currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
	updateCarousel();
}

function startInterval() {
	interval = setInterval(nextSlide, 4000);
}

function resetInterval() {
	clearInterval(interval);
	startInterval();
}

function getOffers(){
	let offers = JSON.parse(window.localStorage.getItem('FloraCoOffers'));

	let carouselTrack = document.getElementById('carouselTrack');
	carouselTrack.innerHTML = '';

	if (offers.length >= 0) {

		offers.forEach((offer) => {

			let div = document.createElement('div');
			div.className = "carousel-slide";

			div.innerHTML = `

				<a href="products.html?category=${offer.category}" title="">
						    		
		    		<img src="${offer.image}" alt="${offer.name}">

		    	</a>

			`;

			carouselTrack.appendChild(div);

		});
	  	// startInterval();
	}

	console.log(offers);


	display();
}

async function updateList(){

    const date = new Date();
    const timestampFromDate = Timestamp.fromDate(date);
    const now = Timestamp.now();
	const db = getFirestore(app);
	const usersCollection = collection(db, "offers");
	const q = query(usersCollection, where("validity", ">=", now));

	var querySnapshot = await getDocs(q);

	if(querySnapshot.docs.length == 0){
		window.localStorage.setItem('FloraCoOffers', '[]');
	}

	let offers = [];

	querySnapshot.forEach(doc => {

		offers.push(doc.data());

	});

	window.localStorage.setItem('FloraCoOffers', (JSON.stringify(offers)));

	getOffers();
}

function showMore(){
	location.replace('products.html?category=plant');
}

function getPrice(isNotOffer, productsOffer, price){

	if (!isNotOffer) {
		return Math.ceil((parseInt(price) - ((parseInt(price)*productsOffer)/100)));
	}else{
		return price;
	}

}

function getSpanOfferPrice(productOffer, price){

	if (productOffer) {
		return Math.ceil((parseInt(price) + (parseInt(price)*productOffer)));
	}else{
		return price;
	}

}

function getDiscount(productsOffer, id){

	if (isNotOfferProduct(productsOffer, id)) {
		return 10;
	}else{
		return (productsOffer[String(id)]);
	}

}

function isNotOfferProduct(productsOffer, id){
	return (productsOffer[String(id)] === undefined); 
}


function showData(products){

	let productsOffer = JSON.parse(window.localStorage.getItem('FloraCoOfferProducts'));
	let content = document.getElementById('productsList');
	content.innerHTML = '';

	Object.values(products).slice(0, 9).forEach(prod => {
		Object.values(prod).forEach((obj, index) => {

			const li = document.createElement('li');
			li.className = 'productCard';
			li.innerHTML = `
				<a href="product.html?category=${obj.parentCategory}&sub=${obj.subCategory}&id=${obj.id}" class="cardA">
					<div class="card">
						<div class="cardImg">
							<img class="cardImageView" src="${obj.variations[0].image}" onerror="this.onerror=null;this.src='./media/fc.png';">
						</div>
						<div class="cardText">
							<p class="category">${obj.parentCategory}</p>
							${isNotOfferProduct(productsOffer, obj.id) ? '' : '<p class="productOffer">'+getDiscount(productsOffer, obj.id)+'% off</p>'}
							<h3 class="title">${obj.name}</h3>
							<span class="priceSpan">${isNotOfferProduct(productsOffer, obj.id) ? getSpanOfferPrice(0.1, obj.variations[0].price) : obj.variations[0].price}</span>
							<h3 class="price">${getPrice(isNotOfferProduct(productsOffer, obj.id), getDiscount(productsOffer, obj.id), obj.variations[0].price)}</h3>
						</div>
					</div>
					<button>Details</button>
				</a>
			`;
			content.appendChild(li);
			
		});
	});

		/*
		<p><strong>ID:</strong> ${prod.id}</p>
		<p><strong>Name:</strong> ${prod.name}</p>
		<p><strong>Description:</strong> ${prod.description}</p>
		<p><strong>Category:</strong> ${prod.parentCategory} > ${prod.subCategory}</p>
		<p><strong>Tags:</strong> ${prod.tags}</p>
		<p><strong>Stock Status:</strong> ${prod.stockStatus ? 'Active' : 'Inactive'}</p>
		<p><strong>Variations:</strong></p>
		<ul>
		  ${prod.variations.map(v => `<li>${v.id} - ${v.name} - <a href="${v.image}" target="_blank">Image</a></li>`).join('')}
		</ul>
		*/
}

function display() {
  fetch("./assets/products.json")
  	.then((res) => {if (!res.ok) {} return res.json();})
  	.then((data) => {
	  
	  products = data['products']['all'];

	  setUpProductList();
	  showData(products['plant']);
  
	}).catch();
}

function shopNow(){
	location.replace("products.html?category=plant");
}

