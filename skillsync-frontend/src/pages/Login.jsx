import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import "./Login.css";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [forgotPassword, setForgotPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await api.post("/auth/login", data);

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            toast.success("Login successful!");
            navigate("/find-match");

        } catch (error) {
            const message =
                error.response?.data?.message || "Login failed. Please try again.";

            toast.error(message);
        }
    };

    const handleForgotPassword = async () => {
        const email = getValues("email");

        if (!email) {
            toast.error("Please enter your email first.");
            return;
        }

        try {
            await api.post("/auth/forgot-password", {
                email,
            });

            toast.success("OTP sent to your email!");

            setOtpSent(true);

        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to send OTP. Please try again.";

            toast.error(message);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error("Please enter the OTP.");
            return;
        }

        const email = getValues("email");

        try {
            const response = await api.post("/auth/verify-otp", {
                email,
                otp,
            });

            toast.success("OTP verified successfully!");

            setResetToken(response.data.resetToken);
            setVerified(true);

        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Invalid OTP. Please try again.";

            toast.error(message);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in both password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            await api.post(
                "/auth/reset-password",
                { newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${resetToken}`,
                    },
                }
            );

            toast.success("Password reset successful! Please login.");

            setOtpSent(false);
            setVerified(false);
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to reset password. Please try again.";

            toast.error(message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Welcome back!</h1>

                <p className="auth-subtitle">
                    Login to your SkillSync account
                </p>

                {!otpSent ? (
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register("email", {
                                    required: "Email is required",
                                })}
                            />

                            {errors.email && (
                                <p className="error-message">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>


                        <div className="form-group">
                            <label htmlFor="password">Password</label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register("password", {
                                    required: "Password is required",
                                })}
                            />

                            {errors.password && (
                                <p className="error-message">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>


                        <button
                            type="button"
                            className="forgot-password-link"
                            onClick={handleForgotPassword}
                        >
                            Forgot password?
                        </button>


                        <button type="submit" className="auth-button">
                            Login
                        </button>

                    </form>
                ) : !verified ? (
                    <div className="otp-form">

                        <p className="otp-message">
                            We sent a verification code to your email.
                        </p>

                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>

                            <input
                                id="otp"
                                type="text"
                                placeholder="Enter the OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>

                        <button
                            type="button"
                            className="auth-button"
                            onClick={handleVerifyOtp}
                        >
                            Verify OTP
                        </button>

                    </div>
                ) : (
                    <div className="reset-password-form">

                        <p className="otp-message">
                            Set a new password for your account.
                        </p>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>

                            <input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>

                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="button"
                            className="auth-button"
                            onClick={handleResetPassword}
                        >
                            Reset Password
                        </button>

                    </div>
                )}

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>

            </div>
        </div>
    );
}

export default Login;