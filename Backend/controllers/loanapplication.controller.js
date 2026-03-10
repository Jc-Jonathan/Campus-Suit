const LoanApply = require('../models/LoanApply');
const { calculateLoanState } = require('../services/loancalculation.service');

/**
 * GET loan with LIVE calculation (user & admin)
 */
exports.getLoanWithCalculation = async (req, res) => {
  try {
    const loan = await LoanApply.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    const calculation = calculateLoanState(loan);

    res.json({
      success: true,
      loan,
      calculation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate loan',
      error: error.message
    });
  }
};

/**
 * ADMIN: Approve loan (THIS STARTS TIME)
 */
exports.approveLoan = async (req, res) => {
  try {
    const loan = await LoanApply.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Loan already approved'
      });
    }

    const now = new Date();

    // ⏱️ Parse repayment period for end date
    const [value, unit] = loan.repaymentPeriod.toLowerCase().split(' ');
    const v = parseInt(value, 10) || 1;

    let durationMs;
    if (unit.includes('day')) durationMs = v * 86400000;
    else if (unit.includes('week')) durationMs = v * 7 * 86400000;
    else if (unit.includes('month')) durationMs = v * 30 * 86400000;
    else durationMs = v * 7 * 86400000;

    loan.status = 'approved';
    loan.loanStartAt = now;
    loan.loanEndAt = new Date(now.getTime() + durationMs);

    await loan.save();

    res.json({
      success: true,
      message: 'Loan approved and started',
      loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Approval failed',
      error: error.message
    });
  }
};