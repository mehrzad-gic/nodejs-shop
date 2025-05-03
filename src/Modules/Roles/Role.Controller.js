import { indexService, storeService, showService, updateService, destroyService, assignRoleService, changeStatusService } from "./Role.Service.js";


//! /roles
async function index(req,res,next){
    await indexService(req,res,next);
}

//! /roles/create
async function store(req,res,next){
    await storeService(req,res,next);
}

//! /roles/show/:slug
async function show(req,res,next){
    await showService(req,res,next);
}

//! /roles/update/:slug
async function update(req,res,next){
    await updateService(req,res,next);
}

//! /roles/delete/:slug
async function destroy(req,res,next){
    await destroyService(req,res,next);
}

//! /roles/assign-role
async function assignRole(req,res,next){
    await assignRoleService(req,res,next);
}

//! /roles/change-status/:slug
async function changeStatus(req,res,next){
    await changeStatusService(req,res,next);
}


export { index, store, show, update, destroy, assignRole, changeStatus };