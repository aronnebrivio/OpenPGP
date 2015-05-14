#OpenPGP
WebApp to port GPG messages encryption to FirefoxOS.   
It's possible to:
- Generate a key pair
- Load a public key from [pgp.mit.edu](https://pgp.mit.edu)
- Load a private key from file in SDcard
- Encrypt a message and send it via Email
- Decrypt a message
- Manage keys saved locally   

##History
- **1.0**   
First version  
- **1.5**   
Added double check of the passphrase while generating a new pair   
It's now possible to import a public key from file   
Delete a single key is now working   
Fixed the appears of "RESULTS" string for every file found   
Updated Gaia Components   
Less spaghetti code style   
- **1.6**   
Added check if an email is already present in the local database   
Warning if trying to import an existent key   
Updated Gaia Components   
Fixed status style   
Minor fixes   


##License
Copyright (C) 2015 Aronne Brivio   
This program is under GPL license, for more info see COPYING file.   
