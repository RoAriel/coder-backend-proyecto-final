import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport(
    {
        service: 'gmail',
        port: '587',
        auth: {
            user: `${process.env.APP_MAIL_DIR}`,
            pass: `${process.env.APP_MAIL_PASS}`
        }
    }
)

export const enviarEmail = async (to, subject, message) => {
    return await transporter.sendMail(
        {
            from: `Ecommerce Backend ${process.env.APP_MAIL_DIR}`,
            to,
            subject,
            html: message
        }
    )
}