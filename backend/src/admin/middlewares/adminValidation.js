// Admin login validation
export const validateAdminLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  next();
};

// Message validation
export const validateMessage = (req, res, next) => {
  const { emailAddress, topic, description } = req.body;

  if (!emailAddress || !topic || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailAddress)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate topic length
  if (topic.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Topic must be at least 3 characters" });
  }

  // Validate description length
  if (description.trim().length < 10) {
    return res
      .status(400)
      .json({ message: "Description must be at least 10 characters" });
  }

  next();
};
