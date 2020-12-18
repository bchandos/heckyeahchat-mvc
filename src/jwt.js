require('dotenv').config()
const jwt = require('jsonwebtoken');
const sequelize = require('./models');
const User = sequelize.models.User;

const authenticateToken = async (req, res, next) => {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        res.status(401);
        return res.json({
            status: 'Unauthorized',
            message: 'JSON Web Token not found'
        })
    }
    try {
        const payload = await jwtVerify(token, process.env.TOKEN_SECRET);
        req.jwtPayload = payload;
        console.log(`User ID ${payload.user.id} authenticated with JWT, expires ${new Date(payload.exp*1000)}`);
        next(); // pass the execution off to whatever request the client intended
    } catch (err) {
        return res.sendStatus(403);
    }
}


const generateAccessToken = (user) => {
    return jwt.sign({user: 
        {
            id: user.id, 
            email: user.email,
            nickname: user.nickname,
            firstName: user.firstName, 
            lastName: user.lastName, 
            admin: user.admin
        }
    }, process.env.TOKEN_SECRET, { expiresIn: '12h' });
}


const authenticateAdmin = async (req, res, next) => {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        res.status(401);
        return res.json({
            status: 'Unauthorized',
            message: 'JSON Web Token not found'
        })
    }
    try {
        const payload = await jwtVerify(token, process.env.TOKEN_SECRET);
        req.jwtPayload = payload;
        const user = await User.findByPk(payload.user.id);
        if (!user.admin) {
            throw new Error();
        } else {
            console.log(`User ID ${payload.user.id} (admin) authenticated with JWT, expires ${new Date(payload.exp*1000)}`);
            next(); // pass the execution off to whatever request the client intended
        }
    } catch (err) {
        return res.sendStatus(403);
    }
}

const jwtVerify = (token, secret) => {
    // wrap jsonwebtoken verify() method in a Promise interface
    // so it can be used with async / await
    return new Promise( (resolve, reject) => {
        jwt.verify(token, secret, (err, payload) => {
            if (err) {
                reject(err);
            }
            resolve(payload);
        });
    });
}

const authenticateWebsocket = async (token) => {
    if (token == null) {
        return false;
    }
    try {
        // const payload = await jwtVerify(token, process.env.TOKEN_SECRET);
        // req.jwtPayload = payload;
        // console.log(`User ID ${payload.user.id} authenticated a Websocket with JWT, expires ${new Date(payload.exp*1000)}`);
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = {authenticateToken, generateAccessToken, authenticateAdmin, authenticateWebsocket};