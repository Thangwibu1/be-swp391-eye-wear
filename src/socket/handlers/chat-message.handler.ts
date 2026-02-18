import { Server, Socket } from 'socket.io';
import { listenedEvent } from '../../config/constants/socket-event.constant';
import { BaseSocketHandler } from './base-socket-handler';
import { withValidation } from '../middlewares/validator.middleware';
import { JoinRoomRequest, JoinRoomSchema, SendMessageRequest, SendMessageSchema } from '../schemas/chat-message.schema';
import { formatDateToString } from '../../utils/formatter';

export class ChatMessageHandler extends BaseSocketHandler {
    private io: Server;
    private socket: Socket;
    constructor(io: Server, socket: Socket) {
        super();
        this.io = io;
        this.socket = socket;
    }
    /*
     * Đăng kí các sự kiện mà socket sẽ lắng nghe và xử lí từ client
     */
    registerHandler(): void {
        // typing event
        this.socket.on(listenedEvent.SEND_A_MESSAGE, withValidation(SendMessageSchema, this.handleSendMessageEvent));
        // send message event
        this.socket.on(listenedEvent.TYPING, this.handleTypingEvent);
        this.socket.on(listenedEvent.JOIN_ROOM, withValidation(JoinRoomSchema, this.handlerJoinRoom));
        this.socket.on(listenedEvent.LEAVE_ROOM, withValidation(JoinRoomSchema, this.handlerLeaveRoom));
    }
    /**
     * Chạy những thứ cần thiết ban đầu khi user kết nối đến socket
     */
    initHandler = async () => {
        console.log(`${this.socket.user!.userType}:${this.socket.user?.id} is online`)
        const {id, userType} = this.socket.user!
        if(userType == "CUSTOMER"){
            // bắn tín hiệu đến staff để biết ông này vừa vào
            this.socket.to("staff:inbox_global").emit('CUSTOMER_ONLINE', JSON.stringify({id}));
            // giả sử vào tìm trong roomChat cho ra id room rồi join vào 
            const roomChatId = id;
            this.socket.join(`roomChat:${roomChatId}`);
        }
        else {
            this.socket.join('staff:inbox_global');
        }
    }
    /**
     * Chạy logic khi user out socket
     */
    endHandler = async () => {
        console.log(">>User::", this.socket.user?.id + " " + this.socket.user?.userType, " out socket");
    }
    private handleTypingEvent = async () => {
        
    };
    private handleSendMessageEvent = async (data: SendMessageRequest, cb: any) => {
        const {userType, id} = this.socket.user!;
        if(userType == "SHOP"){
            if(!data.roomChatId){
                // throw error
            }
        }
        const viewers = await this.io.in(`roomChat:${data.roomChatId}`).fetchSockets();
        if(viewers.length >= 2){
            if(this.socket.user?.userType == "CUSTOMER"){
                console.log(">>> a staff has read message");
            }
            else {
                console.log(">>> cust has read message");
            }
        }
        else {
            console.log(">>The opposite side has not read message yet")
        }
        const roomChatId = data.roomChatId || "1";
        const dataResponse = {
            userType,
            createdAt: formatDateToString(new Date()),
            content: data.content
        }
        this.io.to(`roomChat:${roomChatId}`).emit("RECEIVE_A_MESSAGE", JSON.stringify(dataResponse));
    };
    private handlerJoinRoom = async (data: JoinRoomRequest, cb: any) => {
        const {userType, id} = this.socket.user!;
        if(userType == "SHOP"){
            this.socket.join(`roomChat:${data.roomChatId}`);
        }
    }
    private handlerLeaveRoom = async (data: JoinRoomRequest, cb: any) => {
        const {userType, id} = this.socket.user!;
        if(userType == "SHOP"){
            if(this.socket.rooms.has(`roomChat:${data.roomChatId}`)){
                this.socket.leave(`roomChat:${data.roomChatId}`);
            }
        }
    }
}
