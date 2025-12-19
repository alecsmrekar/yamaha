class TableManager {
    constructor() {
        this.searchFunctions = new Map();
        this.setupSearchDebouncing();
    }

    setupSearchDebouncing() {
        // Create debounced search functions
        this.searchFunctions.set('vehicles', Utils.debounce(this.filterVehicles.bind(this), CONSTANTS.SEARCH_DELAY));
        this.searchFunctions.set('services', Utils.debounce(this.filterServices.bind(this), CONSTANTS.SEARCH_DELAY));
    }

    renderTable(tableType, data, additionalData = null) {
        switch (tableType) {
            case 'vehicles':
                this.renderVehiclesTable(data, additionalData);
                break;
            case 'services':
                this.renderServicesTable(data, additionalData);
                break;
            case 'vehicle-services':
                this.renderVehicleServicesTable(data, additionalData);
                break;
            default:
                console.error(`Unknown table type: ${tableType}`);
        }
    }

    renderVehiclesTable(vehicles, services = []) {
        const tbody = document.getElementById(CONSTANTS.ELEMENTS.VEHICLES_TBODY);
        const emptyState = document.getElementById(CONSTANTS.ELEMENTS.VEHICLES_EMPTY);

        if (vehicles.length === 0) {
            tbody.innerHTML = '';
            Utils.showElement(CONSTANTS.ELEMENTS.VEHICLES_EMPTY);
            return;
        }

        Utils.hideElement(CONSTANTS.ELEMENTS.VEHICLES_EMPTY);

        const sortedVehicles = [...vehicles].sort((a, b) => b.id.localeCompare(a.id));

        tbody.innerHTML = sortedVehicles.map(vehicle => {
            const serviceCount = services.filter(s => s.vehicleId === vehicle.id).length;
            return this.createVehicleRow(vehicle, serviceCount);
        }).join('');
    }

    renderServicesTable(services, vehicles = []) {
        const tbody = document.getElementById(CONSTANTS.ELEMENTS.SERVICES_TBODY);
        const emptyState = document.getElementById(CONSTANTS.ELEMENTS.SERVICES_EMPTY);

        if (services.length === 0) {
            tbody.innerHTML = '';
            Utils.showElement(CONSTANTS.ELEMENTS.SERVICES_EMPTY);
            return;
        }

        Utils.hideElement(CONSTANTS.ELEMENTS.SERVICES_EMPTY);

        const sortedServices = [...services].sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedServices.map(service => {
            const vehicle = vehicles.find(v => v.id === service.vehicleId);
            return this.createServiceRow(service, vehicle);
        }).join('');
    }

    renderVehicleServicesTable(services, vehicleId) {
        const vehicleServices = services.filter(s => s.vehicleId === vehicleId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const container = document.getElementById(CONSTANTS.ELEMENTS.VEHICLE_SERVICES);

        if (vehicleServices.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No services recorded for this vehicle.</p></div>';
            return;
        }

        container.innerHTML = vehicleServices.map(service => this.createVehicleServiceItem(service)).join('');
    }

    createVehicleRow(vehicle, serviceCount) {
        const safeVehicle = {
            id: Utils.escapeHtml(vehicle.id),
            ownerName: Utils.escapeHtml(vehicle.ownerName),
            engine: Utils.escapeHtml(vehicle.engine),
            year: Utils.escapeHtml(vehicle.year.toString()),
            chassisId: Utils.escapeHtml(vehicle.chassisId)
        };

        return `
            <tr onclick="viewVehicleDetails('${safeVehicle.id}')">
                <td>${safeVehicle.ownerName}</td>
                <td>${safeVehicle.engine}</td>
                <td>${safeVehicle.year}</td>
                <td>${safeVehicle.chassisId}</td>
                <td><span class="${CONSTANTS.CLASSES.BADGE}">${serviceCount}</span></td>
                <td onclick="event.stopPropagation()">
                    <div class="${CONSTANTS.CLASSES.ACTION_BUTTONS}">
                        <button class="${CONSTANTS.CLASSES.BTN} ${CONSTANTS.CLASSES.BTN_SECONDARY} ${CONSTANTS.CLASSES.BTN_SM}" onclick="openVehicleModal('${safeVehicle.id}')">Uredi</button>
                        <button class="${CONSTANTS.CLASSES.BTN} ${CONSTANTS.CLASSES.BTN_DANGER} ${CONSTANTS.CLASSES.BTN_SM}" onclick="deleteVehicle('${safeVehicle.id}')">Izbriši</button>
                    </div>
                </td>
            </tr>
        `;
    }

    createServiceRow(service, vehicle) {
        const safeService = {
            id: Utils.escapeHtml(service.id),
            serviceName: Utils.escapeHtml(service.serviceName),
            mileage: service.mileage.toLocaleString(),
            date: Utils.formatDate(service.date),
            notes: service.notes ? Utils.escapeHtml(service.notes) : '-'
        };

        const vehicleInfo = vehicle
            ? `${Utils.escapeHtml(vehicle.ownerName)} - ${Utils.escapeHtml(vehicle.chassisId)}`
            : CONSTANTS.MESSAGES.UNKNOWN_VEHICLE;

        return `
            <tr>
                <td>${safeService.date}</td>
                <td>${vehicleInfo}</td>
                <td>${safeService.serviceName}</td>
                <td>${safeService.mileage} km</td>
                <td>${safeService.notes}</td>
                <td>
                    <div class="${CONSTANTS.CLASSES.ACTION_BUTTONS}">
                        <button class="${CONSTANTS.CLASSES.BTN} ${CONSTANTS.CLASSES.BTN_SECONDARY} ${CONSTANTS.CLASSES.BTN_SM}" onclick="editService('${safeService.id}')">Uredi</button>
                        <button class="${CONSTANTS.CLASSES.BTN} ${CONSTANTS.CLASSES.BTN_DANGER} ${CONSTANTS.CLASSES.BTN_SM}" onclick="deleteService('${safeService.id}')">Izbriši</button>
                    </div>
                </td>
            </tr>
        `;
    }

    createVehicleServiceItem(service) {
        const safeService = {
            id: Utils.escapeHtml(service.id),
            serviceName: Utils.escapeHtml(service.serviceName),
            mileage: service.mileage.toLocaleString(),
            date: Utils.formatDate(service.date),
            notes: service.notes ? Utils.escapeHtml(service.notes) : ''
        };

        return `
            <div class="${CONSTANTS.CLASSES.SERVICE_ITEM}">
                <div class="${CONSTANTS.CLASSES.SERVICE_HEADER}">
                    <span class="${CONSTANTS.CLASSES.SERVICE_NAME}">${safeService.serviceName}</span>
                    <span class="${CONSTANTS.CLASSES.SERVICE_DATE}">${safeService.date}</span>
                </div>
                <div class="${CONSTANTS.CLASSES.SERVICE_DETAILS}">
                    <div><strong>Kilometri:</strong> ${safeService.mileage} km</div>
                    ${safeService.notes ? `<div><strong>Opombe:</strong> ${safeService.notes}</div>` : ''}
                </div>
                <div class="${CONSTANTS.CLASSES.ACTION_BUTTONS}" style="margin-top: 0.5rem;">
                    <button class="${CONSTANTS.CLASSES.BTN} ${CONSTANTS.CLASSES.BTN_SECONDARY} ${CONSTANTS.CLASSES.BTN_SM}" onclick="editService('${safeService.id}')">Uredi</button>
                    <button class="${CONSTANTS.CLASSES.BTN} ${CONSTANTS.CLASSES.BTN_DANGER} ${CONSTANTS.CLASSES.BTN_SM}" onclick="deleteService('${safeService.id}')">Izbriši</button>
                </div>
            </div>
        `;
    }

    filterVehicles(vehicles, services, searchTerm) {
        const filteredVehicles = vehicles.filter(vehicle => {
            const matchesSearch =
                vehicle.ownerName.toLowerCase().includes(searchTerm) ||
                vehicle.engine.toLowerCase().includes(searchTerm) ||
                vehicle.chassisId.toLowerCase().includes(searchTerm) ||
                vehicle.year.toString().includes(searchTerm);

            return matchesSearch;
        });

        const tbody = document.getElementById(CONSTANTS.ELEMENTS.VEHICLES_TBODY);
        const emptyState = document.getElementById(CONSTANTS.ELEMENTS.VEHICLES_EMPTY);

        if (filteredVehicles.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="${CONSTANTS.CLASSES.EMPTY_STATE_ICON}">${CONSTANTS.SEARCH_ICON}</div>
                <p>${CONSTANTS.MESSAGES.NO_VEHICLES_SEARCH}</p>
            `;
            return;
        }

        emptyState.style.display = 'none';
        this.renderVehiclesTable(filteredVehicles, services);
    }

    filterServices(services, vehicles, searchTerm) {
        const filteredServices = services.filter(service => {
            const vehicle = vehicles.find(v => v.id === service.vehicleId);
            const vehicleInfo = vehicle ? `${vehicle.ownerName} ${vehicle.chassisId}` : '';

            const matchesSearch =
                service.serviceName.toLowerCase().includes(searchTerm) ||
                (service.notes && service.notes.toLowerCase().includes(searchTerm)) ||
                vehicleInfo.toLowerCase().includes(searchTerm);

            return matchesSearch;
        });

        const tbody = document.getElementById(CONSTANTS.ELEMENTS.SERVICES_TBODY);
        const emptyState = document.getElementById(CONSTANTS.ELEMENTS.SERVICES_EMPTY);

        if (filteredServices.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="${CONSTANTS.CLASSES.EMPTY_STATE_ICON}">${CONSTANTS.SEARCH_ICON}</div>
                <p>${CONSTANTS.MESSAGES.NO_SERVICES_SEARCH}</p>
            `;
            return;
        }

        emptyState.style.display = 'none';
        this.renderServicesTable(filteredServices, vehicles);
    }

    getDebouncedSearchFunction(type) {
        return this.searchFunctions.get(type);
    }
}

window.TableManager = TableManager;
