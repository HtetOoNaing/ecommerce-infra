"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make userId nullable (customer orders won't have a userId)
    await queryInterface.changeColumn("orders", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add customerId FK → customers
    await queryInterface.addColumn("orders", "customerId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "customers", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add stripePaymentIntentId for webhook → order lookup
    await queryInterface.addColumn("orders", "stripePaymentIntentId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("orders", "stripePaymentIntentId");
    await queryInterface.removeColumn("orders", "customerId");
    await queryInterface.changeColumn("orders", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
