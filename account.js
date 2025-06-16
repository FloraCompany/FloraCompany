function editAccount(){
	document.getElementById('aedit').style.display="none";
	document.getElementById('asave').style.display="block";
	document.getElementById('acancel').style.display="block";
	document.getElementById('name').disabled=false;
}

function editInformation(){
	document.getElementById('iedit').style.display="none";
	document.getElementById('isave').style.display="block";
	document.getElementById('icancel').style.display="block";
	document.getElementById('phone').disabled=false;
	document.getElementById('street').disabled=false;
	document.getElementById('locality').disabled=false;
	document.getElementById('pin').disabled=false;
}

function editPassword(){
	document.getElementById('pedit').style.display="none";
	document.getElementById('psave').style.display="block";
	document.getElementById('pcancel').style.display="block";
}

function cancelAccount(){
	document.getElementById('aedit').style.display="block";
	document.getElementById('asave').style.display="none";
	document.getElementById('acancel').style.display="none";
	document.getElementById('name').disabled=true;
	localStorage['FloraCoLoggIn'] = false;
	updateFields();
}

function cancelInformation(){
	document.getElementById('iedit').style.display="block";
	document.getElementById('isave').style.display="none";
	document.getElementById('icancel').style.display="none";
	document.getElementById('phone').disabled=true;
	document.getElementById('street').disabled=true;
	document.getElementById('locality').disabled=true;
	document.getElementById('pin').disabled=true;
	updateFields();
}

function cancelPassword(){
	document.getElementById('pedit').style.display="block";
	document.getElementById('psave').style.display="none";
	document.getElementById('pcancel').style.display="none";
}

updateFields();

function updateFields(){

	console.log(localStorage['userDATA']);
	let data = JSON.parse(localStorage['userDATA']);

	if(data){
		document.getElementById('name').value = data.name;
		document.getElementById('email').value = data.email;
		document.getElementById('phone').value = data.phone ? data.phone : '';
		document.getElementById('street').value = data.street ? data.street : '';
		document.getElementById('locality').value = data.locality ? data.locality : '';
		document.getElementById('pin').value = data.pincode ? data.pincode : '';
	}
}