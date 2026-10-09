import { HydratedDocument, InferSchemaType, Schema } from 'mongoose';
import {
    ADVENTURING_SKILLS,
    BINDS,
    COMBAT_SKILLS,
    HIT_LOCATIONS,
    HIT_LOCATION_KEYS,
    LORE_SKILLS,
    MODEL_NAMES,
    SOCIAL_SKILLS,
    STRANDS,
} from '../constants/vault.constants'
import { keyedFields, subdocWithDefault, supplyDieField } from '../helpers/vaultHelpers'
import {
  dynamicSkillSchema,
  goalSchema,
  hitLocationSchema,
  inventoryItemSchema,
  noteSchema,
  skillSchema,
  strandSchema,
} from './character.subschemas';

const skillField = () => subdocWithDefault(skillSchema);
const strandField = () => subdocWithDefault(strandSchema);

const hitLocationField = (key: (typeof HIT_LOCATION_KEYS)[number]) => {
  const location = HIT_LOCATIONS.find((loc) => loc.key === key)!;
  return subdocWithDefault(hitLocationSchema, () => ({
    name: location.name,
    hitLocationValue: location.range,
  }));
};

export const characterSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true, index: true },

        bio: {
            name: { type: String, required: true, trim: true },
            race: { type: String, required: true, trim: true },
            sex: { type: String, required: true, trim: true },
            age: { type: Number, min: 0 },
            culture: { type: String, required: true, trim: true },
            previousCareer: { type: String, required: true, trim: true },
            size: { type: String, required: true, trim: true },
        },

        xp: { type: Number, default: 0, min: 0 },

        abilityScores: {
            abilityDescriptors: { type: String, default: '' },
        },

        skills: {
            combatSkills: keyedFields(COMBAT_SKILLS, skillField),
            adventuringSkills: keyedFields(ADVENTURING_SKILLS, skillField),
            socialSkills: keyedFields(SOCIAL_SKILLS, skillField),
            loreSkills: {
                ...keyedFields(LORE_SKILLS, skillField),
                customLore: { type: [dynamicSkillSchema], default: [] },
            },
            languageSkills: { type: [dynamicSkillSchema], default: [] },
        },

        talents: { type: [{ type: Schema.Types.ObjectId, ref: MODEL_NAMES.TALENT }], default: [] },

        magic: {
            bind: keyedFields(BINDS, skillField),
            strand: keyedFields(STRANDS, strandField),
            piety: { type: Number, default: 30 },
            frayPoints: { type: Number, default: 0, min: 0 },
        },

        attributes: {
            maxResolve: { type: Number, default: 10 },
            initiative: { type: Number, default: 10 },
            toughness: { type: Number, default: 0 },
            deathThreshold: { type: Number, default: 20 },
            lethalityLevel: { type: Number, default: 0 },
        },

        hitLocations: keyedFields(HIT_LOCATION_KEYS, hitLocationField),

        roleplay: {
            goals: { type: [goalSchema], default: [] },
            relationships: { name: [{ type: String, default: '' }], notes: [{ type: String, default: '' }], default: [] },
            notes: { type: [noteSchema], default: [] },
        },

        inventory: {
            maxEncumbrance: { type: Number, default: 6 },
            maxWeaponsAtHand: { type: Number, default: 6 },
            gearSupplyDice: supplyDieField(),
            ammoSupplyDice: supplyDieField(),
            rationSupplyDice: supplyDieField(),
            medicalSupplyDice: supplyDieField(),
            coins: { type: Number, default: 0, min: 0 },
            status: { type: Number, default: 0 },
            items: { type: [inventoryItemSchema], default: [] },
        },

    }
)

export type Character = InferSchemaType<typeof characterSchema>;
export type CharacterDocument = HydratedDocument<Character>;
