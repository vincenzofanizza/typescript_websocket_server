import { DataTypes, Model } from 'sequelize';
import sequelize from './sequelize';

class Message extends Model {
    public id!: string;
    public content!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly sentById?: string;
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
        allowNull: true
    },
    chatRoomId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Message',
    timestamps: true
});

export default Message;
