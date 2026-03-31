const CONSTANTS = {
    // DOM Element IDs - only frequently used ones
    ELEMENTS: {
        COMPATIBILITY_WARNING: 'compatibility-warning',
        MAIN_CONTENT: 'main-content',
        SAVE_STATUS: 'save-status',
        FILE_SELECTION_SCREEN: 'file-selection-screen',
        FILE_ACCESS_SCREEN: 'file-access-screen',
        FORGET_FILE_BTN: 'forget-file-btn',

        VEHICLES_TBODY: 'vehicles-tbody',
        VEHICLES_EMPTY: 'vehicles-empty',
        VEHICLE_SEARCH: 'vehicle-search',
        VEHICLE_MODAL: 'vehicle-modal',
        VEHICLE_ID: 'vehicle-id',
        OWNER_NAME: 'owner-name',
        ENGINE: 'engine',
        YEAR: 'year',
        CHASSIS_ID: 'chassis-id',
        VEHICLE_DETAILS_MODAL: 'vehicle-details-modal',
        VEHICLE_INFO: 'vehicle-info',
        VEHICLE_SERVICES: 'vehicle-services',

        SERVICES_TBODY: 'services-tbody',
        SERVICES_EMPTY: 'services-empty',
        SERVICE_SEARCH: 'service-search',
        SERVICE_MODAL: 'service-modal',
        SERVICE_ID: 'service-id',
        SERVICE_VEHICLE_ID: 'service-vehicle-id',
        SERVICE_NAME: 'service-name',
        SERVICE_MILEAGE: 'service-mileage',
        SERVICE_DATE: 'service-date',
        SERVICE_NOTES: 'service-notes',

        SHOP_TITLE: 'shop-title',
        EDIT_TITLE_BTN: 'edit-title-btn'
    },

    // CSS Classes - only commonly used ones
    CLASSES: {
        ACTIVE: 'active',
        TAB_CONTENT: 'tab-content',
        TAB_BUTTON: 'tab-button',
        BTN: 'btn',
        BTN_SECONDARY: 'btn-secondary',
        BTN_DANGER: 'btn-danger',
        BTN_SM: 'btn-sm',
        EMPTY_STATE_ICON: 'empty-state-icon',
        SERVICE_ITEM: 'service-item',
        SERVICE_HEADER: 'service-header',
        SERVICE_NAME: 'service-name',
        SERVICE_DATE: 'service-date',
        SERVICE_DETAILS: 'service-details',
        ACTION_BUTTONS: 'action-buttons',
        BADGE: 'badge'
    },

    // Messages
    MESSAGES: {
        DELETE_VEHICLE_CONFIRM: 'Ali ste prepričani, da želite izbrisati to vozilo? Vsi povezani servisi bodo tudi izbrisani.',
        DELETE_SERVICE_CONFIRM: 'Ali ste prepričani, da želite izbrisati ta servis?',
        FORGET_FILE_CONFIRM: 'Ali ste prepričani, da želite pozabiti to datoteko? Podatki v datoteki bodo ohranjeni, vendar boste morali datoteko znova izbrati.',
        FILE_NOT_FOUND: 'Datoteka ni bila najdena. Morda je bila premaknjena, preimenovana ali izbrisana. Prosimo, izberite datoteko znova.',
        NO_VEHICLES_SEARCH: 'Nobeno vozilo ne ustreza vašim iskalnima kriterijem.',
        NO_SERVICES_SEARCH: 'Noben servis ne ustreza vašim iskalnima kriterijem.',
        UNKNOWN_VEHICLE: 'Neznano Vozilo'
    },

    // Modal Titles
    MODAL_TITLES: {
        ADD_VEHICLE: 'Dodaj Vozilo',
        EDIT_VEHICLE: 'Uredi Vozilo',
        ADD_SERVICE: 'Dodaj Servis',
        EDIT_SERVICE: 'Uredi Servis'
    },

    SEARCH_ICON: '🔍',
    SEARCH_DELAY: 300
};

window.CONSTANTS = CONSTANTS;