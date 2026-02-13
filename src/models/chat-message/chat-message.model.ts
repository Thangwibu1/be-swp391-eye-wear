import mongoose, { Schema } from "mongoose";
import { ChatMessageType } from "../../config/enums/chat-message.enum";

const chatMessageSchema = new Schema({
  roomChatId: {
    type: Schema.Types.ObjectId,
    ref: "RoomChat",
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel' // Trỏ đến field chỉ định bảng
  },
  // Field này lưu tên Model: 'Customer' hoặc 'AdminAccount'
  senderModel: {
    type: String,
    required: true,
    enum: ['Customer', 'AdminAccount'] 
  },
  messageType: {
    type: String,
    enum: ChatMessageType,
    required: true
  },
  content: {
    type: String,
    required: false,
  },
  media: {
    type: [String],
    required: false
  },
}, {
  timestamps: true,
});

export const ChatMessageModel = mongoose.model('ChatMessage', chatMessageSchema);