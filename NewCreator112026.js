const readline = require('readline');
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Resolve resources relative to the EXE when packaged,
// or relative to this JavaScript file during development.
const baseDir = process.pkg
    ? path.dirname(process.execPath)
    : __dirname;

const templateDir = path.join(baseDir, 'templates');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const completed = (msg) => {
    console.error(msg);
    rl.question('The process seems to have completed successfully - press Enter to close', () => {
        rl.close();
    });
};

// Read an external template as plain text.
const readTemplate = (relativePath) => {
    return fs.readFileSync(path.join(templateDir, relativePath), 'utf8');
};

// Replace only explicitly declared placeholders.
// This avoids accidentally modifying Twig expressions such as {{ variable }}.
const renderTemplate = (content, replacementNames, values) => {
    if (!replacementNames || replacementNames.length === 0) {
        return content;
    }

    replacementNames.forEach(name => {
        if (!Object.prototype.hasOwnProperty.call(values, name)) {
            throw new Error(`No replacement value was supplied for {{${name}}}`);
        }

        content = content.replaceAll(
            `{{${name}}}`,
            () => String(values[name])
        );
    });

    return content;
};

// Create all files listed in templates/files.json.
const createProjectFiles = (projectDir, values) => {
    const fileConfig = JSON.parse(readTemplate('files.json'));

    if (!Array.isArray(fileConfig.files)) {
        throw new Error('templates/files.json must contain a "files" array.');
    }

    fileConfig.files.forEach(file => {
        try {
            if (!file.template || !file.destination) {
                throw new Error('Each file entry needs a template and destination.');
            }

            let content = readTemplate(file.template);

            content = renderTemplate(
                content,
                file.replacements || [],
                values
            );

            const destination = path.join(projectDir, file.destination);

            fs.mkdirSync(path.dirname(destination), { recursive: true });
            fs.writeFileSync(destination, content);

            console.error(`Created ${file.destination}`);

        } catch (error) {
            console.error(
                `Error creating ${file.destination || 'file'}: ${error.message}`
            );
        }
    });
};

// Create a README in each folder that is still empty.
const createReadmeInFolders = (folders, projectDir) => {
    let readmeTemplate;

    try {
        readmeTemplate = readTemplate('README.md.txt');
    } catch (error) {
        console.error(`Could not read README template: ${error.message}`);
        return;
    }

    folders.forEach(folder => {
        const folderPath = path.join(projectDir, folder);

        try {
            if (fs.existsSync(folderPath) && fs.readdirSync(folderPath).length === 0) {
                const folderName = path.basename(folderPath);

                const readmeContent = readmeTemplate.replaceAll(
                    '{{FOLDER_NAME}}',
                    () => folderName
                );

                fs.writeFileSync(
                    path.join(folderPath, 'README.md'),
                    readmeContent
                );

                console.error(`Created README.md in ${folderPath}`);
            }
        } catch (error) {
            console.error(`Error processing folder ${folderPath}: ${error.message}`);
        }
    });
};
rl.question("Enter the project name : ", function (projName) {
    rl.question("Enter the database name (DB_NAME): ", function (dbName) {
        rl.question("MariaDb or Mysql : (default: 3306 (MySql)) ", function (dbPortal) {
            const dbPort = dbPortal || 3306;

            rl.question("Enter Git Repository URL to automatically create remote address (default: no) ", function (git) {
                const gitRep = git || false;

                const projectDir = path.resolve(projName);

                // Values available to external templates.
                // Add more values here if you introduce new placeholders.
                const templateValues = {
                    PROJECT_NAME: projName,
                    DB_NAME: dbName,
                    DB_PORT: dbPort
                };

                try {
                    // Load the directory structure from an external JSON file.
                    const folderConfig = JSON.parse(readTemplate('folders.json'));

                    if (!Array.isArray(folderConfig.folders)) {
                        throw new Error('templates/folders.json must contain a "folders" array.');
                    }

                    // Create the project root and all configured directories.
                    fs.mkdirSync(projectDir);

                    folderConfig.folders.forEach(folder => {
                        fs.mkdirSync(path.join(projectDir, folder), {
                            recursive: true
                        });

                        console.error(`Created directory ${folder}`);
                    });

                    console.error('Created all directories');

                    // Reuse the same external folder list for README creation.
                    createReadmeInFolders(folderConfig.folders, projectDir);

                } catch (error) {
                    console.error(`Error creating project structure: ${error.message}`);
                    return completed('Project creation could not continue.');
                }

                // Create every generated file from the external files.json manifest.
                try {
                    createProjectFiles(projectDir, templateValues);
                } catch (error) {
                    console.error(`Error processing file templates: ${error.message}`);
                }

                // Install dependencies and initialise Git in the new project.
                try {
                    process.chdir(projectDir);

                    execSync(
                        'npm install tailwindcss@3.4.17 postcss@8.4.49 autoprefixer@10.4.20 @fullhuman/postcss-purgecss',
                        { stdio: 'inherit' }
                    );

                    let composerAvailable = false;

                    try {
                        execSync('composer --version', { stdio: 'ignore' });
                        composerAvailable = true;
                    } catch {
                        console.error('Composer not found. Skipping Twig installation.');
                    }

                    if (composerAvailable) {
                        execSync('composer require "twig/twig:^3.0"', {
                            stdio: 'inherit'
                        });

                        execSync('npm run build:css', {
                            stdio: 'inherit'
                        });

                        console.error('Added Twig to composer.json');
                    }

                    execFileSync('git', ['init'], { stdio: 'inherit' });
                    execFileSync('git', ['branch', '-m', 'main'], { stdio: 'inherit' });
                    execFileSync('git', ['add', '.'], { stdio: 'inherit' });

                    execFileSync(
                        'git',
                        ['commit', '-m', 'Setup completed by Leerlandais'],
                        { stdio: 'inherit' }
                    );

                    if (gitRep) {
                        execFileSync('git', ['remote', 'add', 'origin', gitRep], {
                            stdio: 'inherit'
                        });

                        execFileSync('git', ['push', '-u', 'origin', 'main'], {
                            stdio: 'inherit'
                        });
                    }

                } catch (error) {
                    console.error(`Error during dependency installation or Git setup: ${error.message}`);
                }

                completed(' - All done!');
            });
        });
    });
});

// pkg NewCreator112026.js --targets node18-win-x64 --output MVC_Creator{date}.exe