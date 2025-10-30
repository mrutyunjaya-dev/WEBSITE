module.exports = (sequelize, DataTypes) => {
  const ShareYourProfile = sequelize.define(
    "share_your_profile",
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

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      what_describes_you_best: {
        type: DataTypes.STRING,   // ✅ Now stored as string, not numeric
        allowNull: false,
      },

      YOE: {
        type: DataTypes.INTEGER,  // ✅ Years of Experience as number
        allowNull: true,
      },

      highest_qualification: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      current_org: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      documents: {
        type: DataTypes.JSON,    // ✅ Array of S3 file URLs
        allowNull: true,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "share_your_profile",
      timestamps: true,
    }
  );

  return ShareYourProfile;
};
