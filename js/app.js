wrap = "";
name = "";
email = "";
string = "";
password = "";
my_priv_key = "";
my_public_key = "";

$(document).ready(function() {
	var db = new DB();

	console.log("I'm alive!");

	$(document).on("click", "#btn-generate", function() {
		name = $('input[name=name]').val();
		email = $('input[name=email]').val();
		password = $('input[name=pwd]').val();
		string = name + " <" + email + ">";
		console.log("name: " + name + "\nemail: " + email + "\npassword: " + password + "\nstring: " + string);
		my_key = openpgp.generateKeyPair({numBits: 2048, userId: string, passphrase: password})
			.then(function(key_pair) {
				my_priv_key = key_pair.privateKeyArmored;
				my_public_key = key_pair.publicKeyArmored;
				console.log("My private key:\n" + my_priv_key + "\n");
				console.log("My public key:\n" + my_public_key + "\n");
				
				/* local storage */
				var arr = new Array();
				data = {
					'name':name,
					'email':email,
					'pub':my_public_key,
					'priv':my_priv_key,
					'pwd':password
				};
				arr.push(data);
				db.save(arr);
				utils.status.show("Key Pair created and saved");
			});
	});
	
	$(document).on("click", "#btn-encrypt", function() {
		msg = $('textarea[name=msg]').val();
		my_pub = openpgp.key.readArmored(my_public_key);
		emsg = openpgp.encryptMessage(my_pub.keys, msg)
			.then(function() {
				console.log("Encrypted message: \n" + emsg + "\n");
				console.log("Encrypted message: \n" + emsg.text() + "\n");
			});
	});
	
	$(document).on("click", "#btn-decrypt", function() {
		emsg = $('textarea[name=emsg]').val();
		pwd = $('input[name=pwd]').val();
		openpgp_emsg = openpgp.message.readArmored(emsg);
		my_key.key.decrypt(pwd);
		msg = openpgp.decryptMessage(my_key.key, emsg);
		console.log("Decrypted message: \n" + msg + "\n");
	});
	
	/* Navigation */
	$(document).on("click", "#generate-pair", function() {
		wrap = "<div><input type='text' name='name' placeholder='Your Name' />" +
				"<input type='email' name='email' placeholder='Your Email' />" +
				"<input type='password' name='pwd' placeholder='Password' />" +
				"<button id='btn-generate'>Generate Pair</button></div>";
		document.querySelector('#right').className = 'skin-dark current';
		document.querySelector('[data-position="current"]').className = 'skin-dark left';
		$("#wrapper").append(wrap);
		$("#head").append("Generate Pair");
	});
	
	$(document).on("click", "#load-pub-key", function() {
		wrap = "<div><p>Not implemented</p></div>";
		document.querySelector('#right').className = 'skin-dark current';
		document.querySelector('[data-position="current"]').className = 'skin-dark left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Public Key");
	});
	
	$(document).on("click", "#load-priv-key", function() {
		wrap = "<div><p>Not implemented</p></div>";
		document.querySelector('#right').className = 'skin-dark current';
		document.querySelector('[data-position="current"]').className = 'skin-dark left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Private Key");
	});
	
	$(document).on("click", "#encrypt", function() {
		wrap = "<div><textarea type='text' name='msg' placeholder='Write your message to encrypt here' />" +
				"<button id='btn-encrypt'>Encrypt Message</button></div>";
		document.querySelector('#right').className = 'skin-dark current';
		document.querySelector('[data-position="current"]').className = 'skin-dark left';
		$("#wrapper").append(wrap);
		$("#head").append("Encrypt");
	});
	
	$(document).on("click", "#decrypt", function() {
		wrap = "<div><textarea type='text' name='emsg' placeholder='Paste encrypted text here' />" +
				"<input type='password' name='pwd' placeholder='Password' />" +
				"<button id='btn-encrypt'>Decrypt Message</button></div>";
		document.querySelector('#right').className = 'skin-dark current';
		document.querySelector('[data-position="current"]').className = 'skin-dark left';
		$("#wrapper").append(wrap);
		$("#head").append("Decrypt");
	});
	
	$(document).on("click", "#back", function() {
		$("[data-position='current']").attr('class', 'skin-dark current');
		$("[data-position='right']").attr('class', 'skin-dark right');
		$("#wrapper").empty();
		$("#head").empty();
	});	
});
