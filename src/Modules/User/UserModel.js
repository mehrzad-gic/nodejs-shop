import { DataTypes } from 'sequelize';
import sequelize from '../config/database'; // Adjust the path as necessary

const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        defaultValue: '',
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
    },
    slug: {
        type: DataTypes.STRING(255),
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
    followers_count: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
    },
    followings_count: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
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
    tableName: 'users',
    timestamps: false,
});

export default User;
