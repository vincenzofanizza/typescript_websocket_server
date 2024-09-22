import { DataTypes, Model } from 'sequelize';
import User from './User';
import ChatRoom from './ChatRoom';
import sequelize from './sequelize';

class Message extends Model {
    public id!: string;
    public content!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly sentById?: string;
    public sentBy?: User;
    public readonly chatRoomId!: string;
}

Message.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sentById: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: true
    },
    chatRoomId: {
        type: DataTypes.UUID,
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

Message.belongsTo(User, { foreignKey: 'sentById', as: 'sentBy' });

export default Message;
