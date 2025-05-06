import { indexService, storeService, showService, updateService, destroyService, changeStatusService } from './Post.Service.js'

const index = (req,res,next) => indexService(req,res,next);

const store = (req,res,next) => storeService(req,res,next);

const show = (req,res,next) => showService(req,res,next);

const update = (req,res,next) => updateService(req,res,next);

const destroy = (req,res,next) => destroyService(req,res,next);

const changeStatus = (req,res,next) => changeStatusService(req,res,next);

export { index, store, show, update, destroy, changeStatus };
