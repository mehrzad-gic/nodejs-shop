import { DataTypes } from 'sequelize';
import sequelize from '../../Configs/DB.js';

const Province = sequelize.define('Province', {
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
    country_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'countries',
            key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
    tableName: 'provinces',
    timestamps: false,
});

export default Province;
