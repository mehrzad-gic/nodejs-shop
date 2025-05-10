import { indexService, storeService, showService, updateService, destroyService, changeStatusService } from "./AmazingSell.Service.js";


const indexController = (req, res, next) => indexService(req, res, next);

const storeController = (req, res, next) => storeService(req, res, next);

const showController = (req, res, next) => showService(req, res, next);

const updateController = (req, res, next) => updateService(req, res, next);

const destroyController = (req, res, next) => destroyService(req, res, next);

const changeStatusController = (req, res, next) => changeStatusService(req, res, next);

export { indexController, storeController, showController, updateController, destroyController, changeStatusController };