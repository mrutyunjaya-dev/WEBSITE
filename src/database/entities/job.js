const { JOB_TYPES, EXPERIENCE_LEVELS, JOB_TITLES } = require("../../constants/job");

module.exports = (sequelize, DataTypes) => {
  const jobs = sequelize.define(
    "jobs",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      job_title: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Virtual Field (Auto mapped from index → text)
      job_title_text: {
        type: DataTypes.VIRTUAL,
        get() {
          return JOB_TITLES[this.getDataValue("job_title")] || null;
        }
      },

      job_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Virtual Field
      job_type_text: {
        type: DataTypes.VIRTUAL,
        get() {
          return JOB_TYPES[this.getDataValue("job_type")] || null;
        }
      },

      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      experience_required: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      //  Virtual Field
      experience_text: {
        type: DataTypes.VIRTUAL,
        get() {
          return EXPERIENCE_LEVELS[this.getDataValue("experience_required")] || null;
        }
      },

      salary_range: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // // Virtual Field
      // location_text: {
      //   type: DataTypes.VIRTUAL,
      //   get() {
      //     return LOCATIONS[this.getDataValue("location")] || null;
      //   }
      // },

      job_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    },
    {
      tableName: "jobs",
      timestamps: true,
      paranoid: false,
    }
  );

    // Add association
  jobs.associate = (models) => {
    jobs.hasMany(models.job_applications, {
      foreignKey: 'job_id',
      as: 'applications'
    });
  };

  return jobs;
};
