require('dotenv').config();

const fs = require('fs');
const { readFileSync } = require('fs');
const { Client } = require('ssh2');

const conn = new Client();

if (process.argv.length < 4) {
  console.log('Usage: node index.js <username> <.secret file> <.sh file>');
  process.exit(1);
}

// Get all hosts from json as array
const rawdata = fs.readFileSync('./hosts.json');
let hosts = JSON.parse(rawdata).hosts;


// Get username and secret from command line
const username = process.argv[2];
const secret = readFileSync(process.argv[3], 'utf8')

// Get .sh command from file
const command = readFileSync(process.argv[4], 'utf8');

// For each host, connect and run command
async function run(sendOnly) {
  for (let index = 0; index < hosts.length; index++) {
    const host = hosts[index];

    console.log('Connecting to ' + host);

    await new Promise((resolve, reject) => conn.on('ready', () => {
      console.log('Client :: ready');
      conn.exec(command, (err, stream) => {
        
        if (err) {
            reject(err);
            return;
        }
        resolve(stream);
        if(sendOnly){
          conn.end();
        }
        stream.on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
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
    }));

  }
}

run(true);