#!/usr/local/bin/node

var chalk = require('chalk');
var clear = require('clear');
var CLI = require('clui');
var figlet = require('figlet');
var inquirer = require('inquirer');
var Preferences = require('preferences');
var Spinner = CLI.Spinner;
var _ = require('lodash');
var touch = require('touch');
var fs = require('fs');
var program = require('commander');
var util = require('./commands/util');
const spawn = require('child_process').spawn;

program
  .command('init')
  .description('create new node xyz system')
  .action(name => {
    if (util.isXYZDirectory()) {
      console.log(
        chalk.red('XYZ system already exists.')
      );
      process.exit();
    } else {
      fs.writeFileSync(`${process.cwd()}/xyz.json`,
        `{"microservices": [], "dev": {"microservices" : []}}`
      );
    }
  });


program
  .command('ms <name>')
  .description('create a new xyz microservice module')
  .action(name => {
    if (util.isXYZDirectory()) {
      if (util.doesMsExist(name)) {
        console.log(chalk.red('Microservice with this name already exists'));
        process.exit();
      } else {

        var questions = [{
          type: 'input',
          name: 'devPort',
          message: 'A debug port for local debug',
          default: 6767,
          validate: function (value) {
            if (!isNaN(value)) {
              return true;
            } else {
              return 'Please enter a number as the port';
            }
          }
        }];

        inquirer.prompt(questions).then(function (args) {
          console.log(args);
          fs.mkdir(`${process.cwd()}/${name}`);
          fs.writeFileSync(`${process.cwd()}/${name}/${name}.json`,
            `{"name": "${name}", "dev": {"${name}_dev","net":{"host": "http://0.0.0.0","port": ${args.devPort}}}}`
          );

          let xyz = require(`${process.cwd()}/xyz.json`);
          xyz.microservices.push({ name: name, net: { port: args.devPort } })
          xyz.dev.microservices.push({ name: `${name}_dev`, net: { port: args.devPort } })
          console.log(xyz);
          fs.writeFileSync(`${process.cwd()}/xyz.json`, JSON.stringify(xyz));
        });

      }
    } else {
      console.log(chalk.red('XYZ root direcotry not detected. run $ xyz init '));
    }
  });


program
  .command('dev')
  .description('run one instace of each ms locally')
  .action(() => {
    let xyz = require(`${process.cwd()}/xyz.json`);
    let cmd = ``;
    for (let ms of xyz.microservices) {
      let msProcess = spawn('node', [`${ms.name}/${ms.name}.js`, '--dev', '&', 'echo', '$!', '>>', 'dev.pid'])

      msProcess.stdout.on('data', function (data) { // register one or more handlers
        console.log(data.toString());
      });

      msProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
      });

      msProcess.on(`exit`, function (code) {
        console.log(`child process for ${ms.name} exited with code` + code);
      });

    }
  })

program.parse(process.argv);
