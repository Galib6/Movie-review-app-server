const nodemailer = require('nodemailer')

exports.generateOTP = (otp_length = 6) => {
    // genarate 6 digit otp
    let OTP = '';

    for (let i = 1; i <= otp_length; i++) {
        const randomValue = Math.round(Math.random() * 9)
        OTP += randomValue
    }
    return OTP;
}

exports.generateMailTransporter
    =
    nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAIL_TRAP_USER,
            pass: process.env.MAIL_TRAP_PASSWORD
        }
    });
