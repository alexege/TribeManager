export const serializeId = (doc) => ({
  ...doc.toObject(),
  id: doc._id.toString(),
  _id: undefined,
});
