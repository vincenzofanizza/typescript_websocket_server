import { DataTypes, Model } from 'sequelize';
import sequelize from './sequelize';

class User extends Model {
    public id!: string;
    public supabaseId!: string;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    supabaseId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    sequelize,
    modelName: 'User',
    timestamps: true
});

export default User;