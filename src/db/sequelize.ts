import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './sqlite-db/messages.db'
});

export default sequelize;
