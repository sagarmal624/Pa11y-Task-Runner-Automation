const fs = require('fs');
const axios = require('axios');
const createClient = require('pa11y-webservice-client-node');
const config = require('./config');
const client = createClient(`http://${config.webservice.host}:${config.webservice.port}/`);
let ids = [];

fs.readFile('./data/pa11y-tasks.json', (err, data) => {
    if (err) throw err;
    let taskCreate = JSON.parse(data);
    const arr = taskCreate.urls;
    arr.forEach(element => {

        client.tasks.create({
            name: element.name,
            url: element.url,
            standard: element.standard
        }, (error, task) => {
            // Error and success handling.
            if (error) {
                console.error('Error:', error);
            }
            if (task) {
                console.log("Imported Task=", task);
                console.log(`http://localhost:${config.port}/${task.id}`);
                setTimeout(() => {
                    axios.get(`http://localhost:${config.port}/${task.id}/run`)
                        .then(response => {
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }, 5000)


            }
        });
    });

});



// async function loadpage(task) {
//     try {
//         await axios.get(`http://${config.webservice.host}:${config.webservice.port}/${task.id}/run`).
//         then(
//             (response) => {
//                 console.log("response us", response);
//             }
//         ).catch
//             ()=> 
//         });

//     } catch (error) {
//         throw error;
//     }

// }
