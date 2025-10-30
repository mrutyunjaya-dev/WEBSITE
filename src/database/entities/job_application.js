const { JOB_TITLES } = require("../../constants/job");

module.exports = (sequelize, DataTypes) => {
  const job_applications = sequelize.define(
    "job_applications",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },


      // Link to the job posting
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null if someone applies directly without selecting from listing
        references: {
          model: 'jobs',
          key: 'id'
        }
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

      // store numeric job_title index
      position: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // // Virtual - readable text from constants
      // position_text: {
      //   type: DataTypes.VIRTUAL,
      //   get() {
      //     return JOB_TITLES[this.getDataValue("position")] || null;
      //   },
      // },

      // store numeric experience index
      experience_years: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // experience_years_text: {
      //   type: DataTypes.VIRTUAL,
      //   get() {
      //     return EXPERIENCE_LEVELS[this.getDataValue("experience_years")] || null;
      //   },
      // },

      // store numeric location index
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // location_text: {
      //   type: DataTypes.VIRTUAL,
      //   get() {
      //     return LOCATIONS[this.getDataValue("location")] || null;
      //   },
      // },

      notice_period: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      document_uploads: {
        type: DataTypes.JSON, 
        allowNull: true,
      },

      is_reviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    },
    {
      tableName: "job_applications",
      timestamps: true,
    }
  );

    // Add association
  job_applications.associate = (models) => {
    job_applications.belongsTo(models.jobs, {
      foreignKey: 'job_id',
      as: 'job_details'
    });
  };

  return job_applications;
};
