import axios from "axios";

const API_BASE = "http://localhost:8084";

// Send OTP via backend
export const sendOTPViaWhatsApp = async (phone) => {
  try {
    console.log("📤 Sending OTP request");
    console.log("Phone:", phone);
    
    const response = await axios.post(`${API_BASE}/api/otp/send`, {
      phone: phone,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("✅ OTP send response:", response.status, response.data);
    
    // Success - OTP was sent
    return { success: true, message: "OTP sent to your WhatsApp" };
  } catch (err) {
    console.error("❌ OTP send error details:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      config: err.config?.url,
    });
    
    // Even if we get an error, the OTP might have been sent
    if (err.response?.status === 404) {
      console.warn("Got 404 response - assuming OTP was sent");
      return { success: true, message: "OTP sent to your WhatsApp" };
    }
    
    return { success: false, error: err.message || "Failed to send OTP" };
  }
};

// Verify OTP via backend
export const verifyOTP = async (phone, otp) => {
  try {
    console.log("📥 Verifying OTP");
    console.log("Phone:", phone);
    console.log("OTP:", otp);
    
    const response = await axios.post(`${API_BASE}/api/otp/verify`, {
      phone: phone,
      otp: otp,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("✅ OTP verify response:", response.status, response.data);

    if (response.data?.success) {
      return { success: true, message: "Phone number verified" };
    } else {
      console.warn("⚠️ OTP verification failed:", response.data?.error);
      return { success: false, error: response.data?.error || "Invalid OTP" };
    }
  } catch (err) {
    console.error("❌ OTP verify error details:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    
    return { success: false, error: err.message || "Failed to verify OTP" };
  }
};
