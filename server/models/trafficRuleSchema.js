const mongoose = require("mongoose");

const TrafficRuleSchema = new mongoose.Schema(
  {
    ruleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    stateCode: {
      type: String,
      required: true,
      uppercase: true,
    },

    stateName: {
      type: String,
      required: true,
    },

    ruleTitle: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
    },

    detailedDescription: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
      required: true,
    },

    vehicleTypes: [
      {
        type: String,
      },
    ],

    applicableRoadTypes: [
      {
        type: String,
      },
    ],

    severityLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },

    ruleStatus: {
      type: String,
      enum: ["Active", "Inactive", "Draft"],
      default: "Active",
    },

    effectiveFrom: {
      type: Date,
      required: true,
    },

    effectiveTill: {
      type: Date,
      default: null,
    },

    version: {
      type: Number,
      default: 1,
    },

    parentRuleId: {
      type: String,
      default: null,
    },

    legalReference: LegalReferenceSchema,

    penalties: PenaltySchema,

    enforcementAuthority: [
      {
        type: String,
      },
    ],

    exemptionCategories: [
      {
        type: String,
      },
    ],

    complianceRequirements: [
      {
        type: String,
      },
    ],

    citizenActions: [
      {
        type: String,
      },
    ],

    violationDetectionMethods: [
      {
        type: String,
      },
    ],

    languages: {
      english: LanguageSchema,
      hindi: LanguageSchema,
    },

    sourceDocuments: [SourceDocumentSchema],

    createdBy: {
      type: String,
      required: true,
    },

    approvedBy: {
      type: String,
    },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    lastReviewedDate: Date,

    nextReviewDate: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TrafficRule", TrafficRuleSchema);