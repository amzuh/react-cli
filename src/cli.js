import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

function parseArgumentsIntoOptions(rawArgs) {
 const args = arg(
   {
     '--yes': Boolean,
     '--install': Boolean,
     '-g': '--git',
     '-y': '--yes',
     '-i': '--install',
   },
   {
     argv: rawArgs.slice(2),
   }
 );
 return {
   skipPrompts: args['--yes'] || false,
   type: args._[0],
   name: args._[1],
   folder: args._[2],
   tests: args._[3] || false,
   styles: args._[4] || false,
   target: args._[5],
   runInstall: args['--install'] || false,
 };
}

async function promptForMissingOptions(options) {
    const defaultComponent = 'Functional';
    const defaultName = 'Foo';

    if (options.skipPrompts) {
      return {
        ...options,
        type: options.type || defaultComponent,
      };
    }
   
    const questions = [];
   
    if (!options.type) {
        questions.push({
            type: 'list',
            name: 'type',
            message: 'Please choose the type of the component',
            choices: ['Functional', 'Functional-with-hooks', 'Functional-With-Redux', 'Class' ,'Class-With-Redux'], // Add support to typescript
            default: defaultComponent,
        });
    }

    if(!options.target) {
      questions.push({
        type: 'input',
        name: 'target',
        message: 'Your target directory',
        default: '/',
      })
    }

    if(!options.name) {
        questions.push({
            type: 'input',
            name: 'name',
            message: 'Your component name',
            default: defaultName,
        })
    }

    if(!options.folder) {
        questions.push({
            type: 'confirm',
            name: 'folder',
            message: 'With folder ?',
            default: false,
        })
    }

    if (!options.tests) {
        questions.push({
          type: 'confirm',
          name: 'tests',
          message: 'Create a test file?',
          default: false,
        });
    }

    if (!options.styles) {
        questions.push({
          type: 'confirm',
          name: 'styles',
          message: 'Create a styles file?',
          default: false,
        });
    }

    
   
    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      type: options.type || answers.type,
      name: options.name || answers.name,
      folder: options.folder || answers.folder,
      tests: options.tests || answers.tests,
      styles: options.styles || answers.styles,
      target: options.target || answers.target,
    };
   }
   
   export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await createProject(options);
    console.log(options);
   }