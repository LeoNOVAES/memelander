const or = (...params) => {
  return { $or: params };
}

module.exports = {
  or,
}
