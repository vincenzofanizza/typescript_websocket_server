import { DataTypes, Model } from 'sequelize';
import sequelize from './sequelize';

class User extends Model {
    public id!: number;
    public firstName!: string;
    public lastName!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    }
    }, {
    sequelize,
    modelName: 'User',
    timestamps: true
});

export default User;
