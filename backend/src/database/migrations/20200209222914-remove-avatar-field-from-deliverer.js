module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('deliverers', 'avatar_id');
  },
};
