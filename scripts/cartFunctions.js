let finalAmount = 0;

export function changeQuantity (item, cart, index) {
	cart = JSON.parse(cart);
	let data = cart[index];

	if (parseInt(item.value) <= 0) {
		showToast('Quantity should be atleast 1');
		item.value = 1;
	}

	data.quantity = parseInt(item.value);
	cart[index] = data;
	document.getElementById(data.id+data.variation+'price').innerHTML = getPrice(JSON.stringify(data));
	window.localStorage.setItem('FloraCoCart', JSON.stringify(cart));
	display();
}

export function increase (cart, index)  {

	cart = JSON.parse(cart);
	let data = cart[index];

	let item = document.getElementById(data.id+data.variation+'quantity');
	let qty = parseInt(item.value);
	item.value = qty+1;
	changeQuantity(item, JSON.stringify(cart), index);
}

export function decrease (cart, index)  {

	cart = JSON.parse(cart);
	let data = cart[index];

	let item = document.getElementById(data.id+data.variation+'quantity');
	let qty = parseInt(item.value);

	if (qty > 1) {
		item.value = qty-1;
	}else{
		showToast('Quantity should be atleast 1');
		item.value = 1;
	}
	changeQuantity(item, JSON.stringify(cart), index);
}

export function getPrice(cartItem){
	cartItem = JSON.parse(cartItem);
	return (cartItem.quantity*parseInt(cartItem.price));
}

export function showToast(message) {
  var toast = document.getElementById("toast");
  toast.innerHTML = message;
  toast.classList.add("show");
  setTimeout(function(){ toast.classList.remove("show"); }, 2000);
}

export function removeItem(cart, index){
	cart = JSON.parse(cart);
	showToast(cart[index].name+' removed');
	cart.splice(index, 1);
	window.localStorage.setItem('FloraCoCart', JSON.stringify(cart));
	display();
}

export function updateSummary(cart){

	document.getElementById('item-count').innerHTML = cart.length;

	let total = 0;
	let discount = 0;

	cart.forEach((item)=>{
		total += (parseInt(item.quantity)*parseInt(item.price));
	});

	finalAmount = total;
	document.getElementById('item-cost').innerHTML = total;

	if (discount > total) {
		discount = 0;
	}

	finalAmount = total-discount;

	if (finalAmount >= 2000) {
		document.getElementById('cod').style.display = 'none';
	}else{
		document.getElementById('cod').style.display = 'block';
	}

	document.getElementById('discount').innerHTML = discount;
	document.getElementById('final-price').innerHTML = finalAmount;
	document.getElementById('checkout').innerHTML = `Checkout (Rs.${document.getElementById('final-price').innerHTML})`;
	updateFields();
	applyCoupon();
}

export function applyCoupon(){
	let coupons = JSON.parse(window.localStorage.getItem('FloraCoCoupons'));

	// coupons = coupons ? coupons : [];
	let couponIN = document.getElementById('coupon-input');
	let couponStatus = document.getElementById('coupon-status');
	let coupon = String(couponIN.value).toUpperCase();
	if (coupons && coupon !== "" && coupons[coupon]) {
		let offer  = coupons[coupon];

		let final = document.getElementById('final-price');
		let discount = parseInt(((parseInt(finalAmount)*parseInt(offer))/100));
		finalAmount = parseInt(finalAmount)-discount;

		couponStatus.innerHTML = `Applied ${offer}% off<br>(- Rs.${discount})`;
		couponStatus.style.color = 'green';
		couponStatus.style.textAlign = 'end';
		final.innerHTML = parseInt(finalAmount);

		document.getElementById('checkout').innerHTML = `Checkout (Rs.${document.getElementById('final-price').innerHTML})`;
		couponIN.disabled = true;
		document.getElementById('apply').disabled = true;
		
		if (parseInt(finalAmount) >= 2000) {
			document.getElementById('cod').style.display = 'none';
		}else{
			document.getElementById('cod').style.display = 'block';
		}

	}else{

		if (coupon === "") {
			couponStatus.innerHTML = 'Not Applied';
		}else{
			couponStatus.innerHTML = 'Invalid Coupon';
		}

		couponStatus.style.color = 'red';
	}
}

function getIndex(arr, value){
	return arr.findIndex((obj)=> obj['id'] === value);
}

export function display(){

	let data = window.localStorage.getItem('FloraCoCart');


	if (data) {
		let cart = JSON.parse(data);
		if (cart.length > 0) {
			let table = document.getElementById('tableBody');
			table.innerHTML = '';
			cart.forEach((cartItem, index)=>{
				let row = document.createElement('tr');
				let id = cartItem.id;

				try{
					fetch("./assets/products.json")
					.then((res) => {if (!res.ok) {} return res.json();})
					.then((item) => {
						let product = (item['products']['all'][cartItem.category][cartItem.sub][cartItem.id]);
						let varIndex = getIndex(product.variations, cartItem.variation);
						row.innerHTML = `
				            <td>
				            	<div class="image">
				              		<i class="fi fi-ss-minus-circle" onclick="removeItem('${JSON.stringify(cart).replace(/"/g, '&quot;')}', ${index})"></i>
				              		<img src="${product.variations[varIndex].image}" class="product-img"  onerror="src='./media/fc.png';" />
				              	</div>
				            </td>
				            <td class="product-info">
				              <div class="product-box">
				                <div class="product-details">
				                  <p class="product-name">${product.name}</p>
				                  <p class="product-id">${product.variations[varIndex].id}</p>
				                </div>
				              </div>
				            </td>
				            <td>
				              <div class="quantity-control">
				                <div class="qtycontrol">
				                  <p type="button" class="qty-btn" id="decrease" onclick="decrease('${JSON.stringify(cart).replace(/"/g, '&quot;')}', ${index});">-</p>
				                  <input type="number" id="${String(cartItem.id)}${String(cartItem.variation)}quantity" min-value=1 onchange="changeQuantity(this, '${JSON.stringify(cart).replace(/"/g, '&quot;')}', ${index});" value="${parseInt(cartItem.quantity)}">
				                  <p type="button" class="qty-btn" id="increase" onclick="increase('${JSON.stringify(cart).replace(/"/g, '&quot;')}', ${index});">+</p>
				                </div>
				              </div>            
				            </td>
				            <td class="tot-price" id="${String(cartItem.id)}${String(cartItem.variation)}price" >${getPrice(JSON.stringify(cartItem))}</td>
				          </tr>
						`;
						table.appendChild(row);
					}).catch((error)=>{
						console.log(error);
					});
					updateSummary(cart);
				}catch (error) {
					console.log(error);
				}
			});
		} else {
			noProduct();
		}

	}else{
		noProduct();
	}
}

export function noProduct(){
	document.getElementById('container').style.display = 'none';
	document.getElementById('error').style.display = 'flex';
}

export function getFinalAmount(){
	return finalAmount;
}

export function displayDetails(id){
	document.getElementById(id).classList.toggle('open');
}

export function displayAnswer(id){
	document.getElementById(id+'hr').classList.toggle('open');
	document.getElementById(id+'p').classList.toggle('open');
}

export function updateFields(){
	let data = JSON.parse(window.localStorage.getItem(String(window.localStorage.getItem('UserID')+'address')));
	let userData = JSON.parse(window.localStorage.getItem(String(window.localStorage.getItem('UserID')+'data')));
	if(data && userData){
		document.getElementById('name').value = userData.name;
		document.getElementById('phone').value = data.phone ? data.phone : '';
		document.getElementById('street').value = data.street ? data.street : '';
		document.getElementById('locality').value = data.locality ? data.locality : '';
		document.getElementById('pin').value = data.pincode ? data.pincode : '';
	}
}