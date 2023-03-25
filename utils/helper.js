const crypto = require("crypto");
const cloudinary = require("../cloud/index");

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

exports.handleNotFound = (req, res) => {
    this.sendError(res, "Not Found", 404)
}

exports.uploadImageToCloud = async (file) => {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        file,
        { gravity: "face", height: 150, width: 150, crop: "thumb" }
    )
    return { url, public_id }
}

exports.formatActor = actor => {
    const { _id, name, about, gender, avatar } = actor

    return {
        id: _id,
        name,
        about,
        gender,
        avatar: avatar?.url
    }
}

