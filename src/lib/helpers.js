const bcrypt = require('bcryptjs');
const helpers = {};

helpers.userLog = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    };

    return res.redirect('/login');
};

helpers.encrypt = async (password) => {
    return bcrypt.hash(password, await bcrypt.genSalt(5));
};

helpers.matchPass = async (password, originalPassword) => {
    try{
        return await bcrypt.compare(password, originalPassword);
    } catch(e) {
        console.log(e);
    }
};

module.exports = helpers;