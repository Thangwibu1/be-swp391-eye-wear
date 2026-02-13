import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ChatMessageHandler } from './handlers/chat-message.handler';
import { config } from '../config/env.config';
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
            // check cả 2 bên để biết nó là customer hay staff ?

            // const user = authService.verifyToken(socket.handshake.auth.token);
            // if (user) {
            //   // socket.user = user;
            //   next();
            // } else {
            //   next(new Error("Unauthorized"));
            // }
            next();
        });

        this.io.once('connection', socket => {
            console.log(`User connected: ${socket.id}`);

            // Đăng ký các nghiệp vụ chat
            const chatHandler = new ChatMessageHandler(this.io!, socket);
            chatHandler.initHandler();

            socket.on('disconnect', () => console.log('User disconnected'));
        });
    };

    getIO = () => {
        if (!this.io) throw new Error('Socket has not initialized yet !');
        return this.io;
    };
}
