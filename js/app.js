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
		var bool = false;
		for(i = 0; i < db.get().length; i++) {
			if(db.get()[i].email === bob)
				bool = true;
		}
		if(bool) {
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
		}
		else
			alert("Email not present in the local database");
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

	$(document).on("click", "#search_pub", function() {
		email = $('input[name=bob]').val();
		emailURI = encodeURIComponent(email);
		xhr = new XMLHttpRequest({mozSystem: true});
		url = "https://pgp.mit.edu/pks/lookup?search=" + emailURI + "&op=get";
		console.log(url);
		xhr.open("GET", url, true);
		
		xhr.timeout = 100000;
		xhr.addEventListener('timeout', function() {
			alert("Nessuna risposta dal server. Controllare la connessione e toccare l'icona Ricarica.");
		});
		xhr.onload = function() {
			if(xhr.status == 200) {
		    	page = $(xhr.response);
		    	pub_to_import = $(xhr.response)[9].innerHTML;
		    	console.log(pub_to_import);
		    	wrap = "<div data-type='list'><header>Results</header>" +
		    			"<ul><li><a href='#' id='a'><p>" + email + "</p>" +
		    			"<p>Tap here to save his public key</p></a></li></ul>";
		    	$("#wrapper").append(wrap);
			}
			else if(xhr.status == 404) {
				alert("No results found");
			}
		}
		xhr.send();
		$(document).on("click", "#a", function() {
			var arr = new Array();
			data = {
				'name':'undefined',
				'email':email,
				'pub':pub_to_import,
				'priv':''
			};
			arr.push(data);
			db.save(arr);
			utils.status.show("Pub key saved");
		});
	});
	
	$(document).on("click", "#pick_pub", function() {
		alert("Not implemented yet.");
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
	
	$(document).on("click", "#update", function() {
		name = $('input[name=name]').val();
		email = $("#head_down").text();
		console.log(name);
		console.log(email);
		db.modName(email, name);
		utils.status.show("Name modified");
	});
	
	$(document).on("click", "#pick_priv", function() {
		fsearch = $('input[name=file]').val();
		var finder = new Applait.Finder({ hidden: true });
		var elem = "";
		finder.search(fsearch);
		finder.on("fileFound", function (file, fileinfo, storageName) {
			console.log("Found file " + fileinfo.name + " at " + fileinfo.path + " in " + storageName, file);
			elem = "<header>Results</header><ul><li><a href='#'><p>" + fileinfo.name + "</p><p>At " + fileinfo.path + "</p></a></li></ul>";
			$('#search_results').append(elem);
		});
		/* Debug only */
		finder.on("searchCancelled", function (message) {
			console.log("Search cancelled");
		});
		finder.on("empty", function (needle) {
			console.log("No storage medium avaliable");
		});
	});
	
	/* Navigation */
	$(document).on("click", "#generate-pair", function() {
		wrap = "<div><input type='text' name='name' placeholder='Your Name' />" +
				"<input type='email' name='email' placeholder='Your Email' />" +
				"<input type='password' name='pwd' placeholder='Passphrase' />" +
				"<button id='btn-generate'>Generate Pair</button></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Generate Pair");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", "#load-pub-key", function() {
		wrap = "<div><input type='text' name='bob' placeholder='Type an email' />" +
				"<button id='search_pub'>Search</button>" +
				"<button id='pick_pub'>Pick Pub key from file</button></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Public Key");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", "#load-priv-key", function() {
		wrap = "<div><input type='text' name='file' placeholder='Type file to search' />" +
				"<button id='pick_priv'>Search</button></div><div data-type='list' id='search_results'></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Private Key");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", "#encrypt", function() {
		wrap = "<div><input type='text' name='bob' placeholder='Email of the receiver' />" +
				"<textarea type='text' name='msg' placeholder='Write your message to encrypt here' />" +
				"<button id='btn-encrypt'>Encrypt Message</button>" +
				"<textarea type='text' name='emsg' placeholder='Encrypted text will be here' /></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
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
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Decrypt");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", "#database", function() {
		items = "";
		if(db.get().length != 0) {
			for(i = 0; i < db.get().length; i++) {
				console.log(i);
				name = db.get()[i].name;
				email = db.get()[i].email;
				if(db.get()[i].priv != "")
					priv = "priv - ";
				else
					priv = "";
				pub = "pub";
				item = "<li><a href='#' id='" + email + "' class='keys'><p>" + name + " - " + email + "</p>" +
						"<p>" + priv + pub + "</p></a></li>";
				console.log(item);
				items = items + item;
			}
			wrap = "<section data-type='list'><ul>" + items + "</ul></section>" +
					"<div><button id='empty' class='danger'>Clear database</button><div>";
		}
		else
			wrap = "<div><p>Database empty</p></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Database");
		$("#tbar").append("<button disabled></button>");
	});
	
	$(document).on("click", ".keys", function() {
		name = db.getName(this.id);
		console.log(name);
		wrap = "<div><input type='text' name='name' placeholder='" + name + "' />" +
				"<button id='update'>Update</button>" +
				"<button id='remove' class='danger'>Remove key</button></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append(this.id);
		document.querySelector('#down').className = 'current';
	});
	
	$(document).on("click", "#close", function() {
		$("#wrapper").empty();
		$("#head").empty();
		$("#tbar").empty();
		items = "";
		for(i = 0; i < db.get().length; i++) {
			name = db.get()[i].name;
			email = db.get()[i].email;
			if(db.get()[i].priv != "")
				priv = "priv - ";
			else
				priv = "";
			pub = "pub";
			item = "<li><a href='#' id='" + email + "' class='keys'><p>" + name + " - " + email + "</p>" +
					"<p>" + priv + pub + "</p></a></li>";
			items = items + item;
		}
		wrap = "<section data-type='list'><ul>" + items + "</ul></section>" +
				"<div><button id='empty' class='danger'>Clear database</button><div>";
		$("#wrapper").append(wrap);
		$("#head").append("Database");
		$("#tbar").append("<button disabled></button>");
		$("[data-position='down']").attr('class', 'down');
		$("#wrapper_down").empty();
		$("#head_down").empty();
	});
	
	$(document).on("click", "#back", function() {
		$("[data-position='current']").attr('class', 'current');
		$("[data-position='right']").attr('class', 'right');
		$("#wrapper").empty();
		$("#head").empty();
		$("#tbar").empty();
	});	
});
