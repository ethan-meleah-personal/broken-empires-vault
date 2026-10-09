import { InferSchemaType, Schema } from 'mongoose';
import { MELEE_SKILLS, RANGED_SKILLS } from '../constants/vault.constants';

export const weaponSchema = new Schema({
  meleeSkill: { type: String, enum: MELEE_SKILLS },
  rangedSkill: { type: String, enum: RANGED_SKILLS },
  parryMod: { type: Number, default: 0 },
  damage: { type: Number, required: true },
  chooseLocationTarget: { type: Number, required: true },
  circumventShieldTarget: { type: Number, required: true },
  disarmTarget: { type: Number, required: true },
  tripTarget: { type: Number, required: true },
  range: { type: Number, default: null },
  reach: { type: Number, default: null },
  notes: { type: String },
});

weaponSchema.pre('validate', function () {
  if (!this.meleeSkill && !this.rangedSkill) {
    this.invalidate('meleeSkill', 'A weapon needs a melee or ranged skill');
  }

  if (this.meleeSkill && this.reach == null) {
    this.invalidate('reach', 'A melee weapon needs a reach.')
  }

  if (this.rangedSkill && !this.range) {
    this.invalidate('range', 'A ranged weapon needs a range.')
  }
});

export type Weapon = InferSchemaType<typeof weaponSchema>;
