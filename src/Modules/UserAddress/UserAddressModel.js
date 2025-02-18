import { DataTypes } from 'sequelize';
import sequelize from '../../Configs/DB.js';

const UserAddress = sequelize.define('UserAddress', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    addresses: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    postal_code: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    city_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'cities',
            key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
    },
    street: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    plack: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    floor: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
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
    tableName: 'user_addresses',
    timestamps: false,
});

export default UserAddress;
