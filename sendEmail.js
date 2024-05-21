const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Path to the service account credentials file
const KEYFILEPATH = path.join(__dirname, 'credentials.json');

// Read and parse the credentials JSON file
const credentials = JSON.parse(fs.readFileSync(KEYFILEPATH, 'utf-8'));

const mailTransport = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true
});

const mailOptions = {
  from: 'bikram@myparticipants.com',
  to: ['b422020@iiit-bh.ac.in'],
  subject: 'Test Email via Gmail API',
  text: 'Hello! This is a test email sent via Gmail API with a service account.',
  html: '<p>Hello. This is using <strong>Gmail API</strong></p>'
};

// Function to send the email using Gmail API
async function sendMimeMessage(mimeMessage) {
  const jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, '\n'), // Replace escaped newlines
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: 'bikram@myparticipants.com'
  });

  try {
    // Authorize the JWT client and get a token to make API calls
    await jwtClient.authorize();

    const gmail = google.gmail({ version: 'v1', auth: jwtClient });

    // Send the email using the Gmail API
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: mimeMessage }
    });

    console.log('Email sent:', response.data);
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
}

// Generating the MIME message from buffer
mailTransport.sendMail(mailOptions, (err, info) => {
  if (err) {
    return console.error('Failed to send mail:', err);
  }
  const mimeMessage = Buffer.from(info.message.toString(), 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  sendMimeMessage(mimeMessage)
    .then(() => console.log('Email sent successfully.'))
    .catch(error => console.error('Error sending email:', error));
});
