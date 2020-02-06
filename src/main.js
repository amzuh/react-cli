import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
    const targetDirectory = getTargetDirectory(options);
    const type = options.type.toLowerCase();

    console.log('target', targetDirectory);
    return copy(options.templateDirectory, targetDirectory, {
        clobber: false,
        filter: path => {
                if(!options.tests && !options.styles) {
                    return !(path.indexOf('tests') > -1) && !(path.indexOf(`${type}Styles.css`) > -1)
                }

                if(!options.tests) {
                    return !(path.indexOf('tests') > -1)
                }

                if(!options.styles) {
                    return !(path.indexOf(`${type}Styles.css`) > -1)
                }
                
                return path;
        },
    });
}

async function renameTemplateFiles(options) {
    const targetDirectory = getTargetDirectory(options);
    const files = fs.readdirSync(targetDirectory);

    let f, fileName, originalPath, newPath, file, extension;
    const type = options.type;

    for (f = 0; f < files.length; f += 1) {
        fileName = files[f];
        extension = fileName.split('.')[1];
        originalPath = `${targetDirectory}/${fileName}`;
        file = fs.statSync(originalPath);

        if(file.isDirectory()) {
            newPath = `${targetDirectory}/${options.name}.test.js`; 
            fs.renameSync(`${originalPath}/${type}.test.js`, newPath);
        } else if(extension === 'css' || extension === 'scss') {
            newPath = `${targetDirectory}/${options.name}Styles.${extension}`;
            fs.renameSync(originalPath, newPath);
        } else {
            newPath = `${targetDirectory}/${options.name}.${extension}`;
            fs.renameSync(originalPath, newPath);
        }

        const foo = fs.readFileSync(newPath).toString();
        // replace all foo's we can find on the files
        let newFoo = foo.replace(new RegExp('Foo(?![\w\d])', 'g'), options.name);
        // write on them
        fs.writeFileSync(newPath, newFoo)
    }
}

function getTargetDirectory(options) {
    let targetDirectory;

    if(options.folder && options.target) {
        targetDirectory = `${options.targetDirectory}/${options.target}/${options.name}` 
    } else if (options.folder) {
        targetDirectory = `${options.targetDirectory}/${options.name}`
    } else {
        targetDirectory = options.targetDirectory;
    }

    return targetDirectory;
}

export async function createProject(options) {
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd(),
    };

    const currentFileUrl = import.meta.url;

    const templateDir = path.resolve(
        new URL(currentFileUrl).pathname,
        '../../templates',
        options.type.toLowerCase(),
    );

    options.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name', chalk.red.bold('ERROR'));
        process.exit(1);
    }

    const tasks = new Listr([
    {
        title: 'Copy project files',
        task: async () => await copyTemplateFiles(options),
    },
    {
        title: 'Rename project files',
        task: async () => await renameTemplateFiles(options),
    },
    {
        title: 'Install dependencies',
        task: () =>
            projectInstall({
                cwd: options.targetDirectory,
            }),
        skip: () =>
            !options.runInstall
                ? 'Pass --install to automatically install dependencies'
                : undefined,
        },
    ]);
 
    await tasks.run();

    console.log('%s Project ready', chalk.green.bold('DONE'));
    return true;

}