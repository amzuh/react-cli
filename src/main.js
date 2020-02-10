import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

const sanitizedType = {
    'Class': 'class',
    'Class-with-redux': 'classWithRedux',
    'Functional': 'functional',
    'Functional-with-hooks': 'functionalWithHooks',
    'Functional-with-redux': 'functionalWithRedux',
};

async function copyTemplateFiles(options) {
    const targetDirectory = getTargetDirectory(options);
    const type = sanitizedType[options.type];

    return copy(options.templateDirectory, targetDirectory, {
        clobber: false,
        filter: path => {
                if(!options.tests && !options.styles) {
                    return !(path.includes('tests')) && !(path.includes(`${type}Styles.css`))
                }

                if(!options.tests) {
                    return !(path.includes('tests'))
                }

                if(!options.styles) {
                    return !(path.includes(`${type}Styles.css`))
                }
                
                return path;
        },
    });
}

async function renameTemplateFiles(options) {
    // Helpers
    let f, fileName = '', originalPath = '', newPath = '', file = '', extension = '';
    // Sanitize the type of component we will be looking for
    const type = sanitizedType[options.type];

    // Get the target directory and the files
    const targetDirectory = getTargetDirectory(options);
    const files = fs.readdirSync(targetDirectory);

    // Filter them so we only get the ones we created
    const filteredFiles = files.filter((current) => {
        return current.includes(type) || current.includes('tests');
    })

    // Loop and rename the files
    for (f = 0; f < filteredFiles.length; f += 1) {
        fileName = filteredFiles[f];
        extension = fileName.split('.')[1];
        originalPath = `${targetDirectory}/${fileName}`;
        file = fs.statSync(originalPath);

        if(file.isDirectory() && fileName === 'tests') {
            newPath = `${targetDirectory}/tests/${options.name}.test.js`; 
            fs.renameSync(`${originalPath}/${type}.test.js`, newPath);
        } else if(extension === 'css' || extension === 'scss') {
            newPath = `${targetDirectory}/${options.name}Styles.${extension}`;
            fs.renameSync(originalPath, newPath);
        } else if(extension === 'js') {
            newPath = `${targetDirectory}/${options.name}.${extension}`;
            fs.renameSync(originalPath, newPath);
        }
        
        await renameWordsInFiles(newPath, options.name);
    }
}

async function renameWordsInFiles(newPath, name) {
    if(!newPath) return null; // FIIIIXXXXEEEED -- Check this i might not need this

    let readFile = fs.readFileSync(newPath).toString();
    let newFile = readFile.replace(new RegExp('Foo(?![\w\d])', 'g'), name);

    fs.writeFileSync(newPath, newFile)
}

function getTargetDirectory(options) {
    let targetDirectory = '';

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