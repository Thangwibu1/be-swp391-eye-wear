import mongoose, { Schema } from 'mongoose';
import { ChatMessageType } from '../../config/enums/chat-message.enum';

const roomChatSchema = new Schema(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        // lưu lại tin nhắn gần nhất để đỡ tốn công query
        lastMessages: {
            type: {
                messageType: {
                    type: String,
                    enum: ChatMessageType,
                    required: true,
                },
                content: {
                    type: String,
                    required: false,
                },
                media: {
                    type: [String],
                    required: false,
                },
            },
            default: null,
        },
        lastMessageSentTime: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const RoomChatModel = mongoose.model('RoomChat', roomChatSchema);
