var pg = require('pg');
var defaults = require('./defaults.js');
var conString = "postgres://"+defaults.user+":"+defaults.password+"@"+defaults.host+"/"+defaults.database;

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
var globalClient = null;
var globalDone = null;

module.exports = {
	select: function(selectSQLString, value, CALLBACK, CALLBACKERROR){
		if(globalClient == null || globalDone == null){
			
			pg.connect(conString, function(err, client, done) {
				globalClient = client;
				globalDone = done;
				if(err) {
					CALLBACKERROR(err);
					return;
				}else{
					
					client.query('SET search_path = admin', function(err, result, fields) {
						if(err) {
							CALLBACKERROR(err);
							client.end();
							return;
						}else{
							client.query(selectSQLString, value,  function(error, results, fields)  
							{  
								if(error)  
								{  
									CALLBACKERROR(error);
									console.log("ClientReady Error: " + error.message),  
									client.end();  
									return;  
								}  
								//when the insert move success the callback function is called
								console.log('Selected results: ' + JSON.stringify(results) + ''),  
								console.log('Selected fileds: ' + fields + ''),  
								console.log('select success...\n'); 
								CALLBACK(results);
							});
						}
					});
				}
			});
		}else{
			globalClient.query(selectSQLString, value,  function(error, results, fields)  
			{  
				if(error)  
				{  
					CALLBACKERROR(error);
					console.log("ClientReady Error: " + error.message);
					globalClient.end();
					return;  
				}  
				//when the insert move success the callback function is called
				console.log('Selected results: ' + JSON.stringify(results) + ''),  
				console.log('Selected fileds: ' + fields + ''),  
				console.log('select success...\n'); 
				CALLBACK(results); 
			});
		}
	},
	save: function(insertSQLString, value, CALLBACK, CALLBACKERROR){
		if(globalClient == null || globalDone == null){
			
			pg.connect(conString, function(err, client, done) {
				globalClient = client;
				globalDone = done;
				if(err) {
					CALLBACKERROR(err);
					return;
				}else{
					
					client.query('SET search_path = admin', function(err, result) {
						if(err) {
							CALLBACKERROR(err);
							client.end();
							return;
						}else{
							client.query(insertSQLString, value,  function(error, results)  
							{  
								if(error)  
								{  
									CALLBACKERROR(error);
									console.log("ClientReady Error: " + error.message),  
									client.end();  
									return;  
								}  
								//when the insert move success the callback function is called
								console.log('Inserted: ' + results.affectedRows + ' row.'),  
								console.log('insert success...\n');  
								CALLBACK(results);
							});
						}
					});
				}
			});
		}else{
			globalClient.query(insertSQLString, value,  function(error, results)  
			{  
				if(error)  
				{  
					CALLBACKERROR(error);
					console.log("ClientReady Error: " + error.message);
					globalClient.end();
					return;  
				}  
				//when the insert move success the callback function is called
				console.log('Inserted: ' + results.affectedRows + ' row.'),  
				console.log('insert success...\n');  
				CALLBACK(results);
			});
		}
	},
	done: function(){
		//release the conection to the pool
		globalDone();
	}
}