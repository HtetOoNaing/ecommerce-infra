"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "categoryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("products", ["categoryId"]);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("products", "categoryId");
  },
};
