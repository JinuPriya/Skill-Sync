const User = require("../model/user.model");

const {
    convertAvailabilityToUTC,
    convertAvailabilityFromUTC
} = require("../utils/timezone.utils");

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password -otp -otpExpiry")

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found."
            })
        }

        const profile = user.toObject();

        profile.availabilitySlots = convertAvailabilityFromUTC(
            profile.availabilitySlots,
            profile.timezone
        )

        return res.status(200).json({
            success: true,
            profile
        })

    } catch (error){
        next(error)
    }
}

const updateProfile = async (req, res, next) => {

    try {

        const {skillsToTeach, skillsToLearn, timezone, availabilitySlots} = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (skillsToTeach !== undefined)
            user.skillsToTeach = skillsToTeach;

        if (skillsToLearn !== undefined)
            user.skillsToLearn = skillsToLearn;

        if (timezone !== undefined)
            user.timezone = timezone;

        if (availabilitySlots !== undefined) {

            const zone = timezone || user.timezone;

            user.availabilitySlots = convertAvailabilityToUTC(
                availabilitySlots,
                zone
            );
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully."
        });

    } catch (error) {
        next(error)
    }
}

const addSkillToTeach = async (req, res, next) => {
    try {
        const { skill, experienceLevel } = req.body;

        if (!skill || !experienceLevel) {
            return res.status(400).json({
                success: false,
                message: "Skill and experience level are required."
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const newSkill = {
            skill,
            experienceLevel,
            isVerified: false,
            verificationStatus: "Pending",
        };

        if (req.file) {
            newSkill.certificate = `/uploads/certificates/${req.file.filename}`;
        }

        user.skillsToTeach.push(newSkill);

        await user.save();

        res.status(201).json({
            success: true,
            message: "Skill submitted for verification.",
            skillsToTeach: user.skillsToTeach
        });

    } catch (error) {
        next(error)
    }
};

const getPublicProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select(
            "-password -otp -otpExpiry -email"
        );
 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
 
        const profile = user.toObject();
 
        profile.availabilitySlots = convertAvailabilityFromUTC(
            profile.availabilitySlots,
            profile.timezone
        );
 
        return res.status(200).json({
            success: true,
            profile
        });
 
    } catch (error) {
        next(error);
    }
};

module.exports = {getProfile, updateProfile, addSkillToTeach, getPublicProfile}