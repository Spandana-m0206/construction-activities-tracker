const sentgrid = require('@sendgrid/mail')
const logger = require("./logger");

sentgrid.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (to, subject, html) => {
    const msg = {
        to: to,
        from: process.env.SENDGRID_VERIFIED_EMAIL,
        subject: subject,
        html: html
    }

    try {
        await sentgrid.send(msg)
        console.log(`Email sent to ${to}`)
    } catch (error) {
        console.error(`Error sending email to ${to}: ${error.message}`)
        throw error
    }
}

module.exports = sendEmail