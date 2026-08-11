const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
    {
        //login & register
        name: {
            type: String,
            required: [true, "Name is required."],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required."],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required."],
            minLength: [8, "Minimum 8 characters are required."],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },

        //profile
        skillsToTeach: [
            {
                skill: {
                    type: String,
                    required: true,
                },
                experienceLevel: {
                    type: String,
                    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
                    required: true,
                },
                isVerified: {
                    type: Boolean,
                    default: false,
                },
                verificationStatus: {
                    type: String,
                    enum: ["Pending", "Verified", "Rejected"],
                    default: "Pending"
                },
                certificate: {
                    type: String,
                }
            }
        ],
        skillsToLearn: [
            {
                type: String,
                trim: true,
            }
        ],
        timezone: { //Asia/Kolkata
            type: String,
            //required: true,
        },
        availabilitySlots: [
            {
                startDay: {
                    type: String,
                    required: true,
                },
                startTime: {
                    type: String,
                    required: true
                },
                endDay: {
                    type: String,
                    required: true,
                },
                endTime: {
                    type: String,
                    required: true
                }
            }
        ],
        totalSwaps: {
            type: Number,
            default: 0
        },
        verifiedTeacher: {
            type: Boolean,
            default: false,
        },
        averageRating: {
            type: Number,
            default: 0
        },

        //reset password
        otp: {
            type: String,
            default: undefined
        },
        otpExpiry: {
            type: Date
        },
        // Google Calendar
        googleAccessToken: {
            type: String,
            default: null
        },

        googleRefreshToken: {
            type: String,
            default: null
        },

        googleTokenExpiry: {
            type: Date,
            default: null
        },

        googleCalendarConnected: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
)

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredpassword) {
    return await bcrypt.compare(enteredpassword, this.password)
}

module.exports = mongoose.model("User", userSchema)