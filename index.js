const fs = require('fs');
const { readFileSync } = require('fs');
const { Client } = require('ssh2');

// .env config
require('dotenv').config();

// if (process.argv.length < 4) {
//   console.log('Usage: node index.js <username> <.secret file> <.sh file>');
//   process.exit(1);
// }

// Get all hosts from json as array
const rawdata = fs.readFileSync('./hosts.json');
let hosts = JSON.parse(rawdata).hosts;


// Get username and secret from command line
const username = process.env.USERNAME
const secret = process.env.PASSWORD

// Get .sh command from file
const command = readFileSync(process.argv[2], 'utf8');


// For each host, connect and run command
async function run(sendOnly, host) {
  // Promise to wait for connection
  await new Promise((resolve, reject) => {
    const conn = new Client();

    console.log('Connecting to ' + host);

    setTimeout(() => {
      console.log("Timeout on host " + host);
      reject();
      conn.end();
    }, 1000);

    conn.on('error', (err) => {
      console.log("Error: " + err + " on host " + host);
      conn.end();
      reject();
    });
    conn.on('ready', () => {
      console.log('Client :: ready');
      conn.exec(command, (err, stream) => {

        if (err) {
          console.log("Error: " + err + " on host " + host);
          conn.end();
          reject();
        }
        if (sendOnly) {
          conn.end();
          resolve();
        }
        stream.on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
          resolve();
        }).on('data', (data) => {
          console.log('STDOUT:\n ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR:\n ' + data);
        });
      });
    }).connect({
      host: host,
      username: username,
      password: secret
    })
  }).catch((err) => {
    // Do nothing, it's already handled
  });
}

async function main() {
  for (const [index, host] of hosts.entries()) {
    await run(false, host);
  }
}

main();
