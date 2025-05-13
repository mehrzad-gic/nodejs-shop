import { indexService, storeService, showService, updateService, destroyService } from "./BranchSchedule.Service.js";


const index = async (req, res, next) => indexService(req, res, next);
const store = async (req, res, next) => storeService(req, res, next);
const show = async (req, res, next) => showService(req, res, next);
const update = async (req, res, next) => updateService(req, res, next);
const destroy = async (req, res, next) => destroyService(req, res, next);

export { index, store, show, update, destroy };