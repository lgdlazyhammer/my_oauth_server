require('./initdb.js').initdb();

var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: __dirname+'/logs/cheese.log', category: 'cheese' }
  ]
});
var logger = log4js.getLogger('cheese');
logger.setLevel('INFO');

// set variables for environment
var express = require('express');
var app = express();
//use default express session store
var session = require('express-session');

//use cookie parser to get request cookies value
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var path = require('path');
//generate a random unique string
var rs = require('random-strings');
var http = require('http');
var querystring = require('querystring');
//parse post parameters
var bodyParser = require("body-parser");
//get the request ip address
var requestIp = require('request-ip');
//set port for heroku
app.set('port', (process.env.PORT || 4000));
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // use either jade or ejs       
// instruct express to server up static assets
app.use(express.static(__dirname));
// Set server port
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var sessionService = require('./session_service');
var OAuthSession = require('./session_property');

var OAuthUser = require('./user_property');
var userService = require('./user_service');

// set routes
app.use('/register', function(req, res) {
	
    res.render('register');
});

// set routes
app.use('/oauth/register', function(req, res) {
	
    var name = req.body.name;
	var password = req.body.password;
	var gender = req.body.gender;
	var phoneNumber = req.body.phonenumber;
	var email = req.body.email;
	
	var createDate = Math.floor(Date.now() / 1000);
	var updateDate = Math.floor(Date.now() / 1000);
	
	console.log("register info: " +name+"*****"+password+"*****"+gender+"*****"+phoneNumber+"*****"+email+"*****"+createDate+"*****"+updateDate);
	
	var registerUser = new OAuthUser(name,password,gender,phoneNumber,email,createDate,updateDate);
	userService.save(registerUser,function(result){
		logger.info('user register success. user ' + name);
		var locals = { name : name, password : password, gender : gender, phoneNumber : phoneNumber, email : email, createDate : createDate, updateDate : updateDate };
		res.render('register_success',locals);
	},function(error){
		logger.error('user register failed! ' + error);
		var locals = { error : error, process : 'register user information' };
		res.render('error',locals);
	});
	
});

// set routes
app.use('/oauth/login', function(req, res) {
    
    /*var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
    
     console.log(ip);*/
    var sess;
    
    sessionService.getOAuthSession(req.query.consumer_token,function(result){
        
        console.log("data from the session **************************");
        console.log(JSON.stringify(result.rows));
        sess = JSON.parse(result.rows[0].session);
        
        var locals = { consumer_token : req.query.consumer_token };
        
        if(result.rows != null && result.rows != undefined){
			logger.info('consumer authorize success redirect to login page.');
            res.render('login',locals);
        }else{
			logger.info('consumer authorize failed can not find consumer in session.');
            res.send(403, "unauthorized");
        }
    },function(error){
		logger.error('user login failed! ' + error);
		var locals = { error : error, process : 'get consumer session to login'  };
		res.render('error',locals);
	});

});

// set routes
app.use('/oauth/authorize', function(req, res) {
   
    //generate a consumer token
    var session_id = rs.alphaLower(30);
    
    if (req.method == 'POST'){
        
        var key = req.body.key;
        var secret = req.body.secret;
        var callback_url = req.body.callback_url;
        
        //check the consumer
        var consumerExist = true;
        if(consumerExist){
            var clientIp = requestIp.getClientIp(req);
            console.log("client ip:  "+clientIp);
            //sess.callback_url = clientIp+callback_url;
            //sess.consumer_token = token;
            var oauthSessionInfo = JSON.stringify({ consumer: key, callback_ip: clientIp, callback_url: callback_url });
            var expiresDate = Math.floor(Date.now() / 1000);
            console.log(oauthSessionInfo +"********"+expiresDate+"***date tostring****"+Date.now().toString());
            var oauthSession = new OAuthSession(session_id,oauthSessionInfo,expiresDate);
            
            sessionService.save(oauthSession,function(result){
					console.log("result " +  result);
                    // 数据以json形式返回
                    var temp = { consumer_token: session_id };
                    console.log("send response:  "+JSON.stringify(temp));
					logger.info('consumer authorize success save information in session.');
                    res.status(200).send(JSON.stringify(temp));
            },function(error){
				logger.error('save consumer session failed! ' + error);
				var temp = { error: error, process:'save consumer session' };
                res.status(500).send(JSON.stringify(temp));
			});
        }else{
            res.status(403).send("unauthorized");
        }
        
    }
    
    if (req.method == 'GET'){
        console.log(req.query);
        
        var key = req.query.key;
        var secret = req.query.secret;
        var callback_url = req.query.callback_url;

         //check the consumer
        var consumerExist = true;
        if(consumerExist){
            var clientIp = requestIp.getClientIp(req);
            console.log("client ip:  "+clientIp);
            //sess.callback_url = clientIp+callback_url;
            //sess.consumer_token = token;
            var oauthSessionInfo = JSON.stringify({ consumer: key , callback_ip: clientIp, callback_url: callback_url });
            var expiresDate = Math.floor(Date.now() / 1000);
            console.log(oauthSessionInfo +"********"+expiresDate);
            var oauthSession = new OAuthSession(session_id,oauthSessionInfo,expiresDate);
            
            sessionService.save(oauthSession,function(result){
					console.log("result " +  result);
                    // 数据以json形式返回
                    var temp = { consumer_token: session_id };
                    console.log("send response:  "+JSON.stringify(temp));
					logger.info('consumer authorize success save information in session.');
                    res.status(200).send(JSON.stringify(temp));
            },function(error){
				logger.error('save consumer session failed! ' + error);
				var temp = { error: error, process:'save consumer session' };
                res.status(500).send(JSON.stringify(temp));
			});
        }else{
            res.status(403).send("unauthorized");
        }
    }
    
});

// set routes
app.use('/oauth/token', function(req, res) {
    
    var session_id = rs.alphaLower(30);
	
	var redirect_url = null;
    
	//somehow the parsed string add a \ in it's end
	console.log("****req body*****"),
	console.log(req.body.consumer_session + "*****"),
	console.log(req.body.consumer_session.substring(0,req.body.consumer_session.length-1) + "*****"),
    console.log(req.body);
	
    sessionService.getOAuthSession(req.body.consumer_session.substring(0,req.body.consumer_session.length-1),function(results){
		console.log("callback url info*******"),
		console.log(results);
		console.log(results.rows[0].session);
		console.log(JSON.parse(results.rows[0].session).callback_ip);
		//res.end(rs.alphaLower(20));
		var consumerKey = JSON.parse(results.rows[0].session).consumer;
		var callbackIp = JSON.parse(results.rows[0].session).callback_ip;
		var start = callbackIp.lastIndexOf(":")+1;
		var end = callbackIp.length;
		console.log(callbackIp.substring(start,end));
		
		redirect_url = "http://"+ callbackIp.substring(start,end)+ ':3000'+ JSON.parse(results.rows[0].session).callback_url;
		
		var oauthSession = new OAuthSession(session_id,JSON.stringify({ user: req.body.username , consumer:consumerKey }),Math.floor(Date.now() / 1000));
		sessionService.save(oauthSession,function(save_results){
			logger.info('resource token succesfully generated redirect to consumer server.');
			res.redirect(301, redirect_url + '?resource_token='+session_id);	
		},function(error){
			logger.error('save resource token session failed! ' + error);
			var locals = { error : error, process:'save resource token' };
			res.render('error',locals);
		});
	},function(error){
			logger.error('get consumer session to save resource session failed! ' + error);
			var locals = { error : error, process:'get consumer session to save resource session' };
			res.render('error',locals);
	});
		
    
     
});

app.use('/oauth/resource', function(req, res) {
    
    if (req.method == 'POST'){
        console.log(req.body);
        var resource_token = req.body.resource_token;
        
        sessionService.getOAuthSession(resource_token,function(data){
        
            console.log("data from the session **************************");
            console.log(data);
            
            //this part do the permission check
            
            
            var temp = { check : true };
            console.log("send response:  "+JSON.stringify(temp));
            res.status(200).send(JSON.stringify(temp));


        },function(error){
			var locals = { error : error };
			res.render('error',locals);
		});

    }
    
    if (req.method == 'GET'){
        console.log(req.query);
        var resource_token = req.query.resource_token;
        
        sessionService.getOAuthSession(resource_token,function(data){
        
            console.log("data from the session **************************");
            console.log(data);
            
            //this part do the permission check
            
            
            var temp = { check : true };
            console.log("send response:  "+JSON.stringify(temp));
            res.status(200).send(JSON.stringify(temp));


        });
    }
    
});