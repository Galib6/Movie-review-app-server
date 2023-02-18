const User = require("../models/user")
const jwt = require("jsonwebtoken")
const EmailVerificationToken = require("../models/emailverificationToken")
const nodemailer = require('nodemailer')
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const { sendError, genarateRandomByte } = require("../utils/helper");
const PasswordResetToken = require("../models/passwordResetToken")


exports.create = async (req, res) => {
    const { name, email, password } = req.body;
    const oldUser = await User.findOne({ email })
    if (oldUser) {
        return sendError(res, "Email is already in use!")
    }
    const newUser = new User({ name, email, password })
    await newUser.save();

    // genarate 6 digit otp
    let OTP = generateOTP();

    // store our otp in the data base
    const newEmailVerificationToken = new EmailVerificationToken({
        owner: newUser._id,
        token: OTP
    })

    await newEmailVerificationToken.save();
    // send otp to the user

    const transport = generateMailTransporter


    transport.sendMail({
        from: "verfication@review.app.com",
        to: newUser.email,
        subject: "Email Verification",
        html: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Movie Review App</a>
                </div>
                <p style="font-size:1.1em">Hi,${newUser.name}</p>
                <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
                <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>Movie Review App</p>
                    <p>Chudanga Sadar</p>
                    <p>California</p>
                </div>
            </div>
        </div>
        
        `
    })

    res.status(201).json({
        messege: "Please Verify you email, OTP has been sent to your email account"
    })
}


exports.verifyEmail = async (req, res) => {
    const { userId, OTP } = req.body;

    if (!isValidObjectId(userId)) return sendError(res, "Invalid user!",)

    const user = await User.findById(userId);
    if (!user) return sendError(res, "User not found", 404)

    if (user.isVerified) return sendError(res, "User is already verified!",)

    const token = await EmailVerificationToken.findOne({ owner: userId });
    if (!token) return sendError(res, "token not found",)

    const isMatched = await token.compareToken(OTP);
    if (!isMatched) return sendError(res, "Please submit a valid OTP!",)

    user.isVerified = true;
    await user.save();

    await EmailVerificationToken.findByIdAndDelete(token._id);

    // const transport = generateMailTransporter();


    const transport = generateMailTransporter

    transport.sendMail({
        from: "verfication@review.app.com",
        to: user.email,
        subject: "Welcome Email",
        html: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Movie Review App</a>
                </div>
                <p style="font-size:1.1em">Hi,${user.name}</p>
                <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Welcome to our app and thanks for choosing us.</h2>
                <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>Movie Review App</p>
                    <p>Chudanga Sadar</p>
                    <p>California</p>
                </div>
            </div>
        </div>
        
        `
    })

    res.json({ messege: "Your email is now constified, Thanks for choosing us" })


}

exports.resendEmailVerificationToken = async (req, res) => {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) return sendError(res, "User not found",)

    if (user.isVerified) return sendError(res, "this email is already verified!",)

    const alreadyHasToken = await EmailVerificationToken.findOne({ owner: userId });

    if (alreadyHasToken) return sendError(res, "only after one hour you can request for token")

    // genarate 6 digit otp
    let OTP = generateOTP()
    // store our otp in the data base
    const newEmailVerificationToken = new EmailVerificationToken({
        owner: user._id,
        token: OTP
    })

    await newEmailVerificationToken.save();
    // send otp to the user

    const transport = generateMailTransporter

    transport.sendMail({
        from: "verfication@review.app.com",
        to: user.email,
        subject: "Email Verification",
        html: `
       <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
           <div style="margin:50px auto;width:70%;padding:20px 0">
               <div style="border-bottom:1px solid #eee">
                   <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Movie Review App</a>
               </div>
               <p style="font-size:1.1em">Hi,${user.name}</p>
               <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
               <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
               <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
               <hr style="border:none;border-top:1px solid #eee" />
               <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                   <p>Movie Review App</p>
                   <p>Chudanga Sadar</p>
                   <p>California</p>
               </div>
           </div>
       </div>
       
       `
    })

    res.json({ messege: "New OTP is has been sent to you registered email account" })


}


exports.forgetPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) return sendError(res, "email is missing");

    const user = await User.findOne({ email })

    if (!User) return sendError(res, "User not found", 404)

    const alreadyhadToken = await PasswordResetToken.findOne({ owner: user._id })

    if (alreadyhadToken) return sendError(res, "only after one hour you can request for another token!")

    const token = await genarateRandomByte();
    const newPasswordResetToken = await PasswordResetToken({ owner: user._id, token })

    await newPasswordResetToken.save();

    const resetPasswordUrl = `http:localhost:3000/reset-password?token=${token}&id=${user._id}`;

    const transport = generateMailTransporter

    transport.sendMail({
        from: "security@review.app.com",
        to: user.email,
        subject: "Password Reset",
        html: `
       <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
           <div style="margin:50px auto;width:70%;padding:20px 0">
               <div style="border-bottom:1px solid #eee">
                   <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Movie Review App</a>
               </div>
               <p style="font-size:1.1em">Hi,${user.name}</p>
               <p>Thank you for choosing Your Brand. Here is the password change email link. Link will not validate after 1 hour</p>
               <p>Click here to change Password</p>
               <a href=${resetPasswordUrl}>Change Password</a>
               <p style="font-size:0.9em;">Regards,<br />Movie Review App</p>
               <hr style="border:none;border-top:1px solid #eee" />
               <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                   <p>Movie Review App</p>
                   <p>Chudanga Sadar</p>
               </div>
           </div>
       </div>
       
       `
    })

    res.json({ messege: "Link sent to your email!" })

}


exports.sendResetPasswordTokenStatus = (req, res) => {
    res.json({ valid: true })
}

exports.resetPassword = async (req, res) => {
    const { newPassword, userId } = req.body;

    const user = await User.findById(userId)

    const matched = await user.comparePassword(newPassword)

    if (matched) return sendError(res, "The new password must be diffrent from old one!");

    user.password = newPassword

    await user.save()

    await PasswordResetToken.findByIdAndDelete(req.resetToken._id)


    const transport = generateMailTransporter

    transport.sendMail({
        from: "security@review.app.com",
        to: user.email,
        subject: "Password Reset successfully",
        html: `
       <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
           <div style="margin:50px auto;width:70%;padding:20px 0">
               <div style="border-bottom:1px solid #eee">
                   <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Movie Review App</a>
               </div>
               <p style="font-size:1.1em">Hi,${user.name}</p>
               <p>Your Password changed successfully</p>
               <p style="font-size:0.9em;">Regards,<br />Movie Review App</p>
               <hr style="border:none;border-top:1px solid #eee" />
               <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                   <p>Movie Review App</p>
                   <p>Chudanga Sadar</p>
               </div>
           </div>
       </div>
       
       `
    })

    res.json({ messege: "Password is changed successfully" })

}



exports.signIn = async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
    if (!user) return sendError(res, "Email/Password Mismatched!")

    const matched = await user.comparePassword(password);
    if (!matched) return sendError(res, "Email/Password Mismatched!")

    const { _id, name, userEmail } = user

    const jwtToken =
        jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET
        );

    res.json(
        {
            user: {
                id: _id,
                name,
                email: userEmail,
                token: jwtToken
            }
        })

}
