class ModalManager {
    constructor() {
        this.currentModal = null;
        this.setupGlobalClickHandler();
    }

    setupGlobalClickHandler() {
        window.onclick = (event) => {
            if (event.target.classList.contains(CONSTANTS.CLASSES.MODAL)) {
                this.closeModal(event.target.id);
            }
        };
    }

    openModal(modalId, data = null) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id ${modalId} not found`);
            return;
        }

        this.currentModal = modalId;
        modal.classList.add(CONSTANTS.CLASSES.ACTIVE);

        // If data is provided, populate the form
        if (data) {
            this.populateForm(modalId, data);
        } else {
            this.resetForm(modalId);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove(CONSTANTS.CLASSES.ACTIVE);
        }
        this.currentModal = null;
    }

    populateForm(modalId, data) {
        const modal = document.getElementById(modalId);
        const form = modal.querySelector('form');

        if (!form) return;

        // Specific field mapping for vehicle modal
        if (modalId === CONSTANTS.ELEMENTS.VEHICLE_MODAL) {
            document.getElementById(CONSTANTS.ELEMENTS.VEHICLE_ID).value = data.id || '';
            document.getElementById(CONSTANTS.ELEMENTS.OWNER_NAME).value = data.ownerName || '';
            document.getElementById(CONSTANTS.ELEMENTS.ENGINE).value = data.engine || '';
            document.getElementById(CONSTANTS.ELEMENTS.YEAR).value = data.year || '';
            document.getElementById(CONSTANTS.ELEMENTS.CHASSIS_ID).value = data.chassisId || '';
        }
        // Specific field mapping for service modal
        else if (modalId === CONSTANTS.ELEMENTS.SERVICE_MODAL) {
            document.getElementById(CONSTANTS.ELEMENTS.SERVICE_ID).value = data.id || '';
            document.getElementById(CONSTANTS.ELEMENTS.SERVICE_VEHICLE_ID).value = data.vehicleId || '';
            document.getElementById(CONSTANTS.ELEMENTS.SERVICE_NAME).value = data.serviceName || '';
            document.getElementById(CONSTANTS.ELEMENTS.SERVICE_MILEAGE).value = data.mileage || '';
            document.getElementById(CONSTANTS.ELEMENTS.SERVICE_DATE).value = data.date || '';
            document.getElementById(CONSTANTS.ELEMENTS.SERVICE_NOTES).value = data.notes || '';
        }

        // Update modal title for edit mode
        const titleElement = modal.querySelector('.modal-title');
        if (titleElement) {
            if (modalId === CONSTANTS.ELEMENTS.VEHICLE_MODAL) {
                titleElement.textContent = CONSTANTS.MODAL_TITLES.EDIT_VEHICLE;
            } else if (modalId === CONSTANTS.ELEMENTS.SERVICE_MODAL) {
                titleElement.textContent = CONSTANTS.MODAL_TITLES.EDIT_SERVICE;
            }
        }
    }

    resetForm(modalId) {
        const modal = document.getElementById(modalId);
        const form = modal.querySelector('form');

        if (form) {
            form.reset();

            // Clear hidden fields
            const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
            hiddenInputs.forEach(input => input.value = '');
        }

        // Update modal title for add mode
        const titleElement = modal.querySelector('.modal-title');
        if (titleElement) {
            if (modalId === CONSTANTS.ELEMENTS.VEHICLE_MODAL) {
                titleElement.textContent = CONSTANTS.MODAL_TITLES.ADD_VEHICLE;
            } else if (modalId === CONSTANTS.ELEMENTS.SERVICE_MODAL) {
                titleElement.textContent = CONSTANTS.MODAL_TITLES.ADD_SERVICE;
            }
        }
    }

}

window.ModalManager = ModalManager;