var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: __dirname+'/logs/cheese.log', category: 'cheese' }
  ]
});
var logger = log4js.getLogger('cheese');
logger.setLevel('INFO');

var pg = require('pg');
var defaults = require('./defaults.js');
//db connection string
var conString = null;
if(process.env.DATABASE_URL != null && process.env.DATABASE_URL != "" && process.env.DATABASE_URL != undefined){
	conString = process.env.DATABASE_URL;
	//pg open ssl which is must be done for heroku
	pg.defaults.ssl = true;
}else{
	conString = "postgres://"+defaults.user+":"+defaults.password+"@"+defaults.host+"/"+defaults.database;
}
//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
module.exports = {
	initdb: function(){
		pg.connect(conString, function(err, client, done) {
			if(err) {
				logger.error('initialize connect database failed! ' + err);
				return console.error('error fetching client from pool', err);
			}				
		  
			client.query('CREATE SCHEMA IF NOT EXISTS admin', function(err, result) {

				if(err) {
					logger.error('initialize create schema failed!' + err);
					done();
				  return console.error('error running create schema', err);
				}else{
					logger.info('initialize create schema success.');
					client.query('SET search_path = admin', function(err, result) {

						if(err) {
							logger.error('initialize set default schema failed!' + err);
							done();
						  return console.error('set default search path', err);
						}else{
							logger.info('initialize set default schema success.');
							client.query('CREATE TABLE IF NOT EXISTS users(id SERIAL primary key,name varchar(50) NOT NULL,password varchar(50) NOT NULL,gender varchar(20),phonenumber varchar(30),email varchar(50),address varchar(100),createdate varchar(50),updatedate varchar(100))', function(err, result) {
							
								if(err) {
									logger.error('initialize create users table failed.' + err);
									done();
								  return console.error('create table err', err);
								}else{
									logger.info('initialize create users table success.');
									done();
								}
								console.log(result);
							});
							
							
							client.query('CREATE TABLE IF NOT EXISTS OAuthSession(uuid varchar(50) PRIMARY KEY,session varchar(1000) NOT NULL,expires varchar(100) NOT NULL)', function(err, result) {
							
								if(err) {
									logger.error('initialize create table oauthsession failed!' + err);
									done();
								  return console.error('create table err', err);
								}else{
									logger.info('initialize create table oauthsession success.');
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