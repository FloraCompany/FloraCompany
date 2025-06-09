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
import { getFirestore, collection, query, where, getDocs, Timestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

var app = initializeApp(firebaseConfig);

document.getElementById('menu').addEventListener('click', ()=>{
	document.getElementById('asideMenu').classList.toggle('asideOpen');
});

document.getElementById('close').addEventListener('click', ()=>{
	document.getElementById('asideMenu').classList.toggle('asideOpen');
});

document.getElementById('show-more').addEventListener('click', ()=>{
	showMore();
});

document.getElementById('filter').addEventListener('change', ()=>{
	filterSelected();
});

document.getElementById('sort').addEventListener('change', ()=>{
	display();
});

document.getElementById('searchButton').addEventListener('click', ()=> filterSearch());
document.getElementById('search').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    filterSearch();
  }
});

const categories = {
	"floral-supply": ["flowers", "decorations", "buds"],
	"plant": ["air", "aquatic", "bamboo", "bonsai", "cactus", "carnivorus", "climber", "conifer", "creeper", "cycad", "decorative", "flowering", "ferns", "ficus", "fig", "fruit", "grafted-fruit", "ground-cover", "herb", "kokedama", "palm", "perennial", "shrubs", "spice", "succulent", "vegetable"],
	"tree": ["fruit-tree", "shade-tree", "evergreen"],
	"seed": ["vegetable", "flower", "herb"],
	"bulb": ["flowering", "fruit"],
	"soil": ["potting-mix", "compost", "topsoil", "cocopeat"],
	"fertilizer": ["organic", "chemical", "liquid"],
	"pot-and-vase": ["ceramic", "plastic", "glass"],
	"gardening-tool": ["outdoor", "indoor"]
};

let params = new URLSearchParams(window.location.search);
let category = params.get('category');
let sub = params.get('sub');
let id = params.get('id');
let offer = params.get('offer');

let variation = 0;
let product = '';
let quantity = 0;
let products = [];
let filterProducts = [];
let displayAmount = 15;

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
	setUpProductList();
	display();
}

function filterData(){
	const arr = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }];
	const valueToRemove = 'Bob';
	const newArr = arr.filter(obj => obj.name !== valueToRemove);
}

function noProduct(){
	document.getElementById('productsContainer').style.display = 'none';
	document.getElementById('error').style.display = 'flex';
}

function enableProduct(){
	document.getElementById('productsContainer').style.display = 'flex';
	document.getElementById('error').style.display = 'none';
}

function populateContent(products) {

	let content = document.getElementById('productsList');

	content.innerHTML = '';

	if (displayAmount > products.length) {
		document.getElementById('show-more').style.display = 'none';
	}else{
		document.getElementById('show-more').style.display = 'block';
	}

	products = Object.values(products);

	let sortType = parseInt(document.getElementById('sort').value);

	if (sortType == 0) {
		products = products.sort((a,b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});
	}else if (sortType == 1) {
		products = products.sort((a,b) => {
			if (a.name < b.name) return 1;
			if (a.name > b.name) return -1;
			return 0;
		});
	}else  if (sortType == 2) {
		products = products.sort((a,b) => { return parseInt(a.variations[0].price) - parseInt(b.variations[0].price);});
	}else  if (sortType == 3) {
		products = products.sort((a,b) => { return parseInt(b.variations[0].price) - parseInt(a.variations[0].price);});
	}

	let productsOffer = JSON.parse(window.localStorage.getItem('FloraCoOfferProducts'));
	products.slice(0, displayAmount).forEach((obj, index) => {

		let variant = obj.variations[0].id;
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
}

function filterSearch(){
	let search = document.getElementById('search').value;

	let filteredList = [];

	if (search.trim() !== "") {
		Object.values(filterProducts).forEach(product => {

			if(String(Object.values(product)[0].name).toLowerCase().includes(search.toLowerCase())){
				filteredList = filteredList.concat(Object.values(product));
			}
		});
			
		if (filteredList.length == 0) {
			noProduct();
		}else {
			showData(filteredList);
		}
	}else{
		showData(products);
	}

}

function showData(product){

	if (product) {
		enableProduct();
		populateContent(product);
	} else {
		noProduct();
	}
}

function capitalizeFirstLetter(val) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function sortList(){
	let sortType = parseInt(document.getElementById('sort').value);

	if (sortType == 0) {
		products = products.sort((a,b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});
	}else if (sortType == 1) {
		products = products.sort((a,b) => {
			if (a.name < b.name) return 1;
			if (a.name > b.name) return -1;
			return 0;
		});
	}else  if (sortType == 2) {
		products = products.sort((a,b) => { parseInt(a.price) - parseInt(b.price)});
	}else  if (sortType == 3) {
		products = products.sort((a,b) => { parseInt(b.price) - parseInt(a.price)});
	}
}

function populateFilter(){

	let filter = document.getElementById('filter');

	if (categories[category]) {
		categories[category].forEach(opt => {
			let option = document.createElement('option');
			option.value = opt;
			option.innerHTML = capitalizeFirstLetter(String(opt).replaceAll('-', " "));
			filter.appendChild(option);
		});
	}
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


function filterSelected(){
	sub = document.getElementById('filter').value;
	document.getElementById('search').value = '';
	display();
}

function setHeading(){
	let words = String(category).split("-");
	let content = document.getElementById("headContent");
	content.innerHTML = '';
	words.forEach(word=>{
		let div = document.createElement('div');

		word.split('').forEach(letter =>{
			let span = document.createElement('span');
			span.innerHTML = letter;
			div.appendChild(span);
		});

		content.appendChild(div);
	});
	document.getElementById('search').placeholder='Search '+String(category).replaceAll("-", " ");

	if (sub) {
		document.getElementById('filter').value = sub;
	}

}

function display() {

	setHeading();
	setUpProductList(); 

	fetch("./assets/products.json")
	.then((res) => {if (!res.ok) {} return res.json();})
	.then((data) => {

		try{
			let cat = data['products']['all'][category];
			products = [];
			filterProducts = cat;

			if (category && sub && sub !== "all") {

				if (cat) {
					products = cat[sub];
					if (products){
						products = Object.values(products);
						showData(products);
					}else{
						noProduct();
					}
				} else {
					noProduct();
				}
			} else if (category || sub == "all") {

				if (cat) {
					Object.values(cat).forEach(product => {
						products = products.concat(Object.values(product));
					});
					showData(products);
				}else{
					noProduct();
				}
			} else {
				location.replace('products.html?category=plant');
				noProduct();
			}

			}catch(error){
				noProduct();
			}
		
	}).catch();

}

function showMore() {

	let content = document.getElementById('productsList');

	content.innerHTML = '';

	if (displayAmount < products.length) {
		displayAmount = displayAmount + 5;
	}
	display();
}

populateFilter();

document.getElementById('sort').value = "2";

updateList();
