const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// --- EMAIL CONFIGURATION ---
// This is where you enter your secure login details.
// Remember to generate an "App Password" for Gmail.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'obms.medicalservices@gmail.com',    // Your email address
    pass: 'uhktfrypnkyhwkdp'         // Your generated 16-digit App Password
  }
});


// --- MIDDLEWARE SETUP ---
// This teaches the server how to read the incoming form data.
app.use(bodyParser.urlencoded({ extended: true }));
// This tells the server to find static files like CSS, images, and your HTML pages inside the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));


// --- ROUTES ---

// When a user goes to your main domain ('/'), send them the index.html file FROM THE PUBLIC FOLDER.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// When the form is SUBMITTED, this block of code runs.
app.post('/submit-request', (req, res) => {
  // 1. Extract every piece of data from the submitted form.
  const { fullName, age, sex, phone, serviceType, symptoms, medicalHistory, knownDiseases, locationDescription, latitude, longitude } = req.body;

  // 2. Create the clickable Google Maps link from the coordinates.
  const googleMapsLink = `https://www.google.com/maps?q=<latitude},${longitude}>`;

  // 3. Compose the FULL HTML email that your team will receive.
  const mailOptions = {
    from: '"Onboard Medical Services - OBMS" <obms.medicalservices@gmail.com>',
    to: 'abanoubemad000@gmail.com, Magedgerges064@gmail.com, samuelemadshawkeymegalaa@gmail.com', // <-- IMPORTANT: Set your team's email here
    subject: `URGENT: ${serviceType} Request - ${locationDescription}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>New Medical Assistance Request</h1>
        <p>An urgent request has been submitted at ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })} (Egypt time). Details below:</p>
        
        <h2 style="color: #D9534F;">Service Requested: ${serviceType}</h2>

        <hr style="margin: 25px 0;">

        <h3>Patient Location:</h3>
        <p><strong>Description:</strong> ${locationDescription}</p>
        <p><strong>Coordinates:</strong> Latitude: ${latitude}, Longitude: ${longitude}</p>
        <a href="${googleMapsLink}" style="background-color: #007BFF; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 18px; display: inline-block; margin-top: 10px;">
          View Location on Google Maps
        </a>
        
        <hr style="margin: 25px 0;">

        <h3>Patient Details:</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Name:</strong> ${fullName}</li>
          <li><strong>Age:</strong> ${age}</li>
          <li><strong>Sex:</strong> ${sex}</li>
          <li><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></li>
        </ul>
        
        <h3>Medical Information:</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Current Symptoms:</strong> ${symptoms}</li>
          <li><strong>Medical History/Allergies:</strong> ${medicalHistory || 'None provided'}</li>
          <li><strong>Known Diseases:</strong> ${knownDiseases || 'None provided'}</li>
        </ul>
      </div>
    `
  };

  // 4. Send the email using the transporter we configured.
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      // If sending fails, we can't proceed.
      return res.status(500).send("Could not process your request. Please try again later.");
    }
    console.log('Email sent: ' + info.response);
    // 5. If the email sends successfully, redirect the user to the confirmation page.
    res.redirect('/confirmation.html');
  });
});

// --- START THE SERVER ---
// This command tells the server to start listening for visitors.
app.listen(PORT, () => {
  console.log(`Server is running. Open your browser to http://localhost:${PORT}`);
});