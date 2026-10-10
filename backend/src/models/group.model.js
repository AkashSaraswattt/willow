const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String,
      default: null
    },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      length: 8
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    memberCount: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

groupSchema.index({ joinCode: 1 });
groupSchema.index({ ownerId: 1 });

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;