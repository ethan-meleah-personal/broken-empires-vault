import { Schema } from "mongoose";
import { DEFAULT_SKILL_VALUE } from "../constants/vault.constants";
import { MODEL_NAMES } from "../constants/vault.constants";

/* ========= SKILL SUBSCHEMAS ========= */

const skillFields = {
    value: { type: Number, default: DEFAULT_SKILL_VALUE, min: 0, required: true },
    expertRanks: { type: Number, default: 0, min: 0, max: 4,  required: true},
    isSavvy: { type: Boolean, default: false }
};

export const skillSchema = new Schema({ ...skillFields }, { _id: false });

export const dynamicSkillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    ...skillFields,
  },
  { _id: false }
);

/* ========= MAGIC SUBSCHEMAS ========= */

export const strandSchema = new Schema(
  {
    value: { type: Number, required: true, default: 0 },
    isThin: { type: Boolean, default: false }
  },
  { _id: false }
);

/* ========= WOUNDS SUBSCHEMAS ========= */

export const woundSchema = new Schema(
    {
        name: { type: String, required: true },
        woundPoints: { type: Number, required: true, min: 0 },
        isNonlethal: { type: Boolean, default: false },
        isInfected: { type: Boolean, default: false },
        isSeptic: { type: Boolean, default: false },
        recoveryBonus: { type: Number, default: 0 },
    }
);

export const hitLocationSchema = new Schema(
  {
    name: { type: String, required: true },
    hitLocationValue: { type: String, required: true },
    impaired: { type: Boolean, default: false },
    wounds: { type: [woundSchema], default: [] },
  },
  { _id: false },
);

/* ========= ROLEPLAY SUBSCHEMAS ========= */

export const goalSchema = new Schema({
  goalText: { type: String, required: true },
  isShared: { type: Boolean, default: true },
});

export const noteSchema = new Schema({
  noteName: { type: String, required: true },
  noteText: { type: String, required: true },
});

/* ========= INVENTORY SUBSCHEMAS ========= */

export const inventoryItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.ITEM, required: true },
  quantity: { type: Number, default: 1, min: 0 },
  isEquipped: { type: Boolean, default: false },
  customName: { type: String },
  notes: { type: String },
});
