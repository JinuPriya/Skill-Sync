import { Link,  useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../services/api";
import toast from "react-hot-toast";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
  try {
    const response = await api.post("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
    });

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    toast.success("Account created successfully!");
    navigate("/profile");

  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Registration failed. Please try again.";

    toast.error(message);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Join SkillSync and start learning together
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Name */}

          <div className="form-group">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              {...register("name", {
                required: "Name is required",
              })}
            />

            {errors.name && (
              <p className="error-message">
                {errors.name.message}
              </p>
            )}
          </div>


          {/* Email */}

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


          {/* Password */}

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            {errors.password && (
              <p className="error-message">
                {errors.password.message}
              </p>
            )}
          </div>


          {/* Submit */}

          <button type="submit" className="auth-button">
            Create Account
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;