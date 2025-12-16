export const validateSupplierCreation = (req, res, next) => {
  const { name, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Supplier name is required" });
  }

  if (name.trim().length < 2) {
    return res
      .status(400)
      .json({ message: "Supplier name must be at least 2 characters" });
  }

  if (!phone || !phone.trim()) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
    return res.status(400).json({ message: "Phone number must be 10 digits" });
  }

  next();
};

export const validateSupplierUpdate = (req, res, next) => {
  const { name, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Supplier name is required" });
  }

  if (name.trim().length < 2) {
    return res
      .status(400)
      .json({ message: "Supplier name must be at least 2 characters" });
  }

  if (!phone || !phone.trim()) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
    return res.status(400).json({ message: "Phone number must be 10 digits" });
  }

  next();
};

export const validateSupplierTransactionCreation = (req, res, next) => {
  const { type, amount, description } = req.body;

  if (!type || !["debit", "credit"].includes(type)) {
    return res
      .status(400)
      .json({ message: 'Transaction type must be "debit" or "credit"' });
  }

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }

  if (description && description.length > 500) {
    return res
      .status(400)
      .json({ message: "Description must not exceed 500 characters" });
  }

  next();
};

export const validateSupplierTransactionUpdate = (req, res, next) => {
  const { type, amount, description } = req.body;

  if (!type || !["debit", "credit"].includes(type)) {
    return res
      .status(400)
      .json({ message: 'Transaction type must be "debit" or "credit"' });
  }

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }

  if (description && description.length > 500) {
    return res
      .status(400)
      .json({ message: "Description must not exceed 500 characters" });
  }

  next();
};
