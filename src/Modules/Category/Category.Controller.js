import { indexService, storeService, showService, updateService, destroyService, changeStatusService } from "./Category.Service.js";

export const index = (req, res, next) => {
    indexService(req, res, next);
}

export const store = (req, res, next) => {
    storeService(req, res, next);
}

export const show = (req, res, next) => {
    showService(req, res, next);
}

export const update = (req, res, next) => {
    updateService(req, res, next);
}

export const destroy = (req, res, next) => {
    destroyService(req, res, next);
}

export const changeStatus = (req, res, next) => {
    changeStatusService(req, res, next);
}

export {
    index,
    store,
    show,
    update,
    destroy,
    changeStatus
}