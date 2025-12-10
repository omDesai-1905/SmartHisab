// Cashbook validation middleware
export const validateCashbookEntry = (req, res, next) => {
  const { type, amount, description, date } = req.body;

  // Check if all required fields are present
  if (!type || !amount || !description || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate type field
  if (!["income", "expense"].includes(type)) {
    return res
      .status(400)
      .json({ error: "Type must be either income or expense" });
  }

  // Validate amount field
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res
      .status(400)
      .json({ error: "Amount must be a valid number greater than 0" });
  }

  // Validate description field
  if (typeof description !== "string" || description.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Description must be a non-empty string" });
  }

  // Validate date field
  const entryDate = new Date(date);
  if (isNaN(entryDate.getTime())) {
    return res.status(400).json({ error: "Date must be a valid date" });
  }

  // If all validations pass, continue to next middleware/controller
  next();
};

// Validate cashbook entry ID parameter
export const validateCashbookEntryId = (req, res, next) => {
  const { id } = req.params;

  // Basic ID format validation (for MongoDB ObjectId)
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid entry ID format" });
  }

  next();
};
