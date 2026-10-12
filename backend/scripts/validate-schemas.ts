/**
 * Quick sanity check for the User, Character, Talent and Item schemas.
 *
 *   npm run validate:schemas             in-memory only, never touches the database
 *   npm run validate:schemas -- --save   also writes test documents (visible in Compass)
 *   npm run validate:schemas -- --cleanup  deletes the test documents
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { ITEM_CATEGORIES, MODEL_NAMES } from '../src/common/constants/vault.constants';
import { characterSchema } from '../src/characters/schemas/character.schema';
import { armorSchema } from '../src/items/schemas/armor.schema';
import { consumeableSchema } from '../src/items/schemas/consumable.schema';
import { itemSchema } from '../src/items/schemas/item.schema';
import { shieldSchema } from '../src/items/schemas/shield.schema';
import { threadSchema } from '../src/items/schemas/thread.schema';
import { valuableSchema } from '../src/items/schemas/valuable.schema';
import { weaponSchema } from '../src/items/schemas/weapon.schema';
import { talentSchema } from '../src/talents/schemas/talent.schema';
import { userSchema } from '../src/users/schemas/user.schema';

const TEST_USERNAME = 'schema-test-user';
const TEST_CHARACTER_NAME = 'Schema Test Character';
const TEST_TALENT_NAME = 'Schema Test Talent';
const TEST_ADVANCED_TALENT_NAME = 'Schema Test Advanced Talent';
const TEST_ITEM_PREFIX = 'Schema Test ';

const UserModel = mongoose.model(MODEL_NAMES.USER, userSchema);
const CharacterModel = mongoose.model(MODEL_NAMES.CHARACTER, characterSchema);
const TalentModel = mongoose.model(MODEL_NAMES.TALENT, talentSchema);

// Mirrors the discriminator wiring in items.module.ts
const ItemModel = mongoose.model(MODEL_NAMES.ITEM, itemSchema);
const WeaponModel = ItemModel.discriminator(MODEL_NAMES.WEAPON, weaponSchema, ITEM_CATEGORIES.WEAPON);
const ArmorModel = ItemModel.discriminator(MODEL_NAMES.ARMOR, armorSchema, ITEM_CATEGORIES.ARMOR);
const ShieldModel = ItemModel.discriminator(MODEL_NAMES.SHIELD, shieldSchema, ITEM_CATEGORIES.SHIELD);
const ConsumableModel = ItemModel.discriminator(MODEL_NAMES.CONSUMABLE, consumeableSchema, ITEM_CATEGORIES.CONSUMABLE);
const ThreadModel = ItemModel.discriminator(MODEL_NAMES.THREAD, threadSchema, ITEM_CATEGORIES.THREAD);
const ValuableModel = ItemModel.discriminator(MODEL_NAMES.VALUABLE, valuableSchema, ITEM_CATEGORIES.VALUABLE);

let failures = 0;
function check(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && detail ? `\n      ${detail}` : ''}`);
  if (!ok) failures++;
}

function buildTestCharacter(ownerId: mongoose.Types.ObjectId) {
  return new CharacterModel({
    owner: ownerId,
    bio: {
      name: TEST_CHARACTER_NAME,
      race: 'Human',
      sex: 'Female',
      culture: 'Test',
      previousCareer: 'Tester',
      size: 'Medium',
    },
  });
}

function buildTestTalent() {
  return new TalentModel({
    name: TEST_TALENT_NAME,
    description: 'A talent used to sanity-check the talent schema.',
    skillBonus: [{ skillName: 'dodge', bonusValue: 5 }],
  });
}

function buildAdvancedTalent(prerequisiteId: mongoose.Types.ObjectId) {
  return new TalentModel({
    name: TEST_ADVANCED_TALENT_NAME,
    description: 'Requires the basic test talent.',
    prerequisites: [prerequisiteId],
    skillBonus: [{ skillName: 'lightMelee', bonusValue: 10 }],
  });
}

const testSword = () => ({
  name: `${TEST_ITEM_PREFIX}Sword`,
  itemType: 'weapon',
  meleeSkill: 'mediumMelee',
  reach: 2,
  damage: 6,
  chooseLocationTarget: 10,
  circumventShieldTarget: 10,
  disarmTarget: 10,
  tripTarget: 10,
});

const testArmor = () => ({ name: `${TEST_ITEM_PREFIX}Helm`, itemType: 'armor', hitLocation: 'head', armorPoints: 2 });
const testShield = () => ({ name: `${TEST_ITEM_PREFIX}Shield`, itemType: 'shield', armorPoints: 3, shieldBashTarget: 8 });
const testConsumable = () => ({ name: `${TEST_ITEM_PREFIX}Healing Draught`, itemType: 'consumable', itemUses: 3, encumbrance: 1 });
const testThread = () => ({ name: `${TEST_ITEM_PREFIX}Silver Thread`, itemType: 'thread', value: 10 });
const testValuable = () => ({
  name: `${TEST_ITEM_PREFIX}Gemstone`,
  itemType: 'valuable',
  value: 250,
  skillBonus: [{ skillName: 'persuade', bonusValue: 5 }],
});

/** Resolves to the validation error, or undefined if the document is valid. */
function validationError(doc: { validate(): Promise<unknown> }) {
  return doc.validate().then(
    () => undefined,
    (err: Error) => err,
  );
}

async function validateInMemory() {
  console.log('--- In-memory validation (no database) ---');

  const user = new UserModel({ username: '  Test-User  ', email: '  Bob@X.com ', password: 'x' });
  check('valid user passes', !(await validationError(user)));
  check('email is trimmed + lowercased', user.email === 'bob@x.com', `got "${user.email}"`);
  check('username is trimmed + lowercased', user.username === 'test-user', `got "${user.username}"`);
  check('characters defaults to []', user.characters.length === 0);
  check('user without password fails', !!(await validationError(new UserModel({ username: 'u', email: 'a@b.c' }))));

  const character = buildTestCharacter(user._id);
  const error = await validationError(character);
  check('valid character passes', !error, error?.message);
  check('character without owner fails', !!(await validationError(new CharacterModel({ bio: character.bio }))));

  const obj = character.toObject();
  check('combat skills seeded with value 20', obj.skills?.combatSkills?.dodge?.value === 20);
  check('lore skills seeded', obj.skills?.loreSkills?.arcana?.value === 20);
  check('binds seeded', obj.magic?.bind?.change?.value === 20);
  check('strands seeded with value 0', obj.magic?.strand?.fire?.value === 0);
  check('hit locations seeded', obj.hitLocations?.head?.hitLocationValue === '10');
  check('supply dice default to d12', obj.inventory?.gearSupplyDice === 'd12');

  const talentError = await validationError(buildTestTalent());
  check('valid talent passes', !talentError, talentError?.message);
  check('talent without description fails', !!(await validationError(new TalentModel({ name: 'x' }))));

  const weapon = new WeaponModel(testSword());
  const weaponError = await validationError(weapon);
  check('valid weapon passes', !weaponError, weaponError?.message);
  check('weapon gets category "weapon"', weapon.get('category') === ITEM_CATEGORIES.WEAPON);
  check(
    'weapon without a skill fails (pre-validate hook)',
    !!(await validationError(new WeaponModel({ ...testSword(), meleeSkill: undefined }))),
  );
  check(
    'melee weapon without reach fails',
    !!(await validationError(new WeaponModel({ ...testSword(), reach: undefined }))),
  );

  const armorError = await validationError(new ArmorModel(testArmor()));
  check('valid armor passes', !armorError, armorError?.message);
  check('armor without hitLocation fails', !!(await validationError(new ArmorModel({ name: 'x', itemType: 'armor' }))));

  const shield = new ShieldModel(testShield());
  const shieldError = await validationError(shield);
  check('valid shield passes', !shieldError, shieldError?.message);
  check('shield gets category "shield"', shield.get('category') === ITEM_CATEGORIES.SHIELD);

  for (const [label, doc, category] of [
    ['consumable', new ConsumableModel(testConsumable()), ITEM_CATEGORIES.CONSUMABLE],
    ['thread', new ThreadModel(testThread()), ITEM_CATEGORIES.THREAD],
    ['valuable', new ValuableModel(testValuable()), ITEM_CATEGORIES.VALUABLE],
  ] as const) {
    const err = await validationError(doc);
    check(`valid ${label} passes`, !err, err?.message);
    check(`${label} gets category "${category}"`, doc.get('category') === category);
  }
  check('item without a name fails', !!(await validationError(new ValuableModel({ itemType: 'valuable' }))));
  check(
    'advanced talent with a prerequisite passes',
    !(await validationError(buildAdvancedTalent(new mongoose.Types.ObjectId()))),
  );
}

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set (check backend/.env)');
  await mongoose.connect(uri);
  console.log(`Connected to database "${mongoose.connection.name}"`);
}

async function cleanup() {
  const user = await UserModel.findOne({ username: TEST_USERNAME });
  const chars = await CharacterModel.deleteMany({ 'bio.name': TEST_CHARACTER_NAME });
  const users = await UserModel.deleteMany({ username: TEST_USERNAME });
  const talents = await TalentModel.deleteMany({ name: { $in: [TEST_TALENT_NAME, TEST_ADVANCED_TALENT_NAME] } });
  const items = await ItemModel.deleteMany({ name: { $regex: `^${TEST_ITEM_PREFIX}` } });
  console.log(
    `Deleted ${users.deletedCount} test user(s), ${chars.deletedCount} test character(s), ` +
      `${talents.deletedCount} test talent(s), ${items.deletedCount} test item(s)`,
  );
  return user;
}

async function save() {
  console.log('--- Saving test documents ---');
  await cleanup(); // keep it idempotent
  await Promise.all([UserModel.init(), CharacterModel.init(), TalentModel.init(), ItemModel.init()]); // build unique/owner indexes

  const talent = await buildTestTalent().save();
  const advancedTalent = await buildAdvancedTalent(talent._id).save();
  const [sword, helm, shield, draught, thread, gem] = await Promise.all([
    new WeaponModel(testSword()).save(),
    new ArmorModel(testArmor()).save(),
    new ShieldModel(testShield()).save(),
    new ConsumableModel(testConsumable()).save(),
    new ThreadModel(testThread()).save(),
    new ValuableModel(testValuable()).save(),
  ]);

  const user = await UserModel.create({ username: TEST_USERNAME, email: 'schema-test@example.com', password: 'not-a-real-hash' });
  const character = buildTestCharacter(user._id);
  character.talents.push(talent._id, advancedTalent._id);
  character.inventory!.items.push(
    { itemId: sword._id, quantity: 1, isEquipped: true, customName: 'Old Faithful' },
    { itemId: helm._id, quantity: 1, isEquipped: true },
    { itemId: shield._id, quantity: 1, isEquipped: false },
    { itemId: draught._id, quantity: 2, notes: 'Found in a ruin' },
    { itemId: thread._id, quantity: 1 },
    { itemId: gem._id, quantity: 4 },
  );
  await character.save();
  user.characters.push(character._id);
  await user.save();

  const loaded = await UserModel.findById(user._id).populate('characters');
  const populated = loaded?.characters[0] as unknown as { bio?: { name?: string } } | undefined;
  check('user.characters populates the character', populated?.bio?.name === TEST_CHARACTER_NAME);
  check(
    'password is hidden by default',
    (await UserModel.findById(user._id).lean())?.password === undefined,
  );

  const loadedCharacter = await CharacterModel.findById(character._id)
    .populate('talents')
    .populate('inventory.items.itemId');
  const populatedTalents = (loadedCharacter?.talents ?? []) as unknown as { name?: string }[];
  check(
    'character.talents populates both talents',
    populatedTalents.map((t) => t.name).sort().join() === [TEST_ADVANCED_TALENT_NAME, TEST_TALENT_NAME].sort().join(),
  );

  const advanced = await TalentModel.findOne({ name: TEST_ADVANCED_TALENT_NAME }).populate('prerequisites');
  const prerequisite = advanced?.prerequisites[0] as unknown as { name?: string } | undefined;
  check('talent.prerequisites populates the prerequisite talent', prerequisite?.name === TEST_TALENT_NAME);

  const inventory = (loadedCharacter?.inventory?.items ?? []) as unknown as {
    itemId?: { name?: string; category?: string };
  }[];
  check('character inventory holds 6 items', inventory.length === 6, `got ${inventory.length}`);
  check(
    'inventory itemIds populate to the right item subtype',
    inventory.map((i) => i.itemId?.category).join() ===
      [
        ITEM_CATEGORIES.WEAPON,
        ITEM_CATEGORIES.ARMOR,
        ITEM_CATEGORIES.SHIELD,
        ITEM_CATEGORIES.CONSUMABLE,
        ITEM_CATEGORIES.THREAD,
        ITEM_CATEGORIES.VALUABLE,
      ].join(),
    inventory.map((i) => i.itemId?.category).join(),
  );

  const stored = await ItemModel.find({ name: { $regex: `^${TEST_ITEM_PREFIX}` } }).lean();
  const categories = stored.map((i) => (i as Record<string, unknown>).category as string).sort();
  check(
    'all items share one collection with correct categories',
    categories.join() === Object.values(ITEM_CATEGORIES).sort().join(),
    `got ${categories.join()}`,
  );
  check('WeaponModel.find only returns weapons', (await WeaponModel.find({ name: { $regex: `^${TEST_ITEM_PREFIX}` } })).length === 1);

  console.log(`Saved user ${user._id}, character ${character._id}, 2 talents, 6 items`);
  console.log('Look for collections "users", "characters", "talents" and "items" in Compass. Run with --cleanup when done.');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--cleanup')) {
    await connect();
    await cleanup();
  } else {
    await validateInMemory();
    if (args.includes('--save')) {
      await connect();
      await save();
    }
  }
  await mongoose.disconnect();
  console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed');
  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
