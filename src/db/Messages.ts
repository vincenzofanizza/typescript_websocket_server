import { Sequelize, DataTypes, Model } from 'sequelize';

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './sqlite-db/messages.db'
  });
  
  // Define the Message model
  class Message extends Model {
    public id!: number;
    public message!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }
  
  Message.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Message',
    timestamps: true  // Automatically manages createdAt and updatedAt
  });
  
  // Sync the model with the database
  sequelize.sync().then(() => {
    console.log('Database & tables created!');
  });
  
export default Message;