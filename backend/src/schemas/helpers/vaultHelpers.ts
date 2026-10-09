import { Schema } from 'mongoose';
import { DEFAULT_SUPPLY_DIE, SUPPLY_DICE, SupplyDie } from '../constants/vault.constants';

export function supplyDieField(defaultDie: SupplyDie = DEFAULT_SUPPLY_DIE) {
  return {
    type: String,
    enum: SUPPLY_DICE,
    default: defaultDie,
  };
}

export function subdocWithDefault<S extends Schema>(schema: S, initial: () => object = () => ({})) {
  return {
    type: schema,
    default: initial,
  };
}

export function keyedFields<const K extends readonly string[], F>(keys: K, makeField: (key: K[number]) => F): { [P in K[number]]: F } {
  return Object.fromEntries(keys.map((key) => [key, makeField(key)])) as { [P in K[number]]: F };
}
