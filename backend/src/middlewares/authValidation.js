export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  if (name.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Name must be at least 3 characters long" });
  }

  if (name.trim().length > 30) {
    return res
      .status(400)
      .json({ message: "Name cannot exceed 30 characters" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  if (password.length > 128) {
    return res
      .status(400)
      .json({ message: "Password cannot exceed 128 characters" });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address" });
  }

  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { name, email, mobileNumber } = req.body;

  if (name && name.trim().length < 2) {
    return res
      .status(400)
      .json({ message: "Name must be at least 2 characters long" });
  }

  if (name && name.trim().length > 50) {
    return res
      .status(400)
      .json({ message: "Name cannot exceed 50 characters" });
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }
  }

  if (mobileNumber && mobileNumber.trim()) {
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobileNumber.trim())) {
      return res
        .status(400)
        .json({ message: "Please provide a valid 10-digit mobile number" });
    }
  }

  next();
};
