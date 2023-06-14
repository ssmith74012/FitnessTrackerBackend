const jwt = require("jsonwebtoken");


const requiredUser = async (req, res, next) => {
    const checkAuth = req.headers.authoriztion;

    if(!checkAuth) {
        next();
    } 
    
    const token = checkAuth.split('');
    if(!token) {
        next();

    try{
        const secret = jwt.verify(token, process.env.JWT_SECRET || "itsASecret");
        req.user = secret;
        return;
        }
        catch(error) {
            return error;
        }

}

}

module.exports = {requiredUser};