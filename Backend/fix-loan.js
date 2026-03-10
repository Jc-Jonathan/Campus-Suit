const mongoose = require('mongoose');
const LoanApply = require('./models/LoanApply');

async function fixExistingLoan() {
  try {
    // Find the loan that needs fixing (you might need to adjust the query)
    const loan = await LoanApply.findOne({ 
      status: 'approved', 
      repaymentPeriod: '1 month',
      loanStartAt: { $exists: false }
    });
    
    if (!loan) {
      console.log('No loan found that needs fixing');
      return;
    }
    
    console.log('Found loan to fix:', loan._id);
    console.log('Current updatedAt:', loan.updatedAt);
    
    // Set loanStartAt to updatedAt (when it was approved)
    // Set loanEndAt to 1 month from loanStartAt
    const now = new Date(loan.updatedAt);
    const durationMs = 30 * 86400000; // 1 month
    
    loan.loanStartAt = now;
    loan.loanEndAt = new Date(now.getTime() + durationMs);
    
    await loan.save();
    
    console.log('Loan fixed successfully!');
    console.log('loanStartAt:', loan.loanStartAt);
    console.log('loanEndAt:', loan.loanEndAt);
    
  } catch (error) {
    console.error('Error fixing loan:', error);
  } finally {
    process.exit(0);
  }
}

// Connect to DB and fix the loan
mongoose.connect('mongodb://localhost:27017/campus-support-suit')
  .then(() => {
    console.log('Connected to MongoDB');
    fixExistingLoan();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
