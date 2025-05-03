import { indexService, storeService, showService, updateService, destroyService, userAddressesService, changeStatusService} from "./UserAddress.Service.js";


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

async function userAddresses(req, res, next){
    await userAddressesService(req, res, next);
}

async function changeStatus(req, res, next){
    await changeStatusService(req, res, next);
}


export {
    index,
    store,
    show,
    update,
    destroy,
    userAddresses,
    changeStatus
}