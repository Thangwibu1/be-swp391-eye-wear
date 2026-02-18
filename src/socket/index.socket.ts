import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ChatMessageHandler } from './handlers/chat-message.handler';
import { config } from '../config/env.config';
import { UnauthorizedRequestError } from '../errors/apiError/api-error';
export class MySocketServer {
    private io: Server | null = null;
    init = (server: HttpServer) => {
        this.io = new Server(server, {
            cors: {
                origin: config.cors.origin, // Cho phép frontend kết nối
                credentials: true, // Cho phép gửi cookies
            },
        });

        // Middleware xác thực
        this.io.use((socket, next) => {
            try {
                const authSocket = socket.handshake.auth;
                const token = authSocket.token;
                const userType = authSocket.userType;
                if(!userType || !token) throw new UnauthorizedRequestError("EMPTY_TOKEN_OR_USER_TYPE");
                if(userType == 'CUSTOMER'){
                    // xử lí token bên cust
                    socket.user = {
                        id: token,
                        userType: userType
                    }
                }
                else if(userType == "SHOP") {
                    // xử lí token bên staff
                    socket.user = {
                        id: token,
                        userType: userType
                    }
                }
                else {
                    throw new UnauthorizedRequestError('INVALID_USER_TYPE');
                }
                next();
            } catch (error: any) {
                if(error instanceof UnauthorizedRequestError) {
                    socket.emit('error', {
                        code: error.message
                    });
                }
            }
        });

        this.io.on('connection', socket => {
            const currentUser = socket.user!;
            // Đăng ký các nghiệp vụ chat
            const chatHandler = new ChatMessageHandler(this.io!, socket);
            chatHandler.initHandler();
            chatHandler.registerHandler();

            socket.on('disconnect', () => {
                chatHandler.endHandler();
            });
        });
    };

    getIO = () => {
        if (!this.io) throw new Error('Socket has not initialized yet !');
        return this.io;
    };
}
