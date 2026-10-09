/**
 * Quick sanity check for the User and Character schemas.
 *
 *   npm run validate:schemas             in-memory only, never touches the database
 *   npm run validate:schemas -- --save   also writes a test user + character (visible in Compass)
 *   npm run validate:schemas -- --cleanup  deletes the test user + character
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { MODEL_NAMES } from '../src/schemas/constants/vault.constants';
import { characterSchema } from '../src/schemas/character/character.schema';
import { userSchema } from '../src/schemas/user/user.schema';

const TEST_USERNAME = 'schema-test-user';
const TEST_CHARACTER_NAME = 'Schema Test Character';

const UserModel = mongoose.model(MODEL_NAMES.USER, userSchema);
const CharacterModel = mongoose.model(MODEL_NAMES.CHARACTER, characterSchema);

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

/** Resolves to the validation error, or undefined if the document is valid. */
function validationError(doc: { validate(): Promise<unknown> }) {
  return doc.validate().then(
    () => undefined,
    (err: Error) => err,
  );
}

async function validateInMemory() {
  console.log('--- In-memory validation (no database) ---');

  const user = new UserModel({ username: '  Test-User  ', email: '  Bob@X.com ', passwordHash: 'x' });
  check('valid user passes', !(await validationError(user)));
  check('email is trimmed + lowercased', user.email === 'bob@x.com', `got "${user.email}"`);
  check('username is trimmed + lowercased', user.username === 'test-user', `got "${user.username}"`);
  check('characters defaults to []', user.characters.length === 0);
  check('user without passwordHash fails', !!(await validationError(new UserModel({ username: 'u', email: 'a@b.c' }))));

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
  console.log(`Deleted ${users.deletedCount} test user(s), ${chars.deletedCount} test character(s)`);
  return user;
}

async function save() {
  console.log('--- Saving test documents ---');
  await cleanup(); // keep it idempotent
  await Promise.all([UserModel.init(), CharacterModel.init()]); // build unique/owner indexes

  const user = await UserModel.create({ username: TEST_USERNAME, email: 'schema-test@example.com', passwordHash: 'not-a-real-hash' });
  const character = await buildTestCharacter(user._id).save();
  user.characters.push(character._id);
  await user.save();

  const loaded = await UserModel.findById(user._id).populate('characters');
  const populated = loaded?.characters[0] as unknown as { bio?: { name?: string } } | undefined;
  check('user.characters populates the character', populated?.bio?.name === TEST_CHARACTER_NAME);
  check(
    'passwordHash is hidden by default',
    (await UserModel.findById(user._id).lean())?.passwordHash === undefined,
  );
  console.log(`Saved user ${user._id} and character ${character._id}`);
  console.log('Look for collections "users" and "characters" in Compass. Run with --cleanup when done.');
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
