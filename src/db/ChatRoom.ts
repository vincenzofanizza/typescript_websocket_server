import { DataTypes, Model } from 'sequelize';
import sequelize from './sequelize';
import User from './User';

class ChatRoom extends Model {
    public id!: string;
    public name!: string;
    public ownerId!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public owner?: User;
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
        allowNull: false,
        references: {
            model: User,
            key: 'supabaseId'
        },
        onDelete: 'CASCADE'
    }
}, {
    sequelize,
    modelName: 'ChatRoom',
    timestamps: true
});

ChatRoom.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

export default ChatRoom;