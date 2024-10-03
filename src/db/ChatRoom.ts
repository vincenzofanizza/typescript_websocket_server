import { DataTypes, Model } from 'sequelize';
import sequelize from './sequelize';

class ChatRoom extends Model {
  public id!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly ownerId!: string;
}

ChatRoom.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ChatRoom',
  timestamps: true
});

export default ChatRoom;