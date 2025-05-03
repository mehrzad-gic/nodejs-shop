import {
    indexService,
    storeService,
    showService,
    updateService,
    destroyService,
    changeStatusService,
    assignPermissionService
} from "./Permission.Service.js";


// Get all permissions
async function index(req, res, next) {
    await indexService(req, res, next);
}

// Create new permission
async function store(req, res, next) {
    await storeService(req, res, next);
}

// Get single permission
async function show(req, res, next) {
    await showService(req, res, next);
}

// Update permission
async function update(req, res, next) {
    await updateService(req, res, next);
}

// Delete permission
async function destroy(req, res, next) {
    await destroyService(req, res, next);
}

// Change permission status
async function changeStatus(req, res, next) {
    await changeStatusService(req, res, next);
}

// Assign permissions to role
async function assignPermission(req, res, next) {
    await assignPermissionService(req, res, next);
}

export {
    index,
    store,
    show,
    update,
    destroy,
    changeStatus,
    assignPermission
}; 