/* LOCAL STORAGE */

/* Using js Object Oriented */
function DB() {
	var db = init();
	

	/* obj = { name:name, email:email, pub:pub_key, priv:priv_key, pwd:password} */
	this.save = function(objs) {
		temp = arDifference(objs,db);
		db = temp.concat(db);
		localStorage.setItem('mydb', JSON.stringify(db));
	};

	this.get = function() {
		return db;
	};

	this.getPriv = function(email) {
		for(var i = 0; i < db.length;i++) {
			if(db[i].email == email) {
				return db[i].priv;
			}
		}
	};
	
	this.getPub = function(email) {
		for(var i = 0; i < db.length;i++) {
			if(db[i].email == email) {
				return db[i].pub;
			}
		}
	};
	
	this.getPwd = function(email) {
		for(var i = 0; i < db.length;i++) {
			if(db[i].email == email) {
				return db[i].pwd;
			}
		}
	};
	
	/* DEBUG ONLY */
	this.clearDB = function() {
		localStorage.removeItem('mydb');
	};
	
	return this;
}

function init() {
	var db = new Array();
	var initdb = JSON.stringify(db)
	if ((localStorage.getItem('mydb')) === null) {
		localStorage.setItem('mydb', initdb);
		return db;
	}
	else {
		return JSON.parse(localStorage.getItem('mydb'));
	}
}


function contains(a, obj) {
	if(a != null){
		for (var i = 0; i < a.length; i++) {
			if (a[i].email === obj.email) {
				return true;
			}
		}
	}
	return false;
};


function arDifference(o,db){
/* fa la differenza tra i due array: cancella gli elementi già presenti nel db */
	for(var i = o.length-1; i >= 0; i--){
		if(contains(db,o[i])){
			o.splice(i,i+1);
		}
	}
	return o;
}
