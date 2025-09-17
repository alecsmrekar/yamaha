// Data persistence handler for automatic JSON file saving
class DataHandler {
    constructor() {
        this.fileHandle = null;
        this.fileName = 'mechanic-shop-data.json';
        this.isFileSystemSupported = 'showSaveFilePicker' in window;
        this.db = null;
    }

    async initialize() {
        if (!this.isFileSystemSupported) {
            return { vehicles: [], services: [] };
        }
        
        await this.initIndexedDB();
        await this.restoreFileHandle();
        
        // Don't try to read file during initialization - browser blocks it
        // File will be loaded on first user interaction
        return { vehicles: [], services: [] };
    }

    async loadFileData() {
        if (!this.fileHandle) return { vehicles: [], services: [] };
        
        try {
            // This requires user interaction, so it should work when called from user events
            const hasPermission = await this.ensurePermission();
            if (!hasPermission) {
                console.error('Permission denied for file access');
                return { vehicles: [], services: [] };
            }
            
            const file = await this.fileHandle.getFile();
            const text = await file.text();
            
            // Handle empty file
            if (!text.trim()) {
                console.log('File is empty, returning default data');
                return { vehicles: [], services: [] };
            }
            
            const data = JSON.parse(text);
            console.log('Data loaded from file successfully');
            
            // Ensure the data has the expected structure
            return {
                vehicles: data.vehicles || [],
                services: data.services || []
            };
        } catch (e) {
            console.error('Failed to read file:', e);
            if (e.name === 'NotFoundError') {
                this.clearFileHandle();
            } else if (e instanceof SyntaxError) {
                console.error('File contains invalid JSON, treating as empty');
                // File exists but has invalid JSON - treat as empty and overwrite
                return { vehicles: [], services: [] };
            }
            return { vehicles: [], services: [] };
        }
    }

    async initIndexedDB() {
        try {
            this.db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('MechanicShopDB', 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('fileHandles')) {
                        db.createObjectStore('fileHandles', { keyPath: 'id' });
                    }
                };
            });
        } catch (e) {
            console.error('Failed to initialize IndexedDB:', e);
        }
    }

    async saveFileHandle() {
        if (!this.db || !this.fileHandle) return;
        
        try {
            const transaction = this.db.transaction(['fileHandles'], 'readwrite');
            const store = transaction.objectStore('fileHandles');
            const request = store.put({ id: 'primary', handle: this.fileHandle });
            
            await new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('File handle saved to IndexedDB');
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error('Error saving file handle:', e);
        }
    }

    async restoreFileHandle() {
        if (!this.db) {
            console.log('No IndexedDB available for restoring file handle');
            return;
        }
        
        try {
            const transaction = this.db.transaction(['fileHandles'], 'readonly');
            const store = transaction.objectStore('fileHandles');
            const result = await new Promise((resolve) => {
                const request = store.get('primary');
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });
            
            console.log('IndexedDB restore result:', result);
            
            if (result?.handle) {
                this.fileHandle = result.handle;
                console.log('File handle restored from IndexedDB');
                const permission = await this.checkPermission();
                console.log('Permission check result:', permission);
            } else {
                console.log('No saved file handle found in IndexedDB');
            }
        } catch (e) {
            console.error('Error restoring file handle:', e);
        }
    }

    async checkPermission() {
        try {
            const permission = await this.fileHandle.queryPermission({ mode: 'readwrite' });
            console.log('Current permission status:', permission);
            
            if (permission === 'granted') {
                return true;
            }
            
            // For 'prompt' or 'denied', we'll defer permission request until user interaction
            // This avoids the permission prompt during page load
            return permission === 'prompt';
        } catch (e) {
            console.error('Permission check failed:', e);
            this.clearFileHandle();
            return false;
        }
    }

    async ensurePermission() {
        if (!this.fileHandle) return false;
        
        try {
            const permission = await this.fileHandle.queryPermission({ mode: 'readwrite' });
            
            if (permission === 'granted') {
                return true;
            }
            
            if (permission === 'prompt') {
                console.log('Requesting file permission...');
                const newPermission = await this.fileHandle.requestPermission({ mode: 'readwrite' });
                const granted = newPermission === 'granted';
                console.log('Permission request result:', newPermission);
                
                if (!granted) {
                    this.clearFileHandle();
                }
                
                return granted;
            }
            
            this.clearFileHandle();
            return false;
        } catch (e) {
            console.error('Permission request failed:', e);
            this.clearFileHandle();
            return false;
        }
    }

    clearFileHandle() {
        this.fileHandle = null;
    }

    async saveData(vehicles, services) {
        if (!this.fileHandle) return;
        
        // Ensure we have permission before trying to save
        const hasPermission = await this.ensurePermission();
        if (!hasPermission) {
            console.error('No permission to write to file');
            return;
        }
        
        // Ensure we always have valid arrays
        const data = { 
            vehicles: vehicles || [], 
            services: services || [] 
        };
        
        try {
            const writable = await this.fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
            console.log('Data saved to file successfully');
        } catch (err) {
            console.error('Error writing to file:', err);
        }
    }

    async selectFile() {
        if (!this.isFileSystemSupported) return false;

        try {
            this.fileHandle = await window.showSaveFilePicker({
                suggestedName: this.fileName,
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            
            await this.saveFileHandle();
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting file:', err);
            }
            return false;
        }
    }

    async loadFromFile() {
        if (!this.isFileSystemSupported) return null;

        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            
            const file = await fileHandle.getFile();
            const data = JSON.parse(await file.text());
            
            this.fileHandle = fileHandle;
            await this.saveFileHandle();
            
            return data;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error loading file:', err);
            }
            return null;
        }
    }
}

// Create global instance
window.dataHandler = new DataHandler();