const { google } = require("googleapis");
const { oauth2Client } = require("../config/googleOAuth");
const User = require("../model/user.model");

async function getAuthorizedClient(userId) {
    const user = await User.findById(userId);

    if (!user || !user.googleCalendarConnected || !user.googleRefreshToken) {
        return null;
    }

    oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
        expiry_date: user.googleTokenExpiry
            ? new Date(user.googleTokenExpiry).getTime()
            : null,
    });

    const isExpired =
        !user.googleTokenExpiry ||
        new Date(user.googleTokenExpiry).getTime() < Date.now() + 60000;

    if (isExpired) {
        const { credentials } = await oauth2Client.refreshAccessToken();

        user.googleAccessToken = credentials.access_token;

        if (credentials.refresh_token) {
            user.googleRefreshToken = credentials.refresh_token;
        }

        if (credentials.expiry_date) {
            user.googleTokenExpiry = new Date(credentials.expiry_date);
        }

        await user.save();

        oauth2Client.setCredentials(credentials);
    }

    return oauth2Client;
}

async function createGoogleMeetEvent({
    organizerId,
    summary,
    description,
    startTime,
    endTime,
    attendeeEmails,
}) {
    const client = await getAuthorizedClient(organizerId);

    if (!client) {
        return null;
    }

    const calendar = google.calendar({ version: "v3", auth: client });

    const event = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
            summary,
            description,
            start: { dateTime: new Date(startTime).toISOString() },
            end: { dateTime: new Date(endTime).toISOString() },
            attendees: attendeeEmails.map((email) => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: `skillsync-${Date.now()}`,
                    conferenceSolutionKey: { type: "hangoutsMeet" },
                },
            },
        },
    });

    return {
        meetingLink: event.data.hangoutLink || "",
        googleEventId: event.data.id || "",
    };
}

module.exports = { createGoogleMeetEvent };