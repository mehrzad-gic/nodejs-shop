import { indexService, storeService, showService, updateService, destroyService, registerService, updateAsAdminService} from "./Seller.service.js";


async function index(req, res, next){
    await indexService(req, res, next);
}

async function store(req, res, next){
    await storeService(req, res, next);
}

async function show(req, res, next){
    await showService(req, res, next);
}

async function update(req, res, next){
    await updateService(req, res, next);
}

async function destroy(req, res, next){
    await destroyService(req, res, next);
}

async function register(req, res, next){
    await registerService(req, res, next);
}

async function updateAsAdmin(req, res, next){
    await updateAsAdminService(req, res, next);
}

export { index, store, show, update, destroy, register, updateAsAdmin };