document.getElementById('menu').addEventListener('click', ()=>{
	document.getElementById('asideMenu').classList.toggle('asideOpen');
});

document.getElementById('close').addEventListener('click', ()=>{
	document.getElementById('asideMenu').classList.toggle('asideOpen');
});


const params = new URLSearchParams(window.location.search);
const category = params.get('category');
const sub = params.get('sub');
const id = params.get('id');

let option = params.get('option');
let variation = 0;
let product = '';
let quantity = 1;
let price = 199;

function decrease(){
	if (quantity > 1){
		--quantity;
	}
	document.getElementById('quantity'+id).value = quantity;
	if (quantity >= 50) {
		document.getElementById('quantity'+id).style.color="green";
		document.getElementById('quantity'+id).style.fontSize="1.2rem";
	} else {
		document.getElementById('quantity'+id).style.color="#000";
		document.getElementById('quantity'+id).style.fontSize="1rem";
	}
}

function increase(){
	++quantity;
	document.getElementById('quantity'+id).value = quantity;
	if (quantity >= 50) {
		document.getElementById('quantity'+id).style.color="green";
		document.getElementById('quantity'+id).style.fontSize="1.2rem";
	} else {
		document.getElementById('quantity'+id).style.color="#333333";
		document.getElementById('quantity'+id).style.fontSize="1rem";
	}
}

function noProduct(){
	document.getElementById('container').style.display = 'none';
	document.getElementById('error').style.display = 'flex';
}

function changeVariation(variant, vari){
	variation = variant;
	option = JSON.parse(vari).id;
	showData(product);
}

function populateContent(product) {

	if (option) {
		variation = checkObjectIndex(product.variations, option);
	}else{
		option = product.variations[variation].id;
	}

	setQuantity();

	let productsOffer = JSON.parse(window.localStorage.getItem('FloraCoOfferProducts'));
	let productOffer = document.getElementById("productOffer");
	
	price = getPrice(isNotOfferProduct(productsOffer, product.id), getDiscount(productsOffer, product.id), product.variations[variation].price);


	document.title = 'FloraCo • '+product.name;
	document.getElementById("prdImg").src = product.variations[variation].image;
	document.getElementById("title").innerHTML = product.name;
	document.getElementById("prdPrice").innerHTML = price;
	document.getElementById("discountPrice").innerHTML = isNotOfferProduct(productsOffer, product.id) ? getSpanOfferPrice(0.1, product.variations[variation].price) : product.variations[variation].price;
	document.getElementById("availability").innerHTML = (product.variations[variation].stock) ? 'Available In Stock' : 'Out Of Stock';
	document.getElementById("description").innerHTML = (product.description);
	

	if(isNotOfferProduct(productsOffer, product.id)){
		productOffer.style.display = 'none';
	} else {
		productOffer.style.display = 'block';
		productOffer.innerHTML = getDiscount(productsOffer, product.id)+'% off';
	}

	if (product.variations[variation].stock) {
		document.getElementById('addCart').innerHTML = 'Add to Cart';
		document.getElementById('addCart').disabled = false;
		document.getElementById('qtyControl').style.display = 'flex';
	}else{
		document.getElementById('addCart').innerHTML = 'Out Of Stock';
		document.getElementById('addCart').disabled = true;
		document.getElementById('qtyControl').style.display = 'none';
	}

	let variations = document.getElementById("variations");
	variations.innerHTML = '';
	(product.variations).forEach((vari, index) => {
		const label = document.createElement('label');

		if (index == variation) {
			label.innerHTML = `
				<input type="radio" name="size-radio" checked="true" />
				<p>${vari['name']}</p>
			`;
		} else {
			label.innerHTML = `
				<input type="radio" name="size-radio" onclick="changeVariation(${index}, '${JSON.stringify(vari).replace(/"/g, '&quot;')}');"/>
				<p>${vari['name']}</p>
			`;
		}
		variations.appendChild(label);
	});
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


function showData(product){

	if (product) {
		populateContent(product);
	} else {
		noProduct();
	}
}

function setLinks(){

	let links = [{"name": "Home", "link": "index.html"}, {"name": capitalizeFirstLetter(String(category).replaceAll('-', " ")), "link": "products.html?category="+category}, {"name": capitalizeFirstLetter(String(sub).replaceAll('-', " ")), "link": "products.html?category="+category+'&sub='+sub}];

	let linkDoc = document.getElementById('flow');
	linkDoc.innerHTML = '';

	links.forEach((data) => {
		let link = document.createElement('div');
		link.className = "link";
		link.innerHTML = `
	        <a href="${data.link}" title="">${data.name}</a>
	        <div class="arrow">
	          <i class="fi fi-ss-angle-small-right"></i>
	        </div>
		`;
		linkDoc.appendChild(link);
	});
}

function setQuantity(){
	let qtyControl = document.getElementById('qtyControl');
	qtyControl.innerHTML = `

          <button type="button" class="qty-btn" id="decrease" onclick="decrease();">-</button>
          <input type="number" id="quantity${id}" value="1" onchange="changeQuantity();">
          <button type="button" class="qty-btn" id="increase" onclick="increase();">+</button>
	`;	
}

function display() {
  fetch("./assets/products.json")
  	.then((res) => {if (!res.ok) {} return res.json();})
  	.then((data) => {

  		if (category && sub && id) {
  			try{
  				setLinks();
  				product = data['products']['all'][category][sub][id];
	  			showData(product);
  			}catch(error){
  				console.log(error);
  				noProduct();
  			}
  		} else {
  			noProduct();
  		}
  
	}).catch();
}

function capitalizeFirstLetter(val) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function checkValueExists(arr, key, value) {
	return arr.some(obj => obj[key] === value);
}

function checkInnerValueExists(arr, key, subKey, value1, value2) {

	let ind = -1;
	arr.forEach((obj, index) => {

		if ((obj[key] === value1) && (obj[subKey] === value2)) {
			ind = index;
		}

	});

	return ind;
}

function changeQuantity(){
	quantity = parseInt(document.getElementById('quantity'+id).value);
	console.log(quantity);
}

function checkObjectIndex(arr, object) {
	return arr.findIndex(obj => obj.id === object);
}

function addToCart(){

	quantity = parseInt(document.getElementById('quantity'+id).value);
	if (quantity > 0) {
		document.getElementById('promptQuantity').innerHTML = '';
		let data = window.localStorage.getItem('FloraCoCart');

		let jsonData = data ? JSON.parse(data) : [];

		if (!Array.isArray(jsonData)) {
			jsonData = [jsonData];
		}

		const cartItem = {
			id: id,
			category: category,
			sub: sub,
			name: product.name,
			variation: option,
			price: price,
			quantity: quantity
		}

		let indexVal = checkInnerValueExists(jsonData, 'id', 'variation', id, option);
		if (indexVal === -1) {
			jsonData.push(cartItem);
		}else{
			let obj = jsonData[indexVal];
			obj.quantity = parseInt(obj.quantity) + quantity;
			jsonData[indexVal] = obj;
		}
		showLoad(cartItem);
		window.localStorage.setItem('FloraCoCart', JSON.stringify(jsonData));
	}else{
		document.getElementById('promptQuantity').innerHTML = 'Quantity must be atleast 1';
	}
	
}

function showLoad(cartItem){
	document.getElementById('addCart').style.display = 'none';
	document.getElementById('addToCartLoader').style.display = 'flex';
	setTimeout(function() {
		hideLoad(cartItem);
	}, 500);
}

function hideLoad(cartItem){
	showToast(cartItem.name+' added to cart');
	document.getElementById('addCart').style.display = 'block';
	document.getElementById('addToCartLoader').style.display = 'none';
}

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 2000);
}

display();
