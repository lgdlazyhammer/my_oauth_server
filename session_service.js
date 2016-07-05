var db = require('./dbservice.js');

module.exports.getOAuthSession = function(ID, CALLBACK, CALLBACKERROR){	

	var selectSQLString = "SELECT * FROM OAuthSession WHERE UUID = $1";
	var value = [];
	value.push(ID);
	
	db.select(selectSQLString, value, CALLBACK, function(error){
		CALLBACKERROR();
	});
}

module.exports.save = function(OAuthSession, CALLBACK, CALLBACKERROR){	
    
	console.log("saving entity to table " +OAuthSession.getUuid()+","+OAuthSession.getSession()+","+OAuthSession.getExpires());
	var insertSQLString = "insert into OAuthSession values($1,$2,$3)";
	var value = [];
	value.push(OAuthSession.getUuid());
	value.push(OAuthSession.getSession());
	value.push(OAuthSession.getExpires());
	
	db.save(insertSQLString, value, CALLBACK, function(error){
		CALLBACKERROR();
	});
}

module.exports.remove = function(ID,CALLBACK){	
    
	db.query("DELETE FROM OAuthSession WHERE UUID = " + ID, function(result){
		CALLBACK(result);
	});
}