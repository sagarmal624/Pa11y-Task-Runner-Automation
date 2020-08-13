var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const fs = require('fs');
const axios = require('axios');
const createClient = require('pa11y-webservice-client-node');
const config = require('./config');
const client = createClient(`http://${config.webservice.host}:${config.webservice.port}/`);
require('dotenv').config();
getAllTaskFromDB();

function getAllTaskFromDB() {
	MongoClient.connect(config.webservice.database, function(err, db) {
		if (err) {
			throw err;
		}
		var dbo = db.db('pa11y-webservice');
		var dbTasks = [];
		var cursor = dbo.collection('tasks').find();
		if (cursor) {
			cursor.each(function(err, item) {
				if (item == null) {
					loadJsonFile(dbTasks);
					db.close();
				} else {
					dbTasks.push(item);
				}
			});
		}

	});
}

function loadJsonFile(dbTasks) {
	fs.readFile(`./data/${process.env.MARKET}/pa11y-tasks.json`, (err, data) => {
		if (err) {
			throw err;
		}
		let taskCreate = JSON.parse(data);
		var arr = taskCreate.urls;
		arr.forEach(element => {
			if (dbTasks) {
				if (!isTaskExistInDB(dbTasks, element)) {
					createTask(client, element);
				}
			} else {
				createTask(client, element);
			}
		});
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
	client.tasks.create({
		name: taskPayload.name,
		url: taskPayload.url,
		standard: taskPayload.standard,
		timeout: 60000,
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
