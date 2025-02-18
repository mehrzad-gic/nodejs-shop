import { DataTypes } from 'sequelize';
import sequelize from '../../Configs/DB.js';

const Seller = sequelize.define('Seller', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    des: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    img: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    slug: {
        type: DataTypes.STRING(255),
        unique: true,
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
    user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: 'users',
            key: 'id',
        },
        allowNull: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    likes_count: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
    },
    dislikes_count: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
    },
    products_count: {
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
    tableName: 'sellers',
    timestamps: false,
});

export default Seller;
