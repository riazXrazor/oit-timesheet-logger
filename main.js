const setupEvents = require("./winsetupEvents");
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
const electron = require("electron");

// Module to control application life.
const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  dialog,
  Notification
} = electron;

const path = require("path");
const url = require("url");
const moment = require("moment");
require("electron-debug")({ showDevTools: true });
require("electron-reload")(__dirname);
var eNotify;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let template = [
  { role: "quit" },
  {
    label: "about",
    click() {
      dialog.showMessageBox({
        type: "info",
        title: "About",
        icon: path.join(__dirname, "public/images/1024x1024.png"),
        message:
          "Version : 1.0.0 \n\r Author : Riaz Ali Laskar \n\r © " +
          moment().format("YYYY")
      });
    }
  }
];

const menu = Menu.buildFromTemplate(template);

function createWindow() {
  eNotify = require("electron-notify");
  // Change config options
  eNotify.setConfig({
    appIcon: path.join(__dirname, "public/images/1024x1024.png"),
    displayTime: 6000
  });

  Menu.setApplicationMenu(menu);
  // let tray = new Tray('./public/images/logo.png');
  // const contextMenu = Menu.buildFromTemplate([
  //   {label: 'quit', type: 'radio'},
  // ])
  // tray.setToolTip('codelogiOptimize IT Systems Pvt. Ltd. timesheet logger')
  // tray.setContextMenu(contextMenu)

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350,
    height: 700,
    resizable: false,
    icon: path.join(__dirname, "public/images/1024x1024.png"),
    webPreferences: {
      nativeWindowOpen: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function(event) {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    try {
      mainWindow.webContents.send("closing", "logout");
      event.preventDefault();
    } catch (e) {
      app.quit();
    }
  });

  mainWindow.webContents.on(
    "new-window",
    (event, url, frameName, disposition, options, additionalFeatures) => {
      if (frameName === "modal") {
        // open window as modal
        event.preventDefault();
        Object.assign(options, {
          modal: true,
          parent: mainWindow,
          width: 800,
          height: 600
        });
        event.newGuest = new BrowserWindow(options);
      }
    }
  );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function(event) {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  try {
    mainWindow.webContents.send("closing", "logout");
    event.preventDefault();
  } catch (e) {
    app.quit();
  }
});

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("logout-complet", (event, arg) => {
  mainWindow = null;
  app.quit();
});

ipcMain.on("tracker-state", (event, arg) => {
  if (Notification.isSupported()) {
    let n = new Notification({
      icon: path.join(__dirname, "public/images/1024x1024.png"),
      title: "Optimize IT Systems Pvt. Ltd. timesheet logger",
      body: arg,
      sound: path.join(__dirname, "public/sounds/beep.wav")
    });
    n.show();
  } else {
    eNotify.notify({
      title: "Optimize IT Systems Pvt. Ltd. timesheet logger",
      text: arg,
      sound: path.join(__dirname, "public/sounds/beep.wav")
    });
  }
});

ipcMain.on("tracker-snapshot", (event, arg) => {
  if (Notification.isSupported()) {
    let n = new Notification({
      icon: path.join(__dirname, "public/images/1024x1024.png"),
      title: "Optimize IT Systems Pvt. Ltd. timesheet logger",
      body: "Logging your progress to server",
      sound: path.join(__dirname, "public/sounds/beep.wav")
    });
    n.show();
  } else {
    eNotify.notify({
      title: "Optimize IT Systems Pvt. Ltd. timesheet logger",
      text: "Logging your progress to server",
      image: path.join(__dirname, "public/images/time.gif"),
      sound: path.join(__dirname, "public/sounds/beep.wav")
    });
  }
});

ipcMain.on("tracker-notify", (event, arg) => {
  if (Notification.isSupported()) {
    let n = new Notification({
      icon: path.join(__dirname, "public/images/1024x1024.png"),
      title: "Optimize IT Systems Pvt. Ltd. timesheet logger",
      body: arg,
      sound: path.join(__dirname, "public/sounds/beep.wav")
    });
    n.show();
  } else {
    eNotify.notify({
      title: "Optimize IT Systems Pvt. Ltd. timesheet logger",
      text: arg,
      image: path.join(__dirname, "public/images/time.gif"),
      sound: path.join(__dirname, "public/sounds/beep.wav")
    });
  }
});
