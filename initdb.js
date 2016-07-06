var pg = require('pg');
var defaults = require('./defaults.js');
//db connection string
var conString = null;
if(process.env.DATABASE_URL != null && process.env.DATABASE_URL != ""){
	conString = process.env.DATABASE_URL;
}else{
	conString = "postgres://"+defaults.user+":"+defaults.password+"@"+defaults.host+"/"+defaults.database;
}
//pg open ssl which is must be done for heroku
pg.defaults.ssl = true;
//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
module.exports = {
	initdb: function(){
		pg.connect(conString, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}				
		  
			client.query('CREATE SCHEMA IF NOT EXISTS admin', function(err, result) {

				if(err) {
					done();
				  return console.error('error running create schema', err);
				}else{

					client.query('SET search_path = admin', function(err, result) {

						if(err) {
							done();
						  return console.error('set default search path', err);
						}else{
							client.query('CREATE TABLE IF NOT EXISTS users(id SERIAL primary key,name varchar(50) NOT NULL,password varchar(50) NOT NULL,gender varchar(20),phonenumber varchar(30),email varchar(50),address varchar(100),createdate varchar(50),updatedate varchar(100))', function(err, result) {
							
								if(err) {
									done();
								  return console.error('create table err', err);
								}else{
									done();
								}
								console.log(result);
							});
							
							
							client.query('CREATE TABLE IF NOT EXISTS OAuthSession(uuid varchar(50) PRIMARY KEY,session varchar(1000) NOT NULL,expires varchar(100) NOT NULL)', function(err, result) {
							
								if(err) {
									done();
								  return console.error('create table err', err);
								}else{
									done();
								}
								console.log(result);
							});
						}
						console.log(result);
					});
				}
				console.log(result);
			});
		});
		
	}
}