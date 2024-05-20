const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Path to the service account credentials file
const KEYFILEPATH = path.join(__dirname, 'credentials.json');

// Read and parse the credentials JSON file
const credentials = JSON.parse(fs.readFileSync(KEYFILEPATH));

// Configure Nodemailer to generate an SMTP configuration
const mailTransport = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true
});

// Email contents
const mailOptions = {
  from: 'bikram@myparticipants.com',
  to: ['bikram.deep.yadav.11@gmail.com'],
  subject: 'Test Email via Gmail API',
  text: 'Hello! This is a test email sent via Gmail API with a service account.',
  html: '<p>Hello. This is using <strong>Gmail API</strong></p>'
};

// Function to send the email using Gmail API
async function sendMimeMessage(mimeMessage) {
  const gmail = google.gmail({ version: 'v1' });
  
  const jwtClient = new google.auth.JWT(
    // credentials.client_email,
    // null,
    // credentials.private_key.replace(/\\n/g, '\n'), // Replace escaped newlines
    // ['https://www.googleapis.com/auth/gmail.send'],
    // 'bikram@myparticipants.com' // Email address of the user the service account is impersonating
   { keyFile : KEYFILEPATH,
    scopes : ['https://www.googleapis.com/auth/gmail.send'],
    subject: "bikram@myparticipants.com"
  }
  );

  // Authorize the JWT client and get a token to make API calls
  await jwtClient.authorize();

  // Send the email using the Gmail API
  const response = await gmail.users.messages.send({
    auth: jwtClient,
    userId: 'me',
    resource: { raw: mimeMessage }
  });

  console.log('Email sent:', response.data.toString);
}


// Generate MIME message and send email
mailTransport.sendMail(mailOptions, (err, info) => {
  if (err) {
    return console.error('Failed to send mail:', err);
  }
  const mimeMessage = Buffer.from(info.message.toString('base64')).toString('base64');
  sendMimeMessage(mimeMessage)
    .then(() => console.log('Email sent successfully.'))
    .catch(error => console.error('Error sending email:', error));
});

