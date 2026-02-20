import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ChatMessageHandler } from './handlers/chat-message.handler';
import { config } from '../config/env.config';
import { SocketError, SocketUserNotGrantPermissionError, UnauthorizedSocketError } from '../errors/socketError/socket-error';
import { ApiError } from '../errors/apiError/api-error';
import { JwtError } from '../errors/jwt/jwt-error';
import authService from '../services/client/auth.service';
import adminAuthService from '../services/admin/auth.service';
import { RoleType } from '../config/enums/admin-account';
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
        this.io.use(async (socket, next) => {
            try {
                const authSocket = socket.handshake.auth;
                const token = authSocket.token;
                const userType = authSocket.userType;
                if(!token) throw new UnauthorizedSocketError("INVALID_TOKEN");
                if(userType == 'CUSTOMER' && userType != "SHOP"){
                    throw new UnauthorizedSocketError('INVALID_USER_TYPE');                  
                }
                const jwtPayload = userType == 'CUSTOMER' ? (await authService.verifyUserByAccessToken(token)) : (await adminAuthService.verifyUserByAccessToken(token));
                socket.user = {
                    id: jwtPayload.userId,
                    userType: userType
                }
                next();
            } catch (error: any) {
                if(error instanceof SocketError){
                    next(error);
                }
                else if(error instanceof ApiError){
                    const resErr = new SocketError(error.message);
                    next(resErr);
                }
                else if(error instanceof JwtError){
                    const resErr = new SocketError(error.message, error.code);
                    next(resErr);
                }else {
                    const resErr = new SocketError('Internal socket err');
                    next(resErr);
                }
            }
        });

        this.io.on('connection', async (socket) => {
            // Đăng ký các nghiệp vụ bên phần chatting
            const chatHandler = new ChatMessageHandler(this.io!, socket);
            await chatHandler.registerHandler();
            // End Đăng ký các nghiệp vụ bên phần chatting
            
            socket.on('disconnect', async () => {
                await chatHandler.endHandler();
            });
        });
    };

    getIO = () => {
        if (!this.io) throw new Error('Socket has not initialized yet !');
        return this.io;
    };
}
