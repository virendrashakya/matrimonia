const User = require('./User');
const Profile = require('./Profile');
const RecognitionEntry = require('./RecognitionEntry');
const AuditLog = require('./AuditLog');
const Configuration = require('./Configuration');
const Interest = require('./Interest');
const Notification = require('./Notification');
const ProfileView = require('./ProfileView');
const AccessRequest = require('./AccessRequest');

const ChatRequest = require('./ChatRequest');
const Conversation = require('./Conversation');
const Message = require('./Message');

module.exports = {
    User,
    Profile,
    AuditLog,
    AccessRequest,
    ChatRequest,
    Conversation,
    Message,
    RecognitionEntry, // Keeping RecognitionEntry as it was not explicitly removed
    Configuration,
    Interest,
    Notification,
    ProfileView
};
