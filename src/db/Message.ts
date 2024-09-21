import { DataTypes, Model } from 'sequelize';
import User from './User';
import ChatRoom from './ChatRoom';
import sequelize from './sequelize';

class Message extends Model {
    public id!: number;
    public content!: string;
    public readonly sentById!: number;
    public readonly chatRoomId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Message.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sentById: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    chatRoomId: {
        type: DataTypes.INTEGER,
        references: {
            model: ChatRoom,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Message',
    timestamps: true
});

export default Message;
