const transporter = require("../config/email")

const sendSessionConfirmationEmail = async (email, name, goal, startTime, endTime, meetingLink) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "SkillSync Session Scheduled",
        html: `
        <h2>Hello ${name},</h2>
        
        <p>Your SkillSync session has been scheduled successfully.</p>
        
        <p><strong>Goal:</strong>${goal}</p>
        <p><strong>Start Time:</strong>${new Date(startTime).toLocaleString()}</p>
        <p><strong>End Time:</strong>${new Date(endTime).toLocaleString()}</p>
        <p><strong>Meeting Link:</strong><a href = "${meetingLink}">${meetingLink}</a></p>
        
        <p>We wish you a productive learning session!</p>
        
        <p>Team SkillSync</p>
        `
    })
}

const sendSessionReminderEmail = async (email, name, goal, startTime, meetingLink) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "SkillSync Session Reminder",
        html: `
            <h2>Hello ${name},</h2>

            <p>This is a reminder that your SkillSync session starts in <strong>1 hour</strong>.</p>

            <p><strong>Goal:</strong> ${goal}</p>
            <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
            <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>

            <p>Have a great learning session!</p>

            <p>Team SkillSync</p>
        `
    })
}

module.exports = {sendSessionConfirmationEmail, sendSessionReminderEmail}