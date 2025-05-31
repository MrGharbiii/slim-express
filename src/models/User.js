const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
    profilePicture: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value < new Date();
        },
        message: 'Date of birth cannot be in the future',
      },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say',
    },
    height: {
      type: Number, // in centimeters
      min: [50, 'Height must be at least 50 cm'],
      max: [300, 'Height cannot exceed 300 cm'],
    },
    weight: {
      type: Number, // in kilograms
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },
    activityLevel: {
      type: String,
      enum: [
        'sedentary',
        'lightly-active',
        'moderately-active',
        'very-active',
        'extra-active',
      ],
      default: 'moderately-active',
    },
    goals: [
      {
        type: String,
        enum: [
          'weight-loss',
          'weight-gain',
          'muscle-gain',
          'maintain-weight',
          'improve-fitness',
          'improve-strength',
        ],
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 604800, // 7 days in seconds
        },
      },
    ],
    lastLoginAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ 'refreshTokens.token': 1 }); // For token validation
userSchema.index(
  { 'refreshTokens.createdAt': 1 },
  { expireAfterSeconds: 604800 }
); // TTL index for refresh tokens

// Compound indexes for complex queries
userSchema.index({ email: 1, isEmailVerified: 1 });
userSchema.index({ activityLevel: 1, goals: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Additional validation middleware
userSchema.pre('save', function (next) {
  // Ensure email is always lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }

  // Update the updatedAt timestamp
  this.updatedAt = new Date();

  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Get user's BMI
userSchema.methods.getBMI = function () {
  if (!this.weight || !this.height) return null;
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Get user's age
userSchema.methods.getAge = function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Transform output (remove sensitive data)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.__v;
  return userObject;
};

// Additional instance methods
userSchema.methods.getFullProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    profilePicture: this.profilePicture,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    height: this.height,
    weight: this.weight,
    activityLevel: this.activityLevel,
    goals: this.goals,
    isEmailVerified: this.isEmailVerified,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    bmi: this.getBMI(),
    age: this.getAge(),
  };
};

userSchema.methods.isValidRefreshToken = function (token) {
  return this.refreshTokens.some(
    (tokenObj) =>
      tokenObj.token === token &&
      new Date() < new Date(tokenObj.createdAt.getTime() + 604800000) // 7 days
  );
};

userSchema.methods.cleanExpiredTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(
    (tokenObj) => new Date(tokenObj.createdAt.getTime() + 604800000) > now
  );
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Additional static methods
userSchema.statics.findActiveUsers = function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    lastLoginAt: { $gte: cutoffDate },
  }).select('-password -refreshTokens');
};

userSchema.statics.findByGoal = function (goal) {
  return this.find({
    goals: goal,
    isEmailVerified: true,
  }).select('-password -refreshTokens');
};

userSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: {
          $sum: { $cond: ['$isEmailVerified', 1, 0] },
        },
        averageAge: {
          $avg: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000,
              ],
            },
          },
        },
      },
    },
  ]);

  return stats[0] || { totalUsers: 0, verifiedUsers: 0, averageAge: 0 };
};

module.exports = mongoose.model('User', userSchema);
