function authMiddleware(req, res, next) {

    // http-only cookie
    const token = req.cookies.token;
    if(!token) return next(createHttpError.Unauthorized('Unauthorized'));

    // verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if(!decoded) return next(createHttpError.Unauthorized('Unauthorized'));
    req.user = decoded;

    next();
}

export default authMiddleware;