export const validateTransactionCreation = (req, res, next) => {
  const { type, amount, description } = req.body;

  if (!type || !amount) {
    return res.status(400).json({ message: "Type and amount are required" });
  }

  if (type !== "debit" && type !== "credit") {
    return res
      .status(400)
      .json({ message: "Type must be either debit or credit" });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  if (isNaN(parseFloat(amount))) {
    return res.status(400).json({ message: "Amount must be a valid number" });
  }

  if (description && description.trim().length > 500) {
    return res
      .status(400)
      .json({ message: "Description cannot exceed 500 characters" });
  }

  next();
};

export const validateTransactionUpdate = (req, res, next) => {
  const { type, amount, description } = req.body;

  if (type && type !== "debit" && type !== "credit") {
    return res
      .status(400)
      .json({ message: "Type must be either debit or credit" });
  }

  if (amount && amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  if (amount && isNaN(parseFloat(amount))) {
    return res.status(400).json({ message: "Amount must be a valid number" });
  }

  if (description && description.trim().length > 500) {
    return res
      .status(400)
      .json({ message: "Description cannot exceed 500 characters" });
  }

  next();
};
