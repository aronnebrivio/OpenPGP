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

/* LOCAL STORAGE */
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
		db = new Array();
		localStorage.setItem('mydb', JSON.stringify(db));
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
