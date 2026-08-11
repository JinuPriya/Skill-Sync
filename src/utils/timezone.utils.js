const { DateTime } = require("luxon");

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

function convertAvailabilityToUTC(availabilitySlots, timezone) {
    return availabilitySlots.map(slot => {

        const start = DateTime.fromObject(
            {
                weekday: days.indexOf(slot.startDay) + 1,
                hour: Number(slot.startTime.split(":")[0]),
                minute: Number(slot.startTime.split(":")[1])
            },
            { zone: timezone }
        ).toUTC();

        const end = DateTime.fromObject(
            {
                weekday: days.indexOf(slot.endDay) + 1,
                hour: Number(slot.endTime.split(":")[0]),
                minute: Number(slot.endTime.split(":")[1])
            },
            { zone: timezone }
        ).toUTC();

        return {
            startDay: days[start.weekday - 1],
            startTime: start.toFormat("HH:mm"),
            endDay: days[end.weekday - 1],
            endTime: end.toFormat("HH:mm")
        };
    });
}

function convertAvailabilityFromUTC(availabilitySlots, timezone) {
    return availabilitySlots.map(slot => {

        const start = DateTime.fromObject(
            {
                weekday: days.indexOf(slot.startDay) + 1,
                hour: Number(slot.startTime.split(":")[0]),
                minute: Number(slot.startTime.split(":")[1])
            },
            { zone: "UTC" }
        ).setZone(timezone);

        const end = DateTime.fromObject(
            {
                weekday: days.indexOf(slot.endDay) + 1,
                hour: Number(slot.endTime.split(":")[0]),
                minute: Number(slot.endTime.split(":")[1])
            },
            { zone: "UTC" }
        ).setZone(timezone);

        return {
            startDay: days[start.weekday - 1],
            startTime: start.toFormat("HH:mm"),
            endDay: days[end.weekday - 1],
            endTime: end.toFormat("HH:mm")
        };
    });
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function hasAvailabilityOverlap(user1Slots, user2Slots) {

    for (const slot1 of user1Slots) {

        const start1 = timeToMinutes(slot1.startTime);
        const end1 = timeToMinutes(slot1.endTime);

        for (const slot2 of user2Slots) {
            if (
                slot1.startDay !== slot2.startDay ||
                slot1.endDay !== slot2.endDay
            ) {
                continue;
            }

            const start2 = timeToMinutes(slot2.startTime);
            const end2 = timeToMinutes(slot2.endTime);

            if (
                start1 < end2 &&
                start2 < end1
            ) {
                return true;
            }
        }
    }

    return false;
}

function countOverlappingSlots(user1Slots, user2Slots) {
    let count = 0;
    for (const slot1 of user1Slots) {

        const start1 = timeToMinutes(slot1.startTime);
        const end1 = timeToMinutes(slot1.endTime);

        for (const slot2 of user2Slots) {

            if (
                slot1.startDay !== slot2.startDay ||
                slot1.endDay !== slot2.endDay
            ) {
                continue;
            }

            const start2 = timeToMinutes(slot2.startTime);
            const end2 = timeToMinutes(slot2.endTime);

            if (
                start1 < end2 &&
                start2 < end1
            ) {
                count++;
            }
        }
    }

    return count;
}


module.exports = { convertAvailabilityToUTC, convertAvailabilityFromUTC, hasAvailabilityOverlap, countOverlappingSlots, }
