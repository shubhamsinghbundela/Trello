const jwt = require("jsonwebtoken");

const authmiddleware = (req,res,next) => {
    const token = req.headers.token;
    const decode = jwt.verify(token, "shubham123");
    req.userId = decode.userId;
    next();
}

module.exports = {
    authmiddleware: authmiddleware
}
