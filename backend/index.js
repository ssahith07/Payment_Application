
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountNumber: { type: String, default: () => Math.floor(100000000 + Math.random() * 900000000).toString() },
  balance: { type: Number, default: 1000 }, // Start with $1000 for demo
  avatar: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  note: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  type: { type: String, enum: ['debit', 'credit'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Please authenticate' });
  }
};

// Routes
// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    // Remove sensitive data
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      accountNumber: req.user.accountNumber,
      balance: req.user.balance,
      avatar: req.user.avatar
    };
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for contacts)
app.get('/api/users', auth, async (req, res) => {
  try {
    // Find all users except current user
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('_id name email accountNumber avatar');
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer money - UPDATED to use MongoDB transactions
app.post('/api/transfer', auth, async (req, res) => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { recipientId, amount, note } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Get sender (current user) within the transaction session
    const sender = await User.findById(req.user._id).session(session);
    
    // Check if sender has enough balance
    if (sender.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Find recipient within the transaction session
    const recipient = await User.findById(recipientId).session(session);
    if (!recipient) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Update balances
    sender.balance -= parseFloat(amount);
    recipient.balance += parseFloat(amount);
    
    // Save both users within the transaction
    await sender.save({ session });
    await recipient.save({ session });
    
    // Create single transaction record with type
    const transaction = new Transaction({
      sender: sender._id,
      recipient: recipient._id,
      amount,
      note,
      type: 'debit', // From sender's perspective
      status: 'completed'
    });
    
    // Save transaction within the session
    await transaction.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    res.json({ 
      message: 'Transfer successful',
      transaction: {
        id: transaction._id,
        amount,
        recipient: recipient.name,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error during transfer' });
  }
});

// Get user transactions - UPDATED to provide proper transaction data for UI
app.get('/api/transactions', auth, async (req, res) => {
  try {
    // Find all transactions where user is sender or recipient
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
      .populate('sender', 'name email accountNumber')
      .populate('recipient', 'name email accountNumber')
      .sort({ createdAt: -1 });
    
    // Transform transactions to include display type based on the user's perspective
    const transformedTransactions = transactions.map(transaction => {
      // Convert to plain JavaScript object
      const trans = transaction.toObject();
      
      // Determine if this is a debit or credit from the user's perspective
      if (transaction.sender._id.toString() === req.user._id.toString()) {
        // Money going out - this is a debit from user's perspective
        trans.displayType = 'debit';
        trans.otherParty = transaction.recipient;
      } else {
        // Money coming in - this is a credit from user's perspective
        trans.displayType = 'credit';
        trans.otherParty = transaction.sender;
      }
      
      return trans;
    });
    
    res.json(transformedTransactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user balance
app.get('/api/balance', auth, async (req, res) => {
  try {
    // Find pending transactions
    const pendingTransactions = await Transaction.find({
      recipient: req.user._id,
      status: 'pending'
    });
    
    // Calculate pending balance
    const pendingBalance = pendingTransactions.reduce((total, transaction) => {
      return total + transaction.amount;
    }, 0);
    
    res.json({
      available: req.user.balance,
      pending: pendingBalance
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
