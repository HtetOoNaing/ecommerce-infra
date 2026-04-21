"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "totpSecret", {
      type: Sequelize.STRING(64),
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn("users", "isMfaEnabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "totpSecret");
    await queryInterface.removeColumn("users", "isMfaEnabled");
  },
};
