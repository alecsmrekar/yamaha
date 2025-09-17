class Utils {
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static setTodayDate(elementId) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById(elementId).value = today;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static showElement(elementId) {
        document.getElementById(elementId).style.display = 'block';
    }

    static hideElement(elementId) {
        document.getElementById(elementId).style.display = 'none';
    }

    static async handleAsyncError(asyncFunction, errorMessage = 'An error occurred') {
        try {
            return await asyncFunction();
        } catch (error) {
            console.error(errorMessage, error);
            this.showUserError(errorMessage + ': ' + error.message);
            throw error;
        }
    }

    static showUserError(message) {
        alert(message);
    }

    static showConfirmDialog(message) {
        return confirm(message);
    }

    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }
}

window.Utils = Utils;