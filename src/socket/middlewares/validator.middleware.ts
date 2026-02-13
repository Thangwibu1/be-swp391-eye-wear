import { Socket } from 'socket.io';
import { z, ZodError } from 'zod';

/**
 * Middleware factory để validate dữ liệu từ socket event
 * @param schema - Zod schema để validate
 * @returns Socket middleware function
 */
export const validateSocketData = (schema: z.ZodSchema<any>) => {
    return (socket: Socket, data: any, next: (err?: Error) => void) => {
        try {
            // Validate data với schema
            schema.parse(data);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new Error(`Validation error`));
            }
            next(new Error('Validation error'));
        }
    };
};

/**
 * Wrapper để tạo event handler có validation
 * @param schema - Zod schema để validate
 * @param handler - Event handler function
 * @returns Wrapped handler với validation
 */
export const withValidation = <T>(
    schema: z.ZodSchema<T>,
    handler: (socket: Socket, data: T, callback?: any) => void | Promise<void>
    //                                  ↑ Thêm callback parameter
) => {
    return async (socket: Socket, data: any, callback?: any) => {
        //                                    ↑ Nhận callback từ Socket.IO
        try {
            // Validate data
            const validatedData = schema.parse(data);
            // Gọi handler với validated data VÀ callback
            await handler(socket, validatedData, callback);
            //                                   ↑ Truyền callback vào handler
        } catch (error) {
            if (error instanceof ZodError) {
                // Nếu có callback, trả error qua callback
                if (callback) {
                    callback({
                        success: false,
                        error: 'Validation error',
                    });
                } else {
                    // Nếu không có callback, emit error event
                    socket.emit('error', {
                        message: `Validation error`,
                    });
                }
            } else {
                if (callback) {
                    callback({
                        success: false,
                        error: 'An error occurred',
                    });
                } else {
                    socket.emit('error', {
                        message: 'An error occurred',
                    });
                }
            }
        }
    };
};