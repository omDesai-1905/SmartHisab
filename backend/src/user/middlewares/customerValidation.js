export const validateCustomerCreation = (req, res, next) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  if (name.trim().length < 2) {
    return res
      .status(400)
      .json({ message: "Name must be at least 2 characters long" });
  }

  if (phone.trim().length < 10) {
    return res
      .status(400)
      .json({ message: "Phone number must be at least 10 digits" });
  }

  next();
};

export const validateCustomerUpdate = (req, res, next) => {
  const { name, phone } = req.body;

  if (name && name.trim().length < 2) {
    return res
      .status(400)
      .json({ message: "Name must be at least 2 characters long" });
  }

  if (phone && phone.trim().length < 10) {
    return res
      .status(400)
      .json({ message: "Phone number must be at least 10 digits" });
  }

  next();
};
