wrap = "";
name = "";
email = "";
string = "";
password = "";
my_priv_key = "";
my_public_key = "";

$(document).ready(function() {
	var db = new DB();

	console.log(db.get());

	$(document).on("click", "#btn-generate", function() {
		utils.status.show("Generating key pair, please wait it could take a while");
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
					'priv':my_priv_key
				};
				arr.push(data);
				db.save(arr);
				utils.status.show("Key Pair created and saved");
			});
	});
	
	$(document).on("click", "#btn-encrypt", function() {
		bob = $('input[name=bob]').val();
		bob_pub_armored = db.getPub(bob);
		msg = $('textarea[name=msg]').val();
		bob_pub = openpgp.key.readArmored(bob_pub_armored);
		openpgp.encryptMessage(bob_pub.keys, msg)
			.then(function(r) {
				emsg = r;
				$('textarea[name=emsg]').val(emsg);
			})
			.catch(function(err) {
				alert("Encrypting error");
			});
	});
	
	$(document).on("click", "#btn-decrypt", function() {
		alice = $('input[name=alice]').val();
		emsg = $('textarea[name=emsg]').val();
		pwd = $('input[name=pwd]').val();
		alice_priv_armored = db.getPriv(alice);
		alice_priv = openpgp.key.readArmored(alice_priv_armored).keys[0];
		alice_priv.decrypt(pwd);
		emsg = openpgp.message.readArmored(emsg);
		openpgp.decryptMessage(alice_priv, emsg)
			.then(function(r) {
				msg = r;
				$('textarea[name=msg]').val(msg);
			})
			.catch(function(err) {
				alert("Decrypting error");
			});
	});
	
	$(document).on("click", "#empty", function() {
		db.clearDB();
		console.log(localStorage.length);
		utils.status.show("Database empty");
	});
	
	$(document).on("click", "#send-e", function() {
		console.log(bob);
		console.log(emsg);
		body = encodeURIComponent(emsg);
		console.log(body);
		var encrMail = new MozActivity({
			name: "new",
			data: {
				type: "mail",
				url: "mailto:" + bob + "?body=" + body
			}
		});
	});
	
	/* Navigation */
	$(document).on("click", "#generate-pair", function() {
		wrap = "<div><input type='text' name='name' placeholder='Your Name' />" +
				"<input type='email' name='email' placeholder='Your Email' />" +
				"<input type='password' name='pwd' placeholder='Passphrase' />" +
				"<button id='btn-generate'>Generate Pair</button></div>";
		document.querySelector('#right').className = 'skin-dark current';
		document.querySelector('[data-position="current"]').className = 'skin-organic left';
		$("#wrapper").append(wrap);
		$("#head").append("Generate Pair");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", "#load-pub-key", function() {
		wrap = "<div><p>Not implemented</p></div>";
		document.querySelector('#right').className = 'skin-organic current';
		document.querySelector('[data-position="current"]').className = 'skin-organic left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Public Key");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", "#load-priv-key", function() {
		wrap = "<div><p>Not implemented</p></div>";
		document.querySelector('#right').className = 'skin-organic current';
		document.querySelector('[data-position="current"]').className = 'skin-organic left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Private Key");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", "#encrypt", function() {
		wrap = "<div><input type='text' name='bob' placeholder='Email of the receiver' />" +
				"<textarea type='text' name='msg' placeholder='Write your message to encrypt here' />" +
				"<button id='btn-encrypt'>Encrypt Message</button>" +
				"<textarea type='text' name='emsg' placeholder='Encrypted text will be here' /></div>";
		document.querySelector('#right').className = 'skin-organic current';
		document.querySelector('[data-position="current"]').className = 'skin-organic left';
		$("#wrapper").append(wrap);
		$("#head").append("Encrypt");
		$("#tbar").append("<button id='send-e' data-icon='email'></button>");
	});
	
	$(document).on("click", "#decrypt", function() {
		wrap = "<div><input type='text' name='alice' placeholder='Your Email' />" +
				"<textarea type='text' name='emsg' placeholder='Paste encrypted text here' />" +
				"<input type='password' name='pwd' placeholder='Passphrase' />" +
				"<button id='btn-decrypt'>Decrypt Message</button>" +
				"<textarea type='text' name='msg' placeholder='Decrypted text will be here' /></div>";
		document.querySelector('#right').className = 'skin-organic current';
		document.querySelector('[data-position="current"]').className = 'skin-organic left';
		$("#wrapper").append(wrap);
		$("#head").append("Decrypt");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", "#back", function() {
		$("[data-position='current']").attr('class', 'skin-organic current');
		$("[data-position='right']").attr('class', 'skin-organic right');
		$("#wrapper").empty();
		$("#head").empty();
		$("#tbar").empty();
	});	
});
