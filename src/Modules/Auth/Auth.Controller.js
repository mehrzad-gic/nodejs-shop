import { loginService } from "./Auth.Service.js"

//! @post /auth/login
async function login(req, res, next) {

    loginService(req, req, next)

}

export {
    login
}