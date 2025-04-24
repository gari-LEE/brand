const fs = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('notice_board.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC handler for loading notices
ipcMain.handle('load-notices', async () => {
    const filePath = path.join(__dirname, 'notices.json');
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]', 'utf-8');
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading notices:', err);
        return [];
    }
});

// IPC handler for saving notices
ipcMain.handle('save-notices', async (event, notices) => {
    const filePath = path.join(__dirname, 'notices.json');
    try {
        fs.writeFileSync(filePath, JSON.stringify(notices, null, 2), 'utf-8');
        return true;
    } catch (err) {
        console.error('Error saving notices:', err);
        return false;
    }
}); 