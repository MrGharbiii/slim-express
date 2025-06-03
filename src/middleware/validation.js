const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name should contain only letters and spaces'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),

  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

// Signup validation (for /api/auth/signup)
const validateSignup = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email address is too long'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    ),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),

  handleValidationErrors,
];

// Signin validation (for /api/auth/signin)
const validateSignin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),

  handleValidationErrors,
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name should contain only letters and spaces'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Please select a valid gender option'),

  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),

  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('activityLevel')
    .optional()
    .isIn([
      'sedentary',
      'lightly-active',
      'lightly_active',
      'moderately-active',
      'moderately_active',
      'very-active',
      'very_active',
      'extra-active',
      'extra_active',
    ])
    .withMessage('Please select a valid activity level')
    .customSanitizer((value) => {
      // Normalize to hyphenated format for consistency
      if (value) {
        return value.replace(/_/g, '-');
      }
      return value;
    }),

  body('goals')
    .optional()
    .isArray()
    .withMessage('Goals must be an array')
    .custom((goals) => {
      const validGoals = [
        'weight-loss',
        'weight-gain',
        'muscle-gain',
        'maintain-weight',
        'improve-fitness',
        'improve-strength',
      ];
      if (goals.some((goal) => !validGoals.includes(goal))) {
        throw new Error('One or more goals are invalid');
      }
      return true;
    }),

  handleValidationErrors,
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match new password');
    }
    return true;
  }),

  handleValidationErrors,
];

// Email validation
const validateEmail = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  handleValidationErrors,
];

// Password reset validation
const validatePasswordReset = [
  body('token').notEmpty().withMessage('Reset token is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match new password');
    }
    return true;
  }),
  handleValidationErrors,
];

// Basic Info validation for onboarding
const validateBasicInfo = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name contains invalid characters'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      if (value && new Date(value) >= new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      const age = Math.floor(
        (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000)
      );
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),

  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),

  body('heightUnit')
    .optional()
    .isIn(['cm', 'ft'])
    .withMessage('Height unit must be cm or ft'),

  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('weightUnit')
    .optional()
    .isIn(['kg', 'lbs'])
    .withMessage('Weight unit must be kg or lbs'),
  body('activityLevel')
    .optional()
    .isIn([
      'sedentary',
      'lightly-active',
      'lightly_active',
      'moderately-active',
      'moderately_active',
      'very-active',
      'very_active',
      'extra-active',
      'extra_active',
    ])
    .withMessage('Please select a valid activity level'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name is too long'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'Homme', 'Femme', 'Other'])
    .withMessage('Invalid gender selection'),

  body('profession')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Profession is too long'),

  body('waistCircumference')
    .optional()
    .isFloat({ min: 20, max: 200 })
    .withMessage('Waist circumference must be between 20 and 200'),

  body('hipCircumference')
    .optional()
    .isFloat({ min: 20, max: 200 })
    .withMessage('Hip circumference must be between 20 and 200'),

  body('smoking')
    .optional()
    .isIn(['smoker', 'non_smoker', 'occasional_smoker'])
    .withMessage('Invalid smoking status'),

  body('alcohol')
    .optional()
    .isIn(['no_alcohol', 'occasional', 'regular', 'heavy'])
    .withMessage('Invalid alcohol consumption level'),

  handleValidationErrors,
];

// Lifestyle validation for onboarding
const validateLifestyle = [
  body('wakeUpTime')
    .optional()
    .custom((value) => {
      // Accept both 24-hour format (HH:MM) and 12-hour format (HH:MM AM/PM)
      const time24Hour = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const time12Hour = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i;

      if (!time24Hour.test(value) && !time12Hour.test(value)) {
        throw new Error(
          'Wake up time must be in HH:MM format or HH:MM AM/PM format'
        );
      }
      return true;
    }),

  body('sleepTime')
    .optional()
    .custom((value) => {
      // Accept both 24-hour format (HH:MM) and 12-hour format (HH:MM AM/PM)
      const time24Hour = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const time12Hour = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM|am|pm)$/i;

      if (!time24Hour.test(value) && !time12Hour.test(value)) {
        throw new Error(
          'Sleep time must be in HH:MM format or HH:MM AM/PM format'
        );
      }
      return true;
    }),

  body('workSchedule')
    .optional()
    .isIn(['office', 'remote', 'hybrid', 'shift', 'flexible'])
    .withMessage('Invalid work schedule type'),

  body('exerciseFrequency')
    .optional()
    .isIn(['0', '1-2', '3-4', '5-6', '7+'])
    .withMessage('Invalid exercise frequency'),

  body('exerciseTime')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Invalid exercise time preference'),

  body('favoriteActivities')
    .optional()
    .isArray()
    .withMessage('Favorite activities must be an array'),

  body('favoriteActivities.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each activity must be between 2 and 50 characters'),

  body('stressLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress level must be between 1 and 10'),

  body('sleepHours')
    .optional()
    .isFloat({ min: 3, max: 12 })
    .withMessage('Sleep hours must be between 3 and 12'),

  body('sleepQuality')
    .optional()
    .isIn(['poor', 'fair', 'good', 'excellent'])
    .withMessage('Invalid sleep quality rating'),

  handleValidationErrors,
];

// Medical History validation for onboarding
const validateMedicalHistory = [
  body('gender')
    .optional()
    .isIn(['Homme', 'Femme', 'Other'])
    .withMessage('Invalid gender selection'),

  body('chronicConditions')
    .optional()
    .isArray()
    .withMessage('Chronic conditions must be an array'),

  body('chronicConditions.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each condition description is too long'),

  body('medications')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Medications description is too long'),

  body('allergies')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Allergies description is too long'),

  body('physicalLimitations')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Physical limitations description is too long'),

  body('avoidAreas')
    .optional()
    .isArray()
    .withMessage('Avoid areas must be an array'),

  body('personalMedicalHistory.diabetes')
    .optional()
    .isIn(['yes', 'no', 'unknown'])
    .withMessage('Invalid diabetes status'),

  body('personalMedicalHistory.obesity')
    .optional()
    .isIn(['yes', 'no', 'unknown'])
    .withMessage('Invalid obesity status'),

  body('personalMedicalHistory.hypothyroidism')
    .optional()
    .isIn(['yes', 'no', 'unknown'])
    .withMessage('Invalid hypothyroidism status'),

  body('familyHistory.heartDisease')
    .optional()
    .isIn(['yes', 'no', 'unknown'])
    .withMessage('Invalid family heart disease history'),

  body('familyHistory.diabetes')
    .optional()
    .isIn(['yes', 'no', 'unknown'])
    .withMessage('Invalid family diabetes history'),

  handleValidationErrors,
];

// Goals validation for onboarding
const validateGoals = [
  body('primaryGoal')
    .optional()
    .isIn([
      'weightLoss', // Perte de Poids
      'muscleGain', // Prise de Muscle
      'endurance', // Endurance
      'generalHealth', // Santé Générale
      'strength', // Force
      // Keep old values for backward compatibility
      'weight-loss',
      'weight-gain',
      'muscle-gain',
      'maintain-weight',
      'flexibility',
    ])
    .withMessage('Invalid primary goal'),

  body('secondaryGoals')
    .optional()
    .isArray()
    .withMessage('Secondary goals must be an array'),

  body('secondaryGoals.*')
    .optional()
    .isIn([
      'betterSleep', // Meilleur Sommeil
      'stressReduction', // Réduction du Stress
      'flexibility', // Flexibilité
      'balance', // Équilibre
      'energyBoost', // Boost d'Énergie
    ])
    .withMessage('Invalid secondary goal'),

  body('targetTimeline')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Target timeline must be between 1 and 60 months'),

  body('currentWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Current weight must be between 20 and 500 kg'),

  body('targetWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Target weight must be between 20 and 500 kg'),

  body('weeklyGoal')
    .optional()
    .isFloat({ min: 0.1, max: 5 })
    .withMessage('Weekly goal must be between 0.1 and 5 kg'),

  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateSignup,
  validateSignin,
  validateProfileUpdate,
  validatePasswordChange,
  validateEmail,
  validatePasswordReset,
  validateBasicInfo,
  validateLifestyle,
  validateMedicalHistory,
  validateGoals,
  handleValidationErrors,
};
