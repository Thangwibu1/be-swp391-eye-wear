import { Socket } from "socket.io";

export abstract class BaseSocketHandler {
  abstract initHandler(socket: Socket) : void;
}