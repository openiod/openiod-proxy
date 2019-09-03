/**
* Module: openiod-proxy.js
* This is the main module for the OpenIoD Proxy Service.
* Module facilitates communication/translation between two different API-endpoints.
* Each process started for a proxy server uses a config argument which contains path to the config file.
* The path of the config file contains the portnumber to which this process will listen.
*  e.g. port 3000: ../openiod-proxy-config/3000/openiod-proxy-config-processname.json
* The configfile contains among other things
*  - the modulesname(s) to hook into the application for the specific functionality.
*    e.g ../openiod-proxy-config/3000/openiod-proxy-hook1-v0.1.js
*
* folder structure:
*  ./openiod-proxy/ - contains main module and NodeJS submodules
*  ./openiod-proxy-config/<portnr>/ - contains config file
*  ./openiod-proxy-config/<portnr>/ - contains hook module(s) not included in main modules sub-module folder
*/
/**
* Id: openiod-proxy
* Generic service as part of the OpenIoD Proxy service.
*
* Copyright (C) 2019/2020  André van der Wiel / Scapeler https://www.scapeler.com
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published
* by the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
*/

// use strict only in developement environment !!
if (process.env.NODE_ENV !== 'production') {
  "use strict";
}
var main_module	= 'openiod-proxy';
var modulePath = __dirname;
var openIoDConfig = require(modulePath + '/openiod-proxy-config');

/**
* add module specific requires
*/
const axios = require('axios');
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');

/**
* Configurations of logger.
*/
const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');

const consoleConfig = [
 new winston.transports.Console({
   'colorize': true
 })
];

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

//
// Replaces the previous transports with those in the
// new configuration wholesale.
//
const DailyRotateFile = require('winston-daily-rotate-file');
logger.configure({
  level: 'verbose',
  transports: [
    new DailyRotateFile({ filename: 'combined.log' })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
/** end of logger configuration */

var _systemCode = openIoDConfig.getSystemCode();
var _systemFolderParent	= openIoDConfig.getSystemFolderParent();
var _systemFolder = openIoDConfig.getSystemFolder();
var _systemListenPort	= openIoDConfig.getSystemListenPort();
var _systemParameter = openIoDConfig.getConfigParameter();

var argv = {}
var argVar = process.argv[2];
var argKey = argVar.split('=')[0]
if (argKey=='config') {
  var argValue = argVar.substr(argKey.length+1);
  argv.configPath = argValue;
}
if (argv.configPath == undefined) {
  console.error('No config parameter for config file path.');
  return;
}

openIoDConfig.init(main_module, argv, logger);

app.use(express.json())
app.use (express.urlencoded({extended: false}))

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

var _systemCode 		= openIoDConfig.getSystemCode();
var _systemFolderParent	= openIoDConfig.getSystemFolderParent();
var _systemFolder		= openIoDConfig.getSystemFolder();
var _systemListenPort	= openIoDConfig.getSystemListenPort();
var _systemParameter	= openIoDConfig.getConfigParameter();

// **********************************************************************************

var errorMessages = {
	  NOQUERY 					: { "message": 'Query parameters missing'		, "returnCode": 501 }
	, NOSERVICE 				: { "message": 'SERVICE parameter missing'		, "returnCode": 501 }
	, NOREQUEST 				: { "message": 'REQUEST parameter missing'		, "returnCode": 501 }
	, UNKNOWNREQ 				: { "message": 'REQUEST parameter unknown'		, "returnCode": 501 }
	, UNKNOWNIDENTIFIER : { "message": 'IDENTIFIER parameter unknown'	, "returnCode": 501 }
	, URLERROR 					: { "message": 'URL incorrect'					, "returnCode": 501 }
	, NOFOI 						: { "message": 'Feature of Interest missing'	, "returnCode": 501 }
	, NOMODEL 					: { "message": 'MODEL parameter missing'		, "returnCode": 501 }
	, NOARGVCOMMAND			: { "message": 'ERROR: Commandline argument command is missing or incorrect (push/pull/serve/ttn)'		, "returnCode": -1 }
	, NOARGVSERVICE			: { "message": 'ERROR: Commandline argument service is missing or unknown in this setting'		, "returnCode": -1 }
}

var _service;

var initRoutes = function(){
	app.all('/*', function(req, res, next) {
		console.log("app.all/: " + req.url + " ; systemCode: " + openIoDConfig.getSystemCode() );
		//  res.header("Access-Control-Allow-Origin", "*");
		//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});

	// test url for systemcode
	app.get('/'+openIoDConfig.getSystemCode()+'/', function(req, res) {
		console.log("Reqparam: " + req.url);
		res.send("ok");
	});

	// test url for systemcode
	app.post('/'+openIoDConfig.getSystemCode()+'/openiod-fiware-connect/knmi', function(req, res) {
		console.log("openiod-fiware-connect/knmi: " + req.url);
		console.dir(req.body);
		res.send("Message received");
	});
}

_service = openIoDConfig.getConfigService('default');
if (_service == undefined) {
	console.error(errorMessages.NOARGVSERVICE.message);
	return errorMessages.NOARGVSERVICE.returnCode;
}
var getModule = function(service,modulePath) {
	try {
    console.log('Load module: '+modulePath);
//		serviceCache[service.name] = require('./'+modulePath+'.js');
    serviceCache[service.name] = require(modulePath+'.js');
	}
	catch(e) {
	}
}

initRoutes();
console.dir(_service)
console.log('listening to port: ' + _systemListenPort);
app.listen(_systemListenPort);


// **********************************************************************************
