"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_logs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action: {
        type: Sequelize.ENUM("CREATE", "UPDATE", "DELETE"),
        allowNull: false,
      },
      resource: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      resourceId: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      before: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      after: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("audit_logs", ["adminId"]);
    await queryInterface.addIndex("audit_logs", ["resource", "resourceId"]);
    await queryInterface.addIndex("audit_logs", ["createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("audit_logs");
  },
};
