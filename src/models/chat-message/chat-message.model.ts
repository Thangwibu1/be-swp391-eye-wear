import mongoose, { Schema } from "mongoose";
import { ChatMessageType } from "../../config/enums/chat-message.enum";

const chatMessageSchema = new Schema({
  roomChatId: {
    type: Schema.Types.ObjectId,
    ref: "RoomChat",
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderType: {
    type: String,
    required: true,
    enum: ['CUSTOMER', 'SHOP']
  },
  content: {
    type: String,
    required: false,
  },
  media: {
    type: [String],
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true,
});

export const ChatMessageModel = mongoose.model('ChatMessage', chatMessageSchema);