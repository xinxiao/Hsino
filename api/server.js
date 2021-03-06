// ---------------------------------------------------------------------------- //
// Hsino Financial Information API Service
//  
// Author: Xiao Xin
// Date: Jan. 23, 2016
// ---------------------------------------------------------------------------- //

/*
	Require dependencies
*/
var express = require('express');
var mongoose = require('mongoose');

/*
	Initiate service
*/
var app = express();								// Initiate application

/*
	Set up report mechanism for mongoose
*/
mongoose.connection.on('connected', function(){
	console.log('Database connected');
});										// Report connnection
mongoose.connection.on('disconnect', function(){
	console.log('Database disconnected');
});										// Report disconnection
mongoose.connection.on('error', function(error){
	console.log('Database error occurred');
	console.log(error);
});										// Report error

var url = 'mongodb://localhost/Hsino';
mongoose.connect(url);								// Connect to local MongoDB

var Stock = require('./modules/stock.js');					// Import Stock schema

app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	next();
});										// Set up request header

/*
	Set up parameters
*/
app.param('exchange', function(req, res, next, exchange){
	req.exchange = exchange;
	next();
});										// Read the exchange of stock

app.param('ticker', function(req, res, next, ticker){
	req.ticker = ticker;
	next();
});										// Read the ticker in request

app.param('date', function(req, res, next, date){
	req.date = date
	next();
});										// Read the requested date of data

/*
	Set up service
*/

// Return the general information of the stock
//
// Method: GET
// Parameter: Exchange, Ticker
//
// Reminder: Exchange, Ticker shall be capitalized
app.get('/:exchange/:ticker', function(req, res){
	var search = {
			exchange : req.exchange,
                        ticker : req.ticker,
                      };							// Set the searching parameters
	var date = req.date;							// Find the date of requested data

        Stock.findOne(search, function(err, stock){				// Look for the stock
		if(err)
			res.send(err);						// Report error

		info = {
			  company : stock['company'],
			  location : stock['location'],
			  currency : stock['currency']
		       }							// Extract the general 
										// info of the stock
		res.json(info);							// Send out data
        });

});

// Return the trading data of a given stock on a certain date
// 
// Method: POST
// Parameter: Exchange, Ticker, Date
//
// Reminder: Exchange, Ticker shall be capitalized; 
// 	     Date shall be in the format of 'YYYY-MM-DD'
app.post('/:exchange/:ticker/:date', function(req, res){
	var search = {
			exchange : req.exchange,
			ticker : req.ticker,
		     };								// Set the searching parameters
	var date = req.date;							// Get the requested date

	Stock.findOne(search, function(err, stock){				// Look for the stock
		if(err)
			res.send(err);						// Report error

		data = stock['detail'][date];					// Find data of the particular day
		notify = "The data of %s on %s in %s is requested"
		console.log(notify, stock['company'], 
				    stock['exchange'],
				    req.date);					// Log the user of the service
		res.json(data);							// Send out data
	});
});

var port = 1031;
app.listen(port)								// Start the service on port
