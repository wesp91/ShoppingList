const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//set environment
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function() {
    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true//default is false and need to be true if want to access some functions like require in require.js inside html file
        }
    });
    //Load html file into the window
    //__dirname = current directory name
    //same way as this - mainWindow.loadURL(file:name of the current directory/mainWindow.html);
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Quit app when close
    mainWindow.on('close', function(){
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu template
    Menu.setApplicationMenu(mainMenu);
})

//Handel create add window
function createAddWindow(){
    //Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add shopping list item',
        webPreferences: {
            nodeIntegration: true//default is false and need to be true if want to access some functions like require in require.js inside html file
        }
    });
    //Load html file into the window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Garbage collector related
    addWindow.on('close', function(){
        addWindow = null;
    });
}

//Catch item add
ipcMain.on('item:add', function(e,item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Create Menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//if mac add empty object in menu
// if(process.platform == 'darwin')
// {
//     mainMenuTemplate.unshift({});
// }

//Add developer tools if not production
if(process.env.NODE_ENV !== 'production')
{
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
            label: 'Toggle Dev Tools',
            accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
            click(item,focusedWindow){
                focusedWindow.toggleDevTools();
            }
        },
        {
            role: 'reload'
        }]
    });
}