const nodemailer = require('nodemailer'); 

module.exports = (function (title, body, config) {
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        auth: { user: config.auth_user, pass: config.auth_pass },
    });

    var mailOptions = {
        from: config.auth_user,

        to: config.dest_email,
        subject: `${title}`,
        html: `${body}`,
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      }
    });
});
