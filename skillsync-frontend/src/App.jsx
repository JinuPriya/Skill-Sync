import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import FindMatch from "./pages/FindMatch";
import ViewProfile from "./pages/ViewProfile";
import MySwaps from "./pages/MySwaps";
import Chat from "./pages/Chat";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCertificates from "./pages/AdminCertificates";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/find-match" element={<FindMatch />} />
        <Route path="/profile/:id" element={<ViewProfile />} />
        <Route path="/swaps" element={<MySwaps />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:chatId" element={<Chat />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/certificates" element={<AdminRoute><AdminCertificates /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;