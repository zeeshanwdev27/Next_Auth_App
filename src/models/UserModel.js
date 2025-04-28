import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // required: function() { return this.provider === "credentials"; },  // Only required for credentials
      // minlength: [8, 'Password should be at least 8 characters'],  // Add password validation
    },
    isVerified: {
      type: Boolean,
      default: false,  // Set to true for Google users during signup
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],  // Only allow 'credentials' or 'google' providers
      default: 'credentials',          // Default to 'credentials'
    }
  },
  { timestamps: true }
);

// Avoid model overwrite issues during hot reload
export default mongoose.models.User || mongoose.model('User', UserSchema);
