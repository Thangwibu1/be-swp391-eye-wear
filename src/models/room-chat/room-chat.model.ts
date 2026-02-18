import mongoose, { Schema } from 'mongoose';
import { ChatMessageType } from '../../config/enums/chat-message.enum';

const roomChatSchema = new Schema(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        lastMessage: {
            type: {
                senderType: {
                    type: String,
                    required: true,
                    enum: ['CUSTOMER', 'SHOP'],
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
        lastMessageAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const RoomChatModel = mongoose.model('RoomChat', roomChatSchema);
