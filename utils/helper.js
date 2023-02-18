const crypto = require("crypto")

exports.sendError = (res, error, statusCode = 401) => {
    res.status(statusCode).send({ error })
};

exports.genarateRandomByte = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(30, (err, buff) => {
            if (err) reject(err);
            const buffString = buff.toString("hex")
            // console.log(buffString)
            resolve(buffString)
        })
    })
}
