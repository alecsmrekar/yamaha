// Application state and managers
class MechanicShopApp {
    constructor() {
        this.vehicles = [];
        this.services = [];
        this.currentVehicleId = null;
        this.modalManager = new ModalManager();
        this.tableManager = new TableManager();
    }
}

// Global app instance
const app = new MechanicShopApp();

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Check browser compatibility
    if (!window.dataHandler.isFileSystemSupported) {
        Utils.showElement(CONSTANTS.ELEMENTS.COMPATIBILITY_WARNING);
        Utils.hideElement(CONSTANTS.ELEMENTS.MAIN_CONTENT);
        Utils.hideElement(CONSTANTS.ELEMENTS.SAVE_STATUS);
        Utils.hideElement(CONSTANTS.ELEMENTS.FILE_SELECTION_SCREEN);
        return;
    }
    
    // Initialize IndexedDB and check for saved file handle
    const data = await loadData();
    
    // Check if we have a file connection
    if (!window.dataHandler.fileHandle) {
        // Show file selection screen
        Utils.showElement(CONSTANTS.ELEMENTS.FILE_SELECTION_SCREEN);
        Utils.hideElement(CONSTANTS.ELEMENTS.MAIN_CONTENT);
        Utils.hideElement(CONSTANTS.ELEMENTS.SAVE_STATUS);
    } else {
        // File handle exists, but we need user interaction to access it
        showFileAccessPrompt();
    }
});

// Show file access prompt
function showFileAccessPrompt() {
    Utils.showElement(CONSTANTS.ELEMENTS.FILE_ACCESS_SCREEN);
    Utils.hideElement(CONSTANTS.ELEMENTS.MAIN_CONTENT);
    Utils.hideElement(CONSTANTS.ELEMENTS.SAVE_STATUS);
    Utils.hideElement(CONSTANTS.ELEMENTS.FILE_SELECTION_SCREEN);
}

// Access saved file with proper user interaction
async function accessSavedFile() {
    await ErrorHandler.handleAsync(async () => {
        const data = await window.dataHandler.loadFileData();
        app.vehicles = data.vehicles || [];
        app.services = data.services || [];
        showMainApp();
    }, 'Failed to access saved file');
}


// Show main app interface
function showMainApp() {
    Utils.hideElement(CONSTANTS.ELEMENTS.FILE_SELECTION_SCREEN);
    Utils.hideElement(CONSTANTS.ELEMENTS.FILE_ACCESS_SCREEN);
    Utils.showElement(CONSTANTS.ELEMENTS.MAIN_CONTENT);
    Utils.showElement(CONSTANTS.ELEMENTS.SAVE_STATUS);

    renderVehicles();
    renderServices();
    Utils.setTodayDate(CONSTANTS.ELEMENTS.SERVICE_DATE);
    updateSaveStatus();
}

// Initialize app with new file
async function initializeApp() {
    await ErrorHandler.handleAsync(async () => {
        const success = await window.dataHandler.selectFile();
        if (success) {
            await saveData();
            showMainApp();
        }
    }, 'Failed to initialize app');
}

// Load existing file from file selection screen
async function loadExistingFile() {
    await ErrorHandler.handleAsync(async () => {
        const data = await window.dataHandler.loadFromFile();

        if (data && data.vehicles && data.services) {
            app.vehicles = data.vehicles;
            app.services = data.services;
            await saveData();
            showMainApp();
        }
    }, 'Failed to load existing file');
}


// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll(`.${CONSTANTS.CLASSES.TAB_CONTENT}`).forEach(tab => {
        tab.classList.remove(CONSTANTS.CLASSES.ACTIVE);
    });

    // Remove active from all buttons
    document.querySelectorAll(`.${CONSTANTS.CLASSES.TAB_BUTTON}`).forEach(btn => {
        btn.classList.remove(CONSTANTS.CLASSES.ACTIVE);
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add(CONSTANTS.CLASSES.ACTIVE);

    // Mark button as active
    event.target.classList.add(CONSTANTS.CLASSES.ACTIVE);
}

// Vehicle Management
function openVehicleModal(vehicleId = null) {
    if (vehicleId) {
        const vehicle = app.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            app.modalManager.openModal(CONSTANTS.ELEMENTS.VEHICLE_MODAL, vehicle);
        }
    } else {
        app.modalManager.openModal(CONSTANTS.ELEMENTS.VEHICLE_MODAL);
    }
}

function closeVehicleModal() {
    app.modalManager.closeModal(CONSTANTS.ELEMENTS.VEHICLE_MODAL);
}

async function saveVehicle(event) {
    event.preventDefault();

    await ErrorHandler.handleAsync(async () => {
        const vehicleId = document.getElementById(CONSTANTS.ELEMENTS.VEHICLE_ID).value;
        const vehicleData = {
            id: vehicleId || Utils.generateId(),
            ownerName: document.getElementById(CONSTANTS.ELEMENTS.OWNER_NAME).value,
            engine: document.getElementById(CONSTANTS.ELEMENTS.ENGINE).value,
            year: parseInt(document.getElementById(CONSTANTS.ELEMENTS.YEAR).value),
            chassisId: document.getElementById(CONSTANTS.ELEMENTS.CHASSIS_ID).value
        };

        // Validate data
        ErrorHandler.validateVehicleData(vehicleData);

        // Check for duplicate chassis number
        const existingVehicle = app.vehicles.find(v =>
            v.chassisId === vehicleData.chassisId && v.id !== vehicleId
        );

        if (existingVehicle) {
            throw new Error(`Vozilo s šasijsko številko "${vehicleData.chassisId}" že obstaja v bazi podatkov. Lastnik: ${existingVehicle.ownerName}`);
        }

        if (vehicleId) {
            // Update existing vehicle
            const index = app.vehicles.findIndex(v => v.id === vehicleId);
            app.vehicles[index] = vehicleData;
        } else {
            // Add new vehicle
            app.vehicles.push(vehicleData);
        }

        await saveData();
        renderVehicles();
        closeVehicleModal();
    }, 'Failed to save vehicle');
}

async function deleteVehicle(vehicleId) {
    if (Utils.showConfirmDialog(CONSTANTS.MESSAGES.DELETE_VEHICLE_CONFIRM)) {
        await ErrorHandler.handleAsync(async () => {
            // Delete vehicle
            app.vehicles = app.vehicles.filter(v => v.id !== vehicleId);

            // Delete associated services
            app.services = app.services.filter(s => s.vehicleId !== vehicleId);

            await saveData();
            renderVehicles();
            renderServices();
        }, 'Failed to delete vehicle');
    }
}

function viewVehicleDetails(vehicleId) {
    app.currentVehicleId = vehicleId;
    const vehicle = app.vehicles.find(v => v.id === vehicleId);

    if (!vehicle) return;

    // Display vehicle info
    const vehicleInfo = document.getElementById(CONSTANTS.ELEMENTS.VEHICLE_INFO);
    vehicleInfo.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
                <strong>Lastnik:</strong> ${Utils.escapeHtml(vehicle.ownerName)}
            </div>
            <div>
                <strong>Motor:</strong> ${Utils.escapeHtml(vehicle.engine)}
            </div>
            <div>
                <strong>Leto:</strong> ${Utils.escapeHtml(vehicle.year.toString())}
            </div>
            <div>
                <strong>Šasijska Številka:</strong> ${Utils.escapeHtml(vehicle.chassisId)}
            </div>
        </div>
    `;

    // Display services for this vehicle
    renderVehicleServices(vehicleId);

    document.getElementById(CONSTANTS.ELEMENTS.VEHICLE_DETAILS_MODAL).classList.add(CONSTANTS.CLASSES.ACTIVE);
}

function closeVehicleDetails() {
    document.getElementById(CONSTANTS.ELEMENTS.VEHICLE_DETAILS_MODAL).classList.remove(CONSTANTS.CLASSES.ACTIVE);
    app.currentVehicleId = null;
}

function renderVehicleServices(vehicleId) {
    app.tableManager.renderTable('vehicle-services', app.services, vehicleId);
}

// Service Management
function openServiceModal(serviceId = null) {
    if (serviceId) {
        const service = app.services.find(s => s.id === serviceId);
        if (service) {
            app.modalManager.openModal(CONSTANTS.ELEMENTS.SERVICE_MODAL, service);
        }
    } else {
        app.modalManager.openModal(CONSTANTS.ELEMENTS.SERVICE_MODAL);
        document.getElementById(CONSTANTS.ELEMENTS.SERVICE_VEHICLE_ID).value = app.currentVehicleId;
        Utils.setTodayDate(CONSTANTS.ELEMENTS.SERVICE_DATE);
    }
}

function closeServiceModal() {
    app.modalManager.closeModal(CONSTANTS.ELEMENTS.SERVICE_MODAL);
}

async function saveService(event) {
    event.preventDefault();

    await ErrorHandler.handleAsync(async () => {
        const serviceId = document.getElementById(CONSTANTS.ELEMENTS.SERVICE_ID).value;
        const vehicleId = document.getElementById(CONSTANTS.ELEMENTS.SERVICE_VEHICLE_ID).value || app.currentVehicleId;

        const serviceData = {
            id: serviceId || Utils.generateId(),
            vehicleId: vehicleId,
            serviceName: document.getElementById(CONSTANTS.ELEMENTS.SERVICE_NAME).value,
            mileage: parseInt(document.getElementById(CONSTANTS.ELEMENTS.SERVICE_MILEAGE).value),
            date: document.getElementById(CONSTANTS.ELEMENTS.SERVICE_DATE).value,
            notes: document.getElementById(CONSTANTS.ELEMENTS.SERVICE_NOTES).value
        };

        // Validate data
        ErrorHandler.validateServiceData(serviceData);

        if (serviceId) {
            // Update existing service
            const index = app.services.findIndex(s => s.id === serviceId);
            app.services[index] = serviceData;
        } else {
            // Add new service
            app.services.push(serviceData);
        }

        await saveData();
        renderServices();
        renderVehicleServices(vehicleId);
        closeServiceModal();
    }, 'Failed to save service');
}

function editService(serviceId) {
    openServiceModal(serviceId);
}

async function deleteService(serviceId) {
    if (Utils.showConfirmDialog(CONSTANTS.MESSAGES.DELETE_SERVICE_CONFIRM)) {
        await ErrorHandler.handleAsync(async () => {
            const service = app.services.find(s => s.id === serviceId);
            app.services = app.services.filter(s => s.id !== serviceId);

            await saveData();
            renderServices();
            if (service) {
                renderVehicleServices(service.vehicleId);
            }
        }, 'Failed to delete service');
    }
}

// Rendering Functions
function renderVehicles() {
    app.tableManager.renderTable('vehicles', app.vehicles, app.services);
}

function renderServices() {
    app.tableManager.renderTable('services', app.services, app.vehicles);
}

// Filtering Functions
function filterVehicles() {
    const searchTerm = document.getElementById(CONSTANTS.ELEMENTS.VEHICLE_SEARCH).value.toLowerCase();
    const debouncedFilter = app.tableManager.getDebouncedSearchFunction('vehicles');
    debouncedFilter(app.vehicles, app.services, searchTerm);
}

function filterServices() {
    const searchTerm = document.getElementById(CONSTANTS.ELEMENTS.SERVICE_SEARCH).value.toLowerCase();
    const debouncedFilter = app.tableManager.getDebouncedSearchFunction('services');
    debouncedFilter(app.services, app.vehicles, searchTerm);
}



// Data Persistence
async function saveData() {
    await ErrorHandler.handleAsync(async () => {
        if (window.dataHandler.fileHandle) {
            await window.dataHandler.saveData(app.vehicles, app.services);
        }
        updateSaveStatus();
    }, 'Failed to save data', false);
}

async function loadData() {
    const data = await window.dataHandler.initialize();
    app.vehicles = data.vehicles || [];
    app.services = data.services || [];
}

function updateSaveStatus() {
    const statusEl = document.getElementById(CONSTANTS.ELEMENTS.SAVE_STATUS);

    if (window.dataHandler.fileHandle) {
        const fileName = window.dataHandler.fileHandle.name;
        statusEl.textContent = `✓ Auto-saving to file: ${fileName}`;
        statusEl.style.color = '#51cf66';
        statusEl.title = `Connected to file: ${fileName}`;
    } else {
        statusEl.textContent = '';
        statusEl.title = '';
    }
}



