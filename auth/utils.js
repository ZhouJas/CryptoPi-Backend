const admin = require('../auth/setup')

const getAuthToken = (req, res, next) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      req.authToken = req.headers.authorization.split(' ')[1];
    } else {
      req.authToken = null;
    }
    next();
  };
  
// Check if authenticated and add on the id - middleware
const checkIfAuthenticated = (req, res, next) => {
    getAuthToken(req, res, async () => {
        try {
            const { authToken } = req;
            const userInfo = await admin
            .auth()
              .verifyIdToken(authToken);
              console.log(userInfo.uid)
          res.locals.uid = userInfo.uid
            return next();
          } catch (e) {
            return res
              .status(401)
              .send({ error: 'You are not authorized to make this request' });
          }
        });
    };
      
module.exports = checkIfAuthenticated;