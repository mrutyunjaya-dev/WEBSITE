module.exports = (sequelize, DataTypes) => {
  const ContactUs = sequelize.define(
    "contact_us",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      inquiry_details: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      // Device + Tracking Fields
      referrer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      device_info: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      request_ipv4: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "contact_us",

      // ✅ Enable timestamps
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      // ✅ Enable Soft Delete
      paranoid: true,
      deletedAt: "deleted_at"
    }
  );

  return ContactUs;
};
