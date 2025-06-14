import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("register")
  handleRegister(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  }

  sendOrderStatus(userId: string, orderId: string, status: string) {
    this.server
      .to(`user-${userId}`)
      .emit("order-status-updated", { orderId, status });
  }

  sendNewOrderToAdmin(payload: any) {
    this.server.to("admin").emit("new-order", payload);
  }

  sendSystemNoticeToAdmin(message: string) {
    this.server.to("admin").emit("system-notification", { message });
  }
}
