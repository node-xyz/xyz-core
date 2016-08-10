"use strict";

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
        `{"microservices": []}`
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
            name: 'debugPort',
            message: 'A debug port for local debug',
            default: 6767,
            validate: function (value) {
              if (!isNaN(value)) {
                return true;
              } else {
                return 'Please enter a name for the repository';
              }
            }
          },
          {
            type: 'input',
            name: 'remote host',
            default: 'http://localhost',
            default: 'http://localhost',
            message: 'remote server ip, which will serve this microservices'
          },
        ];

        fs.mkdir(`${process.cwd()}/${name}`);
        fs.writeFileSync(`${process.cwd()}/${name}/${name}.json`,
          `{
            "name": "${name}",
            "net":{
              "host": "http://localhost",
              "port": 5000
            }
          }
`
        )
      }
    } else {
      console.log(chalk.red('XYZ root direcotry not detected. run $ xyz init '));
    }

  });

program.parse(process.argv);
