import { envs } from "../core/config/env";
import nodemailer from "nodemailer"

const sendMail = async (email :string, text : string) =>{

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: envs.address_mail,
    pass: envs.mot_de_passe
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email options
const mailOptions = {
  from: envs.address_mail,
  to: email,
  subject: '👋 Hello from Node.js 🚀',
  text: text
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Email sent:', info.response);
  }
});
}
export default sendMail