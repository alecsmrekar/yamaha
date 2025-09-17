class ErrorHandler {
    static async handleAsync(asyncFunction, errorMessage = 'An error occurred', showUserError = true) {
        try {
            return await asyncFunction();
        } catch (error) {
            console.error(errorMessage, error);

            if (showUserError) {
                this.showUserError(`${errorMessage}: ${error.message}`);
            }

            // Re-throw to allow caller to handle if needed
            throw error;
        }
    }

    static showUserError(message, type = 'error') {
        // For now, use alert. In the future, this could be enhanced with a toast system
        alert(message);
    }

    static logError(context, error, additionalInfo = {}) {
        console.error(`Error in ${context}:`, {
            message: error.message,
            stack: error.stack,
            ...additionalInfo
        });
    }

    static createErrorBoundary(fn, context) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.logError(context, error, { args });
                this.showUserError(`An error occurred in ${context}. Please try again.`);
                return null;
            }
        };
    }

    static wrapAsyncFunction(fn, errorMessage, context) {
        return async (...args) => {
            return this.handleAsync(
                () => fn(...args),
                errorMessage || `Error in ${context || fn.name}`,
                true
            );
        };
    }

    static validateRequired(data, requiredFields) {
        const missing = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');

        if (missing.length > 0) {
            throw new Error(`Required fields missing: ${missing.join(', ')}`);
        }
    }

    static validateVehicleData(vehicleData) {
        this.validateRequired(vehicleData, ['ownerName', 'engine', 'year', 'chassisId']);

        if (vehicleData.year < 1900 || vehicleData.year > new Date().getFullYear() + 10) {
            throw new Error('Vehicle year must be between 1900 and ' + (new Date().getFullYear() + 10));
        }
    }

    static validateServiceData(serviceData) {
        this.validateRequired(serviceData, ['vehicleId', 'serviceName', 'mileage', 'date']);

        if (serviceData.mileage < 0) {
            throw new Error('Mileage cannot be negative');
        }

        const serviceDate = new Date(serviceData.date);
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        if (serviceDate > futureDate) {
            throw new Error('Service date cannot be more than 1 year in the future');
        }
    }
}

window.ErrorHandler = ErrorHandler;