var express = require('express');
var app = express();
var port = process.env.VCAP_APP_PORT || 3030;
var bodyParser = require('body-parser');
var rest = require('restler');
var mongojs = require('mongojs');
var db = mongojs('systems', ['systems']);


app.use(bodyParser.json());
app.listen(port);

//set collection interval



//get systems
getSystems = function(callback){
	db.systems.find(function(err, docs){
		callback(docs);
	});
};

//login to system
login = function (system, callback){
	var options = {"rejectUnauthorized": false};
	var uri = "http://"+system.ip+"/api/login";
	options.username = system.username;
	options.password = system.password;
	rest.get(uri, options).on('complete', function(data){

			if(data instanceof Error){
								
				token = "error";
			}
			else if(data.httpStatusCode){
				
				token = "error";
				
			}
			else{
				token = data; 
				
			}
		callback(token);
	});

};


//get performance data from system
getStatistics = function(system, token, callback){
	var options = {"rejectUnauthorized": false};
	var ip = system.ip;
	var id = system.system_id;
	options.username = system.username;
	options.password = token;
	var uri = "htps://"+ip+"/api/instances/System::"+id+"/relationships/Statistics";
	rest.get(uri, options).on('complete', function(data){

		callback(data);
	});


};

//place data into DB




//putting it all together...
storePerfData = function(){
	getSystems(function(systems){
		systems.forEach(function(system){
			login(system, function(token){
				getStatistics(system, token, function(statistics){

					console.log(statistics);
					
				});

			});

		});

	});
}


//Gets performance data every 30 seconds - just a skeleton for now
setInterval(function(){

	storePerfData();

},30000);