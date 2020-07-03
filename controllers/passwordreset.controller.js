const jwt = require("jsonwebtoken");
const UserModel = require("../models/store_admin");
const nodemailer = require("nodemailer");
const bCrypt = require("bcryptjs");
const { RESET_PASSWORD } = process.env;

// Recover Password - Generate token and send password resetlink to mail
exports.forgetpassword = (req, res) => {
  const { phone_number, email } = req.body;

  UserModel.findOne({ identifier: phone_number })
    .then((userexist) => {
      if (!userexist)
        return res.status(400).json({
          success: false,
          message:
            "The phone number " +
            phone_number +
            " is not associated with any account. Double-check your Number and try again.",
          error: {
            statusCode: 400,
            message:
              "The phone number " +
              phone_number +
              " is not associated with any account.",
          },
        });

      // Generate password reset token
      const passwordtoken = jwt.sign(
        {
          _id: userexist.id,
        },
        RESET_PASSWORD,
        {
          expiresIn: "1h",
        }
      );

      // Set email and expires time
      userexist.local.email = email;
      userexist.resetPasswordToken =  passwordtoken
      userexist.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      // Save to DB
      userexist.save().then(() => {
        // Send email
        var transporter = nodemailer.createTransport({
          host: "youremail@gmail.com",
          secure: false, // use SSL
          service: "gmail",
          auth: {
            user: "youremail@gmail.com",
            pass: "emailpassword",
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        // Reset link
        let link ="http://" + req.headers.host + "/reset/"+ passwordtoken;
        
        let mailOptions = {
          from: "youremail@gmail.com",
          to: email,
          subject: "Reset password Link",
          text: "You requested to Reset password ",
          html: `
                <h2> Hello,  Please click on given link to reset your password</h2>
                <p> ${link} </p>
                <p>Link expires in one hour</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged. </p>
                `,
        };
        transporter.sendMail(mailOptions, function (error, data) {
          if (error) {
            return res.status(400).json({
              success: false,
              message: "Email not sent",
              error: {
                statusCode: 400,
                message: error.message,
              },
            });
          } else {
            res.status(200).json({
              success: true,
              message: "A reset link has been sent to your mail",
              phonenumber: userexist.local.phone_number,
              email: userexist.local.email,
              passwordtoken: userexist.resetPasswordToken,
              passwordexpiries: userexist.resetPasswordExpires,
            });
          }
        });
      });
    })
    .catch((error) => {
      res.status(400).json({
        success: false,
        message: "error in your request",
        error: {
          statusCode: 400,
          message: "error in request",
        },
      });
    });
};

// Reset the password and sent confirmation mail
exports.resetpassword = (req, res) => {

  const { password } = req.body;
  const { passwordtoken } = req.query;

UserModel.findOne({resetPasswordToken: passwordtoken.toString(), resetPasswordExpires: { $gt: Date.now() }})
  // UserModel.findOne({ identifier: useridentifier.toString() })
    .then((userexist) => {

      // console.log(userexist);

      if (!userexist) {
        res.status(400).json({
          success: false,
          message: "No user found",
          error: {
            statusCode: 400,
            message: "user does not exist ",
          },
        });
      }
    
      let passwordlength = password.toString();
      if (passwordlength.length < 6) {
        return res.status(400).json({
          success: false,
          message: "password length not less than 6",
          error: {
            statusCode: 400,
            message: "password not accepted",
          },
        });
      }

      // Set the new  Encrypted password
      userexist.local.password = bCrypt.hashSync(password, 12);
      userexist.resetPasswordToken = null;
      userexist.resetPasswordExpires = null;

      // Save to DB
      userexist.save((err, userwho) => {
        if (err)
          return res.status(400).json({
            success: false,
            message: "password not save",
            error: {
              statusCode: 400,
              message: err.message,
            },
          });

        // Send email
        let transporter = nodemailer.createTransport({
          host: "youremail@gmail.com",
          secure: false, // use SSL
          service: "gmail",
          auth: {
            user: "youremail@gmail.com",
            pass: "emailpassword",
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        let mailOptions = {
          from: "youremail@gmail.com",
          to: userwho.local.email,
          subject: "Your password has been changed",
          html: `
                        <h23>Hi User \n 
                            This is a confirmation that  password for your account has just been changed.\n</h3>
                            `,
        };
        transporter.sendMail(mailOptions, function (error, data) {
          if (error) {
            return res.status(500).json({
              success: false,
              message: "Email not sent",
              error: {
                statusCode: 500,
                message: error.message,
              },
            });
          } else {
            res.status(200).json({
              success: true,
              message: "password reset successful",
              user: {
                email: userwho.local.email,
                phonenumber: userwho.local.phone_number,
              passwordtoken: userwho.resetPasswordToken,
              passwordexpiries: userwho.resetPasswordExpires,
              },
            });
          }
        });
      });
    })
    .catch((error) => {
      res.status(400).json({
        success: false,
        message: "error in your request",
        error: {
          statusCode: 400,
          message: "error in request",
        },
      });
    });
};
