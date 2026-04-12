import User from "../models/user.js";

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createSafeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  emailId: user.emailId,
  mobile: user.mobile,
  state: user.state,
  role: user.role,
  createdAt: user.createdAt,
});

const getProfile = async (user) => createSafeUser(user);

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return createSafeUser(user);
};

const getUsers = async (query) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const filter = {};

  if (query.search) {
    const regex = new RegExp(escapeRegExp(query.search.trim()), "i");
    filter.$or = [
      { fullName: regex },
      { emailId: regex },
      { mobile: regex },
      { state: regex },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    users: users.map(createSafeUser),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

const buildUpdatePayload = (updates, allowRole = false) => {
  const allowedFields = ["fullName", "emailId", "mobile", "state","isSubscribed"];
  if (allowRole) allowedFields.push("role");  

  const payload = {};
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      payload[field] = typeof updates[field] === "string" ? updates[field].trim() : updates[field];
    }
  });

  return payload;
};

const assertUniqueField = async (fieldName, value, excludeId) => {
  if (!value) return;
  const query = { [fieldName]: value };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await User.findOne(query);
  if (existing) {
    const error = new Error(`${fieldName} is already in use`);
    error.statusCode = 409;
    throw error;
  }
};

const updateUser = async (id, updates, allowRole = false) => {
  const payload = buildUpdatePayload(updates, allowRole);

  if (Object.keys(payload).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  await assertUniqueField("emailId", payload.emailId, id);
  await assertUniqueField("mobile", payload.mobile, id);

  const user = await User.findById(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  Object.assign(user, payload);
  await user.save();

  return createSafeUser(user);
};

const updateProfile = async (user, updates) => updateUser(user._id, updates, false);

const updateUserById = async (id, updates) => updateUser(id, updates, true);

export default  { getProfile, getUsers, getUserById, updateProfile, updateUserById };