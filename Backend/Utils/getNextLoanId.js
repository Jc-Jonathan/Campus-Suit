const Loan = require('../models/Loan');

const getNextLoanId = async () => {
  const loans = await Loan.find({}, { loanId: 1 }).sort({ loanId: 1 });

  let expectedId = 1;

  for (const loan of loans) {
    if (loan.loanId !== expectedId) {
      return expectedId;
    }
    expectedId++;
  }

  return expectedId;
};

module.exports = getNextLoanId;
