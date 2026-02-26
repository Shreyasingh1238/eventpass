const AdminAccount = require('../models/AdminAccount');
const VolunteerAccount = require('../models/VolunteerAccount');
const AppUserAccount = require('../models/AppUserAccount');

const roleModelMap = {
  admin: AdminAccount,
  volunteer: VolunteerAccount,
  user: AppUserAccount
};

const sanitizeForRoleCollection = (user) => ({
  userId: user._id,
  name: user.name,
  email: user.email,
  password: user.password,
  role: user.role,
  age: user.age,
  gender: user.gender,
  volunteerStatus: user.volunteerStatus
});

const clearOtherRoleCollections = async (role, userId, email) => {
  const models = Object.entries(roleModelMap)
    .filter(([key]) => key !== role)
    .map(([, model]) => model);

  await Promise.all(models.map((model) => model.deleteMany({ $or: [{ userId }, { email }] })));
};

const upsertRoleAccount = async (user) => {
  const model = roleModelMap[user.role];
  if (!model) return;

  const payload = sanitizeForRoleCollection(user);
  await clearOtherRoleCollections(user.role, user._id, user.email);
  await model.updateOne({ userId: user._id }, { $set: payload }, { upsert: true });
};

const resetAndSeedRoleCollections = async (users) => {
  const admins = [];
  const volunteers = [];
  const appUsers = [];

  users.forEach((user) => {
    const payload = sanitizeForRoleCollection(user);
    if (user.role === 'admin') admins.push(payload);
    else if (user.role === 'volunteer') volunteers.push(payload);
    else appUsers.push(payload);
  });

  await Promise.all([
    AdminAccount.deleteMany({}),
    VolunteerAccount.deleteMany({}),
    AppUserAccount.deleteMany({})
  ]);

  if (admins.length) await AdminAccount.insertMany(admins);
  if (volunteers.length) await VolunteerAccount.insertMany(volunteers);
  if (appUsers.length) await AppUserAccount.insertMany(appUsers);
};

module.exports = {
  upsertRoleAccount,
  resetAndSeedRoleCollections
};
