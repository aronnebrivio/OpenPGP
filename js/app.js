/*
 * OpenPGP - PGP enryption  for Firefox OS
 * Copyright (C) 2015 Aronne Brivio
 *
 * This file is part of OpenPGP.
 *
 * OpenPGP is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * OpenPGP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenPGP.  If not, see <http://www.gnu.org/licenses/>.
 */

/* Global vars */
version = "1.6.2";
ua = window.navigator.userAgent;
ffos = false;
wrap = "";
name = "";
email = "";
string = "";
password = "";
my_priv_key = "";
my_public_key = "";
f = null;
db = null;
finder = null;
needle = "";
elems = "";
keyType = "";
keyfile = "";

/* Find a key from server od from file */
function onlineSearch() {
	emailURI = encodeURIComponent(email);
	xhr = new XMLHttpRequest({mozSystem: true});
	url = "https://pgp.mit.edu/pks/lookup?search=" + emailURI + "&op=get";
	xhr.open("GET", url, true);
	xhr.timeout = 100000;
	xhr.addEventListener('timeout', function() {
		alert("No response from server. Check your connectivity and tap Reload.");
	});
	xhr.onload = function() {
		if(xhr.status == 200) {
	    	page = $(xhr.response);
	    	pub_to_import = $(xhr.response)[9].innerHTML;
	    	wrap = "<header>Online Results</header>" +
	    			"<ul><li><a href='#' id='a'><p>" + email + "</p>" +
	    			"<p>Tap here to save his public key</p></a></li></ul>";
	    	$("#online_res").append(wrap);
		}
		else if(xhr.status == 404) {
			utils.status.show("No online results found");
		}
	}
	xhr.send();
}

function localSearch(head, needle, kt) {
	keyType = kt;
	console.log(keyType);
	fsearch = needle;
	finder = new Applait.Finder({ hidden: true });
	elems = head;
	var elem = "";
	finder.search(fsearch);
	finder.on("fileFound", function(file, fileinfo, storageName) {
		elem = "<ul><li><a href='#' id='" + file.name + "' class ='file " + keyType + "'>" +
				"<p>" + fileinfo.name + "</p><p>At " + fileinfo.path + "</p></a></li></ul>";
		f = file;
		elems = elems + elem;
	});
	finder.on("searchComplete", function(fsearch, filematchcount) {
		if(filematchcount != 0)
			$('#local_res').append(elems);
		else
			utils.status.show("No files found.");
	});
};

/* Refresh db after modifying it */
function refreshDB() {
	$("#wrapper").empty();
	$("#head").empty();
	$("#tbar").empty();
	items = "";
	if(db.get().length != 0) {
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
				"<br><button id='empty' class='danger'>Clear database</button>";
	}
	else
		wrap = "<p>Database empty</p>";
	$("#wrapper").append(wrap);
	$("#head").append("Database");
	$("#tbar").append("<button data-icon='info' id='info_database'></button");
};

/* Update private or public key if an email is already in the database */
function updatePriv(email, priv) {
	console.log("update priv");
	if(db.hasPriv(email)) {
		if(confirm("In the database there is already a private key for this email, do you want to proceed anyway?")) {
			db.modPriv(email, priv);
			utils.status.show("Private key for <" + email + "> updated. Consider to remove the file from SD Card.");
		}
	}
	else {
		db.modPriv(email, priv);
		utils.status.show("Added private key for <" + email + ">. Consider to remove the file from SD Card.");
	}
};

function updatePub(email, pub) { 
	console.log("update pub");
	if(db.hasPub(email)) {
		if(confirm("In the database there is already a public key for this email, do you want to proceed anyway?")) {
			db.modPub(email, pub);
			console.log("modded pub");
			utils.status.show("Public key for <" + email + "> updated.");
		}
	}
	else {
		db.modPub(email, pub);
		utils.status.show("Added public key for <" + email + ">.");
	}
};

$(document).ready(function() {
	console.log(ua);
	if(ua.match(/Mobile/i))
		ffos = true;
	console.log(ffos);
	db = new DB();
	
	/* Generate pair - pick keys */
	$(document).on("click", "#btn-generate", function() {
		password = $('input[name=pwd]').val();
		password2 = $('input[name=pwd2]').val();
		email = $('input[name=email]').val();
		if(!db.contains(email)) {
			if(password === password2) {
				utils.status.show("Generating key pair, please wait it could take a while");
				name = $('input[name=name]').val();
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
		}
		else {
			alert("Email <" + email + "> already present on the database, aborted.")
		}
	});
	
	$(document).on("click", "#search_pub", function() {
		$('#local_res').empty();
		$('#online_res').empty();
		head = "<header>Local Results</header>";
		email = $('input[name=bob]').val();
		onlineSearch();
		if(ffos)
			localSearch(head, email, "pub");
		$(document).on("click", "#a", function() {
			if(!db.contains(email)) {
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
			}
			else
				updatePub(email, pub_to_import);
		});
	});
	
	$(document).on("click", "#pick_priv", function() {
		$('#local_res').empty();
		head = "<header>Results</header>";
		tosearch = $('input[name=file]').val();
		localSearch(head, tosearch, "priv");
	});
	
	$(document).on("click", ".file", function() {
		var reader = new FileReader();
		reader.onload = function(e) {
			f.src = e.target.result;
			console.log(keyType);
			if(keyType == "priv") {
				wrap = "<div><input type='text' name='name' placeholder='Your name' />" +
						"<input type='email' name='email' placeholder='Your email' />" +
						"<button id='add_priv'>Add your private key</button></div>";
				$("#wrapper_down").append(wrap);
				$("#head_down").append("Add your private key");
				document.querySelector('#down').className = 'current';
				$(document).on("click", "#add_priv", function() {
					email = $('input[name=email]').val();
					if(!db.contains(email)) {
						var arr = new Array();
						data = {
							'name': $('input[name=name]').val(),
							'email': email,
							'pub': '',
							'priv': f.src
						};
						arr.push(data);
						db.save(arr);
						utils.status.show("Private key for <" + email + "> saved. Consider to remove the file from SD Card.");
					}
					else
						updatePriv(email, f.src);
				});
			}
			else {
				wrap = "<div><input type='text' name='name' placeholder='Name' />" +
						"<input type='email' name='email' placeholder='Email' />" +
						"<button id='add_priv'>Add public key</button></div>";
				$("#wrapper_down").append(wrap);
				$("#head_down").append("Add public key");
				document.querySelector('#down').className = 'current';
				$(document).on("click", "#add_priv", function() {
					email = $('input[name=email]').val();
					if(!db.contains(email)) {
						var arr = new Array();
						data = {
							'name': $('input[name=name]').val(),
							'email': email,
							'pub': f.src,
							'priv': ''
						};
						arr.push(data);
						db.save(arr);
						utils.status.show("Public key for <" + email + "> saved.");
					}
					else
						updatePub(email, f.src);
				});				
			}
		}
		reader.readAsText(f);
	});
	
	/* PC purpose only */
	if(!ffos) {
		var fileInput = document.getElementById('file-input');
		if(fileInput) {
			fileInput.addEventListener('change', function(e) {
				var file = fileInput.files[0];
				console.log(file);
				var textType = /text.*/;
			if (file.type.match(textType)) {
				var reader = new FileReader();

				reader.onload = function(e) {
					console.log(reader.result);
					keyfile = reader.result;
				}

				reader.readAsText(file);  
				} else {
					alert("File not supported!");
				}
			});
		}
	
		$(document).on("click", "#pick_priv_pc", function() {
			keyType = "priv";
			wrap = "<div><input type='text' name='name' placeholder='Your name' />" +
					"<input type='email' name='email' placeholder='Your email' />" +
					"<button id='add_priv'>Add your private key</button></div>";
			$("#wrapper_down").append(wrap);
			$("#head_down").append("Add your private key");
			document.querySelector('#down').className = 'current';
			$(document).on("click", "#add_priv", function() {
				email = $('input[name=email]').val();
				if(!db.contains(email)) {
					var arr = new Array();
					data = {
						'name': $('input[name=name]').val(),
						'email': email,
						'pub': '',
						'priv': keyfile
					};
					arr.push(data);
					db.save(arr);
					utils.status.show("Private key for <" + email + "> saved. Consider to remove the file from your PC.");
				}
				else
					updatePriv(email, keyfile);
			});
		});
	}
			
	/* Encrypt - Decrypt functions */
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
			alert("Email <" + bob + "> not present in the local database");
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
	
	/* Manage database */
	$(document).on("click", "#update", function() {
		name = $('input[name=name]').val();
		email = $("#head_down").text();
		db.modName(email, name);
		utils.status.show("Name for <" + email + "> modified");
	});
	
	$(document).on("click", "#empty", function() {
		db.clearDB();
		refreshDB();
		utils.status.show("Database empty");
	});

	$(document).on("click", "#remove", function() {
		email = $('#head_down').html();
		console.log(email);
		db.remove(email);
		utils.status.show("Key removed from local database");
		refreshDB();
		document.querySelector("#wrapper_down").className = "content scrollable header";
		$("[data-position='down']").attr('class', 'down');
		$("#wrapper_down").empty();
		$("#head_down").empty();
	});
	
	/* Export keys - send email */
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
	
	$(document).on("click", "#send-e", function() {
		body = encodeURIComponent(emsg);
		if(ffos) {
			var encrMail = new MozActivity({
				name: "new",
				data: {
					type: "mail",
					url: "mailto:" + bob + "?body=" + body
				}
			});
		}
		else {
			window.location.href = 'mailto:' + bob + '?body=' + body;
		}
	});
	
	/* Navigation */
	$(document).on("click", "#generate-pair", function() {
		$("#file-input").attr("style", "display: none;");
		wrap = "<input type='text' name='name' placeholder='Your Name' />" +
				"<input type='email' name='email' placeholder='Your Email' />" +
				"<input type='password' name='pwd' placeholder='Passphrase' />" +
				"<input type='password' name='pwd2' placeholder='Re-enter passphrase' />" +
				"<button id='btn-generate'>Generate Pair</button>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Generate Pair");
		$("#tbar").append("<button data-icon='info' id='info_gen'></button>");
	});
	
	$(document).on("click", "#load-pub-key", function() {
		$("#file-input").attr("style", "display: none;");
		wrap = "<input type='text' name='bob' placeholder='Type an email' />" +
				"<button id='search_pub'>Search</button><div data-type='list' id='online_res'></div>" +
				"<div data-type='list' id='local_res'></div>";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Public Key");
		$("#tbar").append("<button data-icon='info' id='info_load_pub'></button>");
	});
	
	$(document).on("click", "#load-priv-key", function() {
		if(ffos) {
			$("#file-input").attr("style", "display: none;");
			wrap = "<input type='text' name='file' placeholder='Type file to search' />" +
					"<button id='pick_priv'>Search</button><div data-type='list' id='local_res'></div>";
		}
		else {
			$("#file-input").attr("style", "");
			wrap = "<button id='pick_priv_pc'>Select this file</button>";
		}
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Load Private Key");
		$("#tbar").append("<button data-icon='info' id='info_load_priv'></button>");
	});
	
	$(document).on("click", "#encrypt", function() {
		$("#file-input").attr("style", "display: none;");
		wrap = "<input type='text' name='bob' placeholder='Email of the receiver' />" +
				"<textarea type='text' name='msg' placeholder='Write your message to encrypt here' />" +
				"<button id='btn-encrypt'>Encrypt Message</button>" +
				"<textarea type='text' name='emsg' placeholder='Encrypted text will be here' />";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Encrypt");
		$("#tbar").append("<button id='send-e' data-icon='email'></button><button data-icon='info' id='info_encrypt'></button");
	});
	
	$(document).on("click", "#decrypt", function() {
		$("#file-input").attr("style", "display: none;");
		wrap = "<input type='text' name='alice' placeholder='Your Email' />" +
				"<textarea type='text' name='emsg' placeholder='Paste encrypted text here' />" +
				"<input type='password' name='pwd' placeholder='Passphrase' />" +
				"<button id='btn-decrypt'>Decrypt Message</button>" +
				"<textarea type='text' name='msg' placeholder='Decrypted text will be here' />";
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
		$("#wrapper").append(wrap);
		$("#head").append("Decrypt");
		$("#tbar").append("<button data-icon='info' id='info_decrypt'></button>");
	});
	
	$(document).on("click", "#database", function() {
		$("#file-input").attr("style", "display: none;");
		document.querySelector("#wrapper_down").className = "content scrollable header database";
		refreshDB();
		document.querySelector('#right').className = 'current';
		document.querySelector('[data-position="current"]').className = 'left';
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
			refreshDB();
		}
		document.querySelector("#wrapper_down").className = "content scrollable header";
		$("[data-position='down']").attr('class', 'down');
		$("#wrapper_down").empty();
		$("#head_down").empty();
	});
	
	$(document).on("click", "#back", function() {
		$("#file-input").attr("style", "display: none;");
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
		wrap = "<div data-type='list'><p data-l10n-id='info'></p><header data-l10n-id='version'></header><p>" + version + "</p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_gen", function() {
		wrap = "<div><p data-l10n-id='info-gen'></p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Generate pair");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_load_pub", function() {
		wrap = "<div><p data-l10n-id='info-load-pub'></p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Load Public key");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_load_priv", function() {
		wrap = "<div><p data-l10n-id='info-load-priv'></p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Load Private key");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_encrypt", function() {
		wrap = "<div><p data-l10n-id='info-encrypt'></p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Encrypt");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_decrypt", function() {
		wrap = "<div><p data-l10n-id='info-decrypt'></p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Decrypt");
		$("[data-position='down']").attr('class', 'current');
	});
	
	$(document).on("click", "#info_database", function() {
		wrap = "<div><p data-l10n-id='info-database'></p></div>";
		$("#wrapper_down").append(wrap);
		$("#head_down").append("Info - Database");
		$("[data-position='down']").attr('class', 'current');
	});
});
