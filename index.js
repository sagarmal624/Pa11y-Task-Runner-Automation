// This file is part of Pa11y Dashboard.
//
// Pa11y Dashboard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Pa11y Dashboard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Pa11y Dashboard.  If not, see <http://www.gnu.org/licenses/>.
'use strict';

const kleur = require('kleur');
let config = require('./config');

process.on('SIGINT', () => {
	console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
	process.exit();
});

require('./app')(config, (error, app) => {
	if (error) {
		console.error(error.stack);
		process.exit(1);
	}

	console.log('');
	console.log(kleur.underline().magenta('Pa11y Dashboard started'));
	console.log(kleur.grey('mode: %s'), process.env.NODE_ENV);
	console.log(kleur.grey('uri:  %s'), app.address);

	app.on('route-error', error => {
		const stack = (error.stack ? error.stack.split('\n') : [error.message]);
		const msg = kleur.red(stack.shift());
		console.error('');
		console.error(msg);
		console.error(kleur.grey(stack.join('\n')));
	});

	// Start the webservice if required
	if (typeof config.webservice === 'object') {
		config.webservice.database=process.env.WEBSITES_WEBSERVICE_DATABASE || config.webservice.database;
		require('pa11y-webservice')(config.webservice, (error, webservice) => {
			if (error) {
				console.error(error.stack);
				process.exit(1);
			}

			console.log('');
			console.log(kleur.underline().cyan('Pa11y Webservice started'));
			console.log(kleur.grey('mode:     %s'), process.env.NODE_ENV);
			console.log(kleur.grey('uri:      %s'), webservice.server.info.uri);
			console.log(kleur.grey('database: %s'), config.webservice.database);
			console.log(kleur.grey('cron:     %s'), config.webservice.cron);
		});
	}

});
