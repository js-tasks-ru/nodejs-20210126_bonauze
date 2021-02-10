let count = 0;

const generateUniqueId = () => {
  count++;
  return count;
};

module.exports = generateUniqueId;
