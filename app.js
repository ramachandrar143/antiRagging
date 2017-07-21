require('dotenv').config();
var express = require('express');
var Cloudant = require('cloudant');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var smtp = require('nodemailer-smtp-transport');
var me = process.env.CLOUDANT_USERNAME;
var password = process.env.CLOUDANT_PASSWORD;
var cloudant = Cloudant({account:me, password:password});
var db = cloudant.db.use('ragging');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.post('/antiRagging',function (req,res) {
    console.log(req.body);
    var intentName = req.body.result.metadata.intentName;
    if(intentName=="StuData"){
        console.log(req.body.result.parameters);
        var StuData = req.body.result.parameters;
        var roll = req.body.result.parameters.number;
        db.insert({_id:roll,StuData},function(err,data){
            if(err){
                console.log("Error Occured!"+err);
                 var response={
            speech : "Sorry! Unable to connect to our database",
            displayText : "Sorry "+req.body.result.parameters.userName+", but we tried to save your details"
        }
        return res.json(response);
            }
            else{
                console.log(data);
                 var response={
            speech : "Complaint received!",
            displayText : "Ok "+req.body.result.parameters.userName+", We are in action!"
        }

        var transport = nodemailer.createTransport(smtp({
				service: 'hotmail',
				auth: {
				user: process.env.MAIL,
				pass: process.env.PASS
					}
				}));
			var message = {
				from: 'ramachandrar143@hotmail.com',
				to: 'sentishyam123@gmail.com',
                cc: req.body.result.parameters.mail,
				subject: 'Ragging', 
				text: 'Sir this is '+req.body.result.parameters.userName+', i\'m facing serious ragging problems in '+req.body.result.parameters.place+'. Thank You!',
                html:''
			};
				transport.sendMail(message, function(error){
			if(error){
			console.log('Error occured');
			}
			console.log('Mail sent successfully!');
			});

        return res.json(response);
            }
        })

    }
})
app.listen(process.env.PORT||3000,function(){
    console.log("listening at 3000")
})