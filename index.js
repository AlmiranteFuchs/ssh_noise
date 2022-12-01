require('dotenv').config();

const { NodeSSH } = require('node-ssh')
const ssh = new NodeSSH();


ssh.connect({
    host: 'h52',
    username: 'bfss21',
    password: process.env.SECRET,
}).then(function () {
    console.log('connected');

     // Command
  ssh.execCommand('wall a').then(function(result) {
    console.log('STDOUT: ' + result.stdout)
    console.log('STDERR: ' + result.stderr)
  })

}).catch(function (err) {
    console.log(err);
});