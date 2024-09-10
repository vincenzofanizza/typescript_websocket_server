import { DataTypes, Model } from 'sequelize';
import sequelize from './sequelize';

class ChatRoom extends Model {
    public id!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ChatRoom.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'ChatRoom',
    timestamps: true
});

export default ChatRoom;
