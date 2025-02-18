import { DataTypes } from 'sequelize';
import sequelize from '../../Configs/DB.js';

const Country = sequelize.define('Country', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        defaultValue: '',
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'countries',
    timestamps: false,
});

export default Country;
