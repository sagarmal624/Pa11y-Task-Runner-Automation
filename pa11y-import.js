const request = require('request');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const fs = require('fs');
const axios = require('axios');
const createClient = require('pa11y-webservice-client-node');
const config = require('./config');
const client = createClient(`http://${config.webservice.host}:${config.webservice.port}/`);
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 500;

function getAllTaskFromDB(jsonUrl) {
	MongoClient.connect(config.webservice.database, {
		useUnifiedTopology: true,
		useNewUrlParser: true
	}, function(err, db) {
		if (err) {
			throw err;
		}
		var dbo = db.db('pally-webservice');
		var dbTasks = [];
		var cursor = dbo.collection('tasks').find();
		if (cursor) {
			cursor.each(function(err, item) {
				if (item == null) {
					loadJsonFile(jsonUrl, dbTasks);
					db.close();
				} else {
					dbTasks.push(item);
				}
			});
		}
	});
}

function loadJsonFile(jsonUrl, dbTasks) {
	let options = {json: true};
	request(jsonUrl, options, (error, res, body) => {
		if (error) {
			return console.log(error);
		}
		if (!error && res.statusCode == 200) {
			const arr = body.urls;
			arr.forEach(element => {
				if (dbTasks) {
					if (!isTaskExistInDB(dbTasks, element)) {
						createTask(client, element);
					}
				} else {
					createTask(client, element);
				}
			});
		}
		;
	});
}

function isTaskExistInDB(dbTasks, element) {
	return dbTasks.some(task => {
			const result = task.name === element.name;
			if (result) {
				console.log('Task is already exist..' + task.name);
				runPallyReport(task);
			}
			return result;
		}
	);
}

function createTask(client, taskPayload) {
	console.log(globalString);
	client.tasks.create({
		name: taskPayload.name,
		url: taskPayload.url,
		standard: taskPayload.standard,
		timeout: 80000,
		headers: {type: globalString},
		ignore: taskPayload.ignore
	}, (error, task) => {
		if (error) {
			console.error('Error:', error);
		}
		if (task) {
			runPallyReport(task);
		}
	});
}

function runPallyReport(task) {
	console.log('Start to Run Pally Report for task...' + task.name);
	const task_id = task.id ? task.id : new ObjectId(task._id);
	axios.get(`http://localhost:${config.port}/${task_id}/run`)
		.then(response => {
			console.log('Ran Pally Report successfully for task' + task.name);
		})
		.catch(error => {
			console.log(error);
		});
}

module.exports = {getAllTaskFromDB: getAllTaskFromDB};
