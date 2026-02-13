import { Server, Socket } from 'socket.io';
import { clientEvent } from '../../config/constants/socket-event.constant';
import { BaseSocketHandler } from './base-socket-handler';

export class ChatMessageHandler extends BaseSocketHandler {
    private io: Server;
    private socket: Socket;
    constructor(io: Server, socket: Socket) {
        super();
        this.io = io;
        this.socket = socket;
    }
    initHandler(): void {
        // dựa vào type mà cho con socket của mình join room ngay lúc mở connection luôn
        // cust -> `room-chat:${roomChatId}`
        // staff -> `staff_room_chat`
        // mỗi lần cust hay staff gửi event -> phải emit cả 2 phòng
        // bắn event vào phòng staff phải luôn cần biết roomId, customerId

        // typing event
        this.socket.on(clientEvent.SEND_A_MESSAGE, this.handleSendMessageEvent);
        // send message event
        this.socket.on(clientEvent.TYPING, this.handleTypingEvent);
    }
    private handleTypingEvent = async () => {};
    private handleSendMessageEvent = async () => {
        // làm cách méo nào đó để biết nó là admin hay client
    };
}
