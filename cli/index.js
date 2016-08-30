#!/usr/local/bin/node

var chalk = require('chalk')
var clear = require('clear')
var CLI = require('clui')
var figlet = require('figlet')
var inquirer = require('inquirer')
var Preferences = require('preferences')
var Spinner = CLI.Spinner
var _ = require('lodash')
var touch = require('touch')
var fs = require('fs')
var program = require('commander')
var util = require('./commands/util')
const spawn = require('child_process').spawn

let spawnMicroservice = function (ms) {
  let msProcess = spawn('node', [`${ms.name}/${ms.name}.js`, '--xyzport', ms.port, '--xyzhost', 'http://0.0.0.0', '--xyzdev'])

  msProcess.stdout.on('data', function (data) { // register one or more handlers
    process.stdout.write(data.toString())
  })

  msProcess.stderr.on('data', function (data) {
    process.stdout.write(data)
  })

  msProcess.on(`exit`, function (code) {
    console.log(`child process for ${ms.name} exited with code` + code)
  })
}
program
  .command('init')
  .description('create new node xyz system')
  .action(name => {
    if (util.isXYZDirectory()) {
      console.log(
        chalk.red('XYZ system already exists.')
      )
      process.exit()
    } else {
      fs.writeFileSync(`${process.cwd()}/xyz.json`,
        `{"microservices": []}`
      )
    }
  })

program
  .command('ms <name>')
  .description('create a new xyz microservice module')
  .action(name => {
    if (util.isXYZDirectory()) {
      if (util.doesMsExist(name)) {
        console.log(chalk.red('Microservice with this name already exists'))
        process.exit()
      } else {
        var questions = [
          {
            type: 'input',
            name: 'port',
            message: 'Service port. used for both local and deploy',
            default: 6767,
            validate: function (value) {
              if (!isNaN(value)) {
                return true
              } else {
                return 'Please enter a number as the port'
              }
            }
          },
          {
            type: 'input',
            name: 'host',
            message: "An ip for service to be deployed on. use --xyzdev flag to override all ip's tp localhost",
            default: '127.0.0.1'
          }

        ]

        inquirer.prompt(questions).then(function (args) {
          fs.mkdir(`${process.cwd()}/${name}`)
          fs.writeFileSync(`${process.cwd()}/${name}/${name}.json`,
            `{"name": "${name}", "port" : ${args.port}, host: ${args.host}}`
          )

          fs.writeFileSync(`${process.cwd()}/${name}/${name}.js`, '')

          let xyz = require(`${process.cwd()}/xyz.json`)
          xyz.microservices.push({ name: name, port: args.port, host: args.host })
          fs.writeFileSync(`${process.cwd()}/xyz.json`, JSON.stringify(xyz, null, 4))
        })
      }
    } else {
      console.log(chalk.red('XYZ root direcotry not detected. run $ xyz init '))
    }
  })

program
  .command('dev')
  .option('-s, --single <ms>', 'run a single ms instance in dev mood')
  .description('run one instace of each ms locally')
  .action((env, options) => {

    if (env.single) {
      let xyz = require(`${process.cwd()}/xyz.json`)
      for (let ms of xyz.microservices) {
        if (ms.name == env.single) {
          spawnMicroservice(ms)
          return
        }
      }
      console.log('No microservices with such name found.')
      process.exit()
    } else {
      let xyz = require(`${process.cwd()}/xyz.json`)
      for (let ms of xyz.microservices) {
        spawnMicroservice(ms)
      }
    }
  })

program.parse(process.argv)
