
/**
 * The openiod-fiware-config module for init and configuration
 * @module openiod-fiware-config
 */

/**
*
* Id: openiod-fiware-config
*  Module for configuration parameters for the generic connector to enable push and pull services to connect external services with Fiware Context broker.
*
*  Copyright (C) 2019/2020  André van der Wiel / Scapeler https://www.scapeler.com
*
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published
*  by the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
*/

// use strict only in developement environment !!
"use strict"; // This is for your code to comply with the ECMAScript 5 standard.

	var fs= require('fs'),
			path= require('path'),
			os= require('os')
	;

	var mainSystemCode,
		parameter,
		request,
		argv,
		systemBaseCode,
		systemCode,
		systemConfigLocalPath,
		systemHooksPath,
		systemConfigStr,
		systemConfig,
		systemContext,
		systemFolder,
		systemFolderParent,
		systemHostName,
		systemMainModuleName,
		systemName,
		systemListenPort,
		systemServiceType,
		systemStart,
		systemVersion,
		systemVersionL1,
		systemVersionL2,
		systemVersionL3,
		localService,
		localServiceContent;
		var _logger={}

		module.exports = {

			init: function (name,runtime_argv,logger) {
				_logger = logger
				var _module;
				systemStart= new Date();
				systemHostName= os.hostname();
				systemFolder= __dirname;
				systemFolderParent= path.resolve(__dirname, '../node_modules/' + name + '/../..');
				//console.log(systemFolderParent);
				//console.log(__filename);
				//console.log(__dirname);
				//console.log(path.resolve(__dirname, '../node_modules/' + name + '/../..') );

				systemMainModuleName= name;
				systemBaseCode= path.basename(systemFolderParent);
				argv= runtime_argv;
				systemConfigStr= fs.readFileSync(argv.configPath, "utf8");
				try {
					systemConfig= JSON.parse(systemConfigStr);
				}
				catch(error){
					console.error(error)
					return;
				}

				// IMPORTANT: SYSTEM CONFIGURATION VALUES !!!
				systemName= systemConfig.system.systemName;
				systemCode= systemConfig.system.systemCode;
				mainSystemCode= systemConfig.system.systemCode;
				//systemListenPort= systemConfig.system.systemListenPort;
				var configPathFolders = argv.configPath.split('/');
				systemListenPort = systemConfig.system.systemListenPort; // default port
				systemVersionL1= systemConfig.system.version.l1;
				systemVersionL2= systemConfig.system.version.l2;
				systemVersionL3= systemConfig.system.version.l3;
				systemVersion= systemVersionL1 + '.' + systemVersionL2 + '.' + systemVersionL3;
				systemServiceType= systemConfig.system.serviceType;
				// context(s)
				systemContext= systemConfig.context;
				// service(s)
				localService= systemConfig.service;
				localServiceContent= systemConfig.service[argv.serviceName];
				// Parameters
				parameter= systemConfig.parameter;
				// module overrules default config
				if (systemConfig.modules) {
					for (var i=0;i<systemConfig.modules.length;i++) {
						_module = systemConfig.modules[i];
						if (_module.moduleName == systemMainModuleName)  {
							if (_module.systemCode) {
								systemCode = _module.systemCode;
							}
							if (_module.systemListenPort) {
								systemListenPort = _module.systemListenPort;
							}
							break;
						}
					}
				}
				// last folder from config path is portnr for proxy service when numeric
				if (configPathFolders.length>=2) {
					var _port = configPathFolders[(configPathFolders.length-2)]
					if (!isNaN(parseFloat(_port)) && isFinite(_port)) {
						// _port is numeric
						systemListenPort = parseFloat(_port) // port from config path (last folder) overrules default
						systemHooksPath = argv.configPath.substr(0,argv.configPath.length-1-configPathFolders[configPathFolders.length-1].length)
					}
				}
				console.log('=================================================================');
				console.log('');
				console.log('Start systemname         : ' + systemName);
				console.log(' Systemmaincode / subcode: ' + mainSystemCode + ' '+ systemCode );
				console.log(' Systemversion           : ' + systemVersion);
				console.log(' Systemhost              : ' + systemHostName);
				console.log(' System folder           : ' + systemFolder);
				console.log(' System folder parent    : ' + systemFolderParent);
				console.log(' System config folder    : ' + systemConfigLocalPath);
				console.log(' System hooks  folder    : ' + systemHooksPath);
				console.log(' System Main modulename  : ' + systemMainModuleName);
				console.log(' Runtime command         : ' + argv.command);
				console.log(' Service                 : ' + argv.serviceName);
				console.log(' Servicetype             : ' + systemServiceType);
				console.log(' Listening port          : ' + systemListenPort);
				console.log(' System start            : ' + systemStart.toISOString());
				console.log('=================================================================\n');
				console.log('=================================================================');
				console.log('LICENSE');
				console.log('	');
				console.log('Id: openiod-fiware-connect-server');
				console.log('Generic service as part of the generic connector to enable services which receive push messages from external services.');
				console.log('	');
				console.log('Copyright (C) 2018  André van der Wiel / Scapeler http://www.scapeler.com');
				console.log('')
				console.log('This program is free software: you can redistribute it and/or modify');
				console.log('it under the terms of the GNU Affero General Public License as published');
				console.log('by the Free Software Foundation, either version 3 of the License, or');
				console.log('(at your option) any later version.');
				console.log('')
				console.log('This program is distributed in the hope that it will be useful,');
				console.log('but WITHOUT ANY WARRANTY; without even the implied warranty of');
				console.log('MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the');
				console.log('GNU Affero General Public License for more details.');
				console.log('')
				console.log('You should have received a copy of the GNU Affero General Public License');
				console.log('along with this program.  If not, see <https://www.gnu.org/licenses/>.');
				console.log('')
				console.log('=================================================================\n');

				if (mainSystemCode != systemBaseCode) {
					console.log('ERROR: SYSTEMCODE OF CONFIG FILE NOT EQUAL TO SYSTEM BASECODE (' + systemCode + ' vs ' + systemBaseCode + ')');
					return false;
				}
				return true;

			},  // end of init

			getSystemCode: function () {
				return systemCode;
			},

			getSystemFolderParent: function () {
				return systemFolderParent;
			},

			getSystemFolder: function () {
				return systemFolder;
			},

			getSystemListenPort: function () {
				return systemListenPort;
			},

			getContext: function (context) {
				var _context = null;
				if (systemConfig.context && systemConfig.context[context]) {
					_context 	= systemConfig.context[context];
				}
				return _context;
			},
			getConfigParameter: function () {
				return parameter;
			},

			getConfigLocalPath: function () {
				return systemConfigLocalPath;
			},
			getSystemHooksPath: function () {
				return systemHooksPath;
			},

			getConfigService: function (serviceName) {
				return localService[serviceName];
			},

			getArgv: function() {
				return argv;
			},

			setProcessCycle: function(processCycle) {
				//console.console.log(localServiceContent);
				localServiceContent.source.processCycle = processCycle;
			},
			getProcessCycle: function() {
				return localServiceContent.source.processCycle;
			}

		} // end of module.exports
