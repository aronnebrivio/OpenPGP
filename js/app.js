wrap = "";
name = "";
email = "";
string = "";
password = "";
my_priv_key = "";
my_public_key = "";
f = null;

$(document).ready(function() {
	var db = new DB();

	$(document).on("click", "#btn-generate", function() {
		password = $('input[name=pwd]').val();
		password2 = $('input[name=pwd2]').val();
		if(password === password2) {
			utils.status.show("Generating key pair, please wait it could take a while");
			name = $('input[name=name]').val();
			email = $('input[name=email]').val();
			string = name + " <" + email + ">";
			my_key = openpgp.generateKeyPair({numBits: 2048, userId: string, passphrase: password})
				.then(function(key_pair) {
					my_priv_key = key_pair.privateKeyArmored;
					my_public_key = key_pair.publicKeyArmored;
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
		}
		else {
			$('input[name=pwd]').val("");
			$('input[name=pwd2]').val("");
			alert("You entered two different passphrases. Check them out and try again.");
		}
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
		xhr.open("GET", url, true);
		xhr.timeout = 100000;
		xhr.addEventListener('timeout', function() {
			alert("Nessuna risposta dal server. Controllare la connessione e toccare l'icona Ricarica.");
		});
		xhr.onload = function() {
			if(xhr.status == 200) {
		    	page = $(xhr.response);
		    	pub_to_import = $(xhr.response)[9].innerHTML;
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
			utils.status.show("Public key for <" + email + "> saved");
		});
	});
		
	$(document).on("click", "#empty", function() {
		db.clearDB();
		utils.status.show("Database empty");
	});
	
	$(document).on("click", "#send-e", function() {
		body = encodeURIComponent(emsg);
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
		db.modName(email, name);
		utils.status.show("Name for <" + email + "> modified");
	});
	
	$(document).on("click", "#pick_priv", function() {
		$('#search_results').empty();
		fsearch = $('input[name=file]').val();
		var finder = new Applait.Finder({ hidden: true });
		var elems = "<header>Results</header>";
		var elem = "";
		finder.search(fsearch);
		finder.on("fileFound", function(file, fileinfo, storageName) {
			elem = "<ul><li><a href='#' id='" + file.name + "' class ='file'>" +
					"<p>" + fileinfo.name + "</p><p>At " + fileinfo.path + "</p></a></li></ul>";
			f = file;
			elems = elems + elem;
		});
		finder.on("searchComplete", function(fsearch, filematchcount) {
			if(filematchcount != 0)
				$('#search_results').append(elems);
			else
				alert("No files found.");
		});
	});
	
	$(document).on("click", ".file", function() {
		var reader = new FileReader();
		reader.onload = function(e) {
			f.src = e.target.result;
			wrap = "<div><input type='text' name='name' placeholder='Your name' />" +
					"<input type='email' name='email' placeholder='Your email' />" +
					"<button id='add_priv'>Add your private key</button></div>";
			$("#wrapper_down").append(wrap);
			$("#head_down").append("Add your priv");
			document.querySelector('#down').className = 'current';
			$(document).on("click", "#add_priv", function() {
				var arr = new Array();
				data = {
					'name': $('input[name=name]').val(),
					'email': $('input[name=email]').val(),
					'pub': '',
					'priv': f.src
				};
				arr.push(data);
				db.save(arr);
				utils.status.show("Private key for <" + $('input[name=email]').val() + "> saved");
			});
		}
		reader.readAsText(f);
	});
	
	$(document).on("click", "#export_pub", function() {
		email = $("#head_down").text();
		name = email + "_pub.txt";
		key = db.getPub(email);
		blob = new Blob(['', key, ''], {type: "text/plain"});
		saveAs(blob, name);
	});
	
	$(document).on("click", "#export_priv", function() {
		email = $("#head_down").text();
		name = email + "_priv.txt";
		key = db.getPriv(email);
		blob = new Blob(['', key, ''], {type: "text/plain"});
		saveAs(blob, name);
	});
	
	/* Navigation */
	$(document).on("click", "#generate-pair", function() {
		wrap = "<div><input type='text' name='name' placeholder='Your Name' />" +
				"<input type='email' name='email' placeholder='Your Email' />" +
				"<input type='password' name='pwd' placeholder='Passphrase' />" +
				"<input type='password' name='pwd2' placeholder='Re-enter passphrase' />" +
				"<button id='btn-generate'>Generate Pair</button></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Generate Pair");
		$("#tbar").append("<button data-icon='info' id='info_gen'></button>");
	});
	
	$(document).on("click", "#load-pub-key", function() {
		wrap = "<div><input type='text' name='bob' placeholder='Type an email' />" +
				"<button id='search_pub'>Search</button></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Public Key");
		$("#tbar").append("<button data-icon='info' id='info_load_pub'></button>");
	});
	
	$(document).on("click", "#load-priv-key", function() {
		wrap = "<div><input type='text' name='file' placeholder='Type file to search' />" +
				"<button id='pick_priv'>Search</button></div><div data-type='list' id='search_results'></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Private Key");
		$("#tbar").append("<button data-icon='info' id='info_load_priv'></button>");
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
		$("#tbar").append("<button id='send-e' data-icon='email'></button><button data-icon='info' id='info_encrypt'></button");
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
		$("#tbar").append("<button data-icon='info' id='info_decrypt'></button>");
	});
	
	$(document).on("click", "#database", function() {
		document.querySelector("#wrapper_down").className = "content scrollable header database";
		items = "";
		if(db.get().length != 0) {
			for(i = 0; i < db.get().length; i++) {
				console.log(i);
				name = db.get()[i].name;
				email = db.get()[i].email;
				if(db.get()[i].priv != "") {
					if(db.get()[i].pub != "")
						keys = "priv - pub";
					else
						keys = "priv";
				}
				else
					keys = "pub";
				item = "<li><a href='#' id='" + email + "' class='keys'><p>" + name + " - " + email + "</p>" +
						"<p>" + keys + "</p></a></li>";
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
		$("#tbar").append("<button data-icon='info' id='info_database'></button");
	});
	
	$(document).on("click", ".keys", function() {
		name = db.getName(this.id);
		console.log(name);
		wrap = "<div><input type='text' name='name' placeholder='" + name + "' />" +
				"<button id='update'>Update</button>" +
				"<button id='export_priv'>Export private key</button>" +
				"<button id='export_pub'>Export public key</button>" +
				"<button id='remove' class='danger'>Remove key</button></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append(this.id);
		if(db.getPub(this.id) == "")
			document.querySelector('#export_pub').setAttribute('disabled', true);
		if(db.getPriv(this.id) == "")
			document.querySelector('#export_priv').setAttribute('disabled', true);
		document.querySelector('#down').className = 'current';
	});
	
	$(document).on("click", "#close", function() {
		if($("#wrapper_down").attr('class') == "content scrollable header database") {
			$("#wrapper").empty();
			$("#head").empty();
			$("#tbar").empty();
			items = "";
			for(i = 0; i < db.get().length; i++) {
				name = db.get()[i].name;
				email = db.get()[i].email;
				if(db.get()[i].priv != "") {
					if(db.get()[i].pub != "")
						keys = "priv - pub";
					else
						keys = "priv";
				}
				else
					keys = "pub";
				item = "<li><a href='#' id='" + email + "' class='keys'><p>" + name + " - " + email + "</p>" +
						"<p>" + keys + "</p></a></li>";
				items = items + item;
			}
			wrap = "<section data-type='list'><ul>" + items + "</ul></section>" +
					"<div><button id='empty' class='danger'>Clear database</button><div>";
			$("#wrapper").append(wrap);
			$("#head").append("Database");
			$("#tbar").append("<button data-icon='info' id='info_database'></button");
		}
		document.querySelector("#wrapper_down").className = "content scrollable header";
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
	
	$(document).on("click", "#pgpmitedu", function() {
		new MozActivity({
			name: 'view',
			data: {
				type: 'url',
				url: 'https://pgp.mit.edu'
			}
		});
	});
	
	$(document).on("click", "#info", function() {
		wrap = "<div data-type='list'><p>OpenPGP let's you use PGP method to encrypt/decrypt messages.</p><br>" +
				"<p>You can find further informations by clicking on Info icons inside every option.</p>" +
				"<header>Version</header><p>1.0</p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_gen", function() {
		wrap = "<div><p>Here you can generate a key pair (private and public) for your email.</p><br>" +
				"<p>This application uses a 2048 bits encryption and it will save the key pair in the local database.</p>" +
				"<p>The passphrase you enter won't be stored anywhere and it will be used during encryption.</p><br>" +
				"<p>Note that it will be take some time especially on entry-level devices.</p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Generate pair");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_load_pub", function() {
		wrap = "<div><p>Here you can search if an email has a public key stored online on <a href='#' id='pgpmitedu'>https://pgp.mit.edu</a>.</p><br>" +
				"<p>Once the app finds a public key on the server, this will be shown here and with a tap on it " +
				"you will be able to save it locally in order to send encrypted messages to this email.</p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Load Public key");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_load_priv", function() {
		wrap = "<div><p>Here you can load your private key from a text file in your SDcard.</p><br>" +
				"<p>First you'll have to search for a file that it will be displayed here if founded.</p>" +
				"<p>By tapping on it you will be prompted to a window where you will be able to choose the name " +
				"of the key owner and then save it locally.</p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Load Private key");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_encrypt", function() {
		wrap = "<div><p>Here you can encrypt a message using a public key present on the app database.</p><br>" +
				"<p>First of all you have to enter the email of the receiver and the message you want to send.<br>" +
				"Then, by clicking on 'Encrypt Message' you'll show in the textbox at the bottom the encrypted version " +
				"of the message you wrote, ready to be sent.</p><br>" +
				"<p>You can now copy the encrypted message or tap on the Email button on the header bar: " +
				"it will open the system Email client ready to send an email to the receiver you entered, with the encrypted message.</p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Encrypt");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_decrypt", function() {
		wrap = "<div><p>Here you can decrypt a message you've received.</p><br>" +
				"<p>In order to do this you have to enter your email, paste the encrypted message, " +
				"type your passphrase and click on 'Decrypt Message'.</p><br>" +
				"<p>That's all! <br>You will be able to see the decrypted version of the message you've received!</p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Decrypt");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_database", function() {
		wrap = "<div><p>Here you can manage the keys you've stored locally.</p><br>" +
				"<p>By clicking on one key you will be able to change the name, export keys to files or remove it from the database.</p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Database");
		$("[data-position='down']").attr('class', 'current');
	});
});
