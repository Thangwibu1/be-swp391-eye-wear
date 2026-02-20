export const emittedEvent = {
  RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
  UPDATE_CHAT_LIST: "UPDATE_CHAT_LIST",
  READ_BY_SHOP: "READ_BY_SHOP",
  READ_BY_CUSTOMER: "READ_BY_CUSTOMER",
  CUSTOMER_ONLINE: "CUSTOMER_ONLINE", // only cust gửi
};
export const listenedEvent = {
  SEND_MESSAGE: "SEND_MESSAGE",
  TYPING: "TYPING", 
  JOIN_ROOM: "JOIN_ROOM", // only nhận nếu là staff gửi
  LEAVE_ROOM: "LEAVE_ROOM", // only nhận nếu staff gửi
}