const sgMail = require('@sendgrid/mail')

const sendGridApiKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridApiKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mauricioaznar94@gmail.com',
        subject: 'Welcome to the app',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

module.exports = {
    sendWelcomeEmail
}