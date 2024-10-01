import User from './User';
import ChatRoom from './ChatRoom';
import Message from './Message';

export function defineAssociations() {
    // User associations
    User.hasMany(Message, { foreignKey: 'sentById', as: 'messages', onDelete: 'SET NULL' });
    User.hasMany(ChatRoom, { foreignKey: 'ownerId', as: 'ownedChatRooms', onDelete: 'CASCADE' });

    // ChatRoom associations
    ChatRoom.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
    ChatRoom.hasMany(Message, { foreignKey: 'chatRoomId', as: 'messages', onDelete: 'CASCADE' });

    // Message associations
    Message.belongsTo(User, { foreignKey: 'sentById', as: 'sentBy', onDelete: 'SET NULL' });
    Message.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom', onDelete: 'CASCADE' });
}
