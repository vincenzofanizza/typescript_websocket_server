import { DataTypes, Model } from 'sequelize';
import User from './User';
import ChatRoom from './ChatRoom';
import sequelize from './sequelize';

class Message extends Model {
    public id!: string;
    public content!: string;
    public readonly sentById?: string;
    public readonly chatRoomId!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Message.init({
    id: {
        type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sentById: {
        type: DataTypes.UUIDV4,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: true
    },
    chatRoomId: {
        type: DataTypes.UUIDV4,
        references: {
            model: ChatRoom,
            key: 'id'
        },
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Message',
    timestamps: true
});

export default Message;
