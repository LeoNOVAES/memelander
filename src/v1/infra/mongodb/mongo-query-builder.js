const or = (...params) => {
  return { $or: params };
}

const notIn = (...values) => {
  return { $nin: values };
}

module.exports = {
  or,
  notIn,
}
