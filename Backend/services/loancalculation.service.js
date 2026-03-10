function parseRepaymentPeriod(period) {
  if (!period || typeof period !== 'string') {
    return { value: 1, unit: 'week' };
  }

  const [value, unit] = period.toLowerCase().trim().split(' ');
  return {
    value: parseInt(value, 10) || 1,
    unit
  };
}

function unitToMs(unit) {
  if (unit.includes('minute')) return 60 * 1000;
  if (unit.includes('hour')) return 60 * 60 * 1000;
  if (unit.includes('day')) return 24 * 60 * 60 * 1000;
  if (unit.includes('week')) return 7 * 24 * 60 * 60 * 1000;
  if (unit.includes('month')) return 30 * 24 * 60 * 60 * 1000;
  if (unit.includes('year')) return 365 * 24 * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
}

function calculateLoanState(loan) {
  if (!loan) throw new Error('Loan data is required');

  if (loan.status !== 'approved') {
    return {
      isApproved: false,
      timeRemaining: 'Not approved',
      isCompleted: false
    };
  }

  const now = new Date();

  // 🔒 START TIME (SOURCE OF TRUTH)
  const startTime = new Date(loan.loanStartAt);

  // 🔹 Repayment period
  const { value, unit } = parseRepaymentPeriod(loan.repaymentPeriod);
  const durationMs = value * unitToMs(unit);

  // 🔒 END TIME (ALWAYS BASED ON REPAYMENT PERIOD)
  const endTime = loan.loanEndAt
    ? new Date(loan.loanEndAt)
    : new Date(startTime.getTime() + durationMs);

  const remainingMs = Math.max(0, endTime.getTime() - now.getTime());
  const isCompleted = remainingMs === 0;

  // 🔹 TIME DISPLAY (RESPECTS PERIOD)
  let timeRemaining = 'Completed';

  if (!isCompleted) {
    if (unit.includes('minute')) {
      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      timeRemaining = `${minutes}m ${seconds}s`;

    } else {
      const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

      timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }

  return {
    isApproved: true,
    isCompleted,
    timeRemaining,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    repaymentPeriod: loan.repaymentPeriod
  };
}

module.exports = {
  calculateLoanState
};