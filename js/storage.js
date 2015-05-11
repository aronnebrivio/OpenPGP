/* LOCAL STORAGE */

/* Using js Object Oriented */
function DB() {
	var db = init();
	
	/* obj = { name:name, email:email, pub:pub_key, priv:priv_key} */
	this.save = function(objs) {
		db = objs.concat(db);
		localStorage.setItem('mydb', JSON.stringify(db));
	};

	this.get = function() {
		return db;
	};

	this.getName = function(email) {
		for(var i = 0; i < db.length; i++) {
			if(db[i].email == email) {
				return db[i].name;
			}
		}
	}

	this.getPriv = function(email) {
		for(var i = 0; i < db.length; i++) {
			if(db[i].email == email) {
				return db[i].priv;
			}
		}
	};
	
	this.getPub = function(email) {
		for(var i = 0; i < db.length; i++) {
			if(db[i].email == email) {
				return db[i].pub;
			}
		}
	};
	
	this.contains = function(email) {
		for (var i = 0; i < db.length; i++) {
			if (db[i].email === email)
				return true;
			else
				return false;
		}
	};
	
	this.hasPriv = function(email) {
		for (var i = 0; i < db.length; i++) {
			if (db[i].email === email) {
				if(db[i].priv === "")
					return false;
				else
					return true;
			}
		}
	};
	
	this.hasPub = function(email) {
		for (var i = 0; i < db.length; i++) {
			if (db[i].email === email) {
				if(db[i].pub === "")
					return false;
				else
					return true;
			}
		}
	};
	
	this.modName = function(email, name) {
		for(var i = 0; i < db.length; i++) {
			if(db[i].email == email) {
				db[i].name = name;
				localStorage.setItem('mydb', JSON.stringify(db));
			}
		}	
	};
	
	this.modPriv = function(email, priv) {
		for(var i = 0; i < db.length; i++) {
			if(db[i].email === email) {
				db[i].priv = priv;
				localStorage.setItem('mydb', JSON.stringify(db));
			}
		}	
	};
	
	this.modPub = function(email, pub) {
		for(var i = 0; i < db.length; i++) {
			if(db[i].email === email) {
				db[i].pub = pub;
				localStorage.setItem('mydb', JSON.stringify(db));
			}
		}	
	};

	this.remove = function(email) {
		for(var i = 0; i < db.length; i++) {
			if(db[i].email === email) {
				db.splice(i, 1);
				console.log(db);
				localStorage.setItem('mydb', JSON.stringify(db));
			}
		}
	};
	
	this.clearDB = function() {
		localStorage.removeItem('mydb');
	};
	
	return this;
}

function init() {
	var db = new Array();
	var initdb = JSON.stringify(db);
	if ((localStorage.getItem('mydb')) === null) {
		localStorage.setItem('mydb', initdb);
		return db;
	}
	else {
		return JSON.parse(localStorage.getItem('mydb'));
	}
}
