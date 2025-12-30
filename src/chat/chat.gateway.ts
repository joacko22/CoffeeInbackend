import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard'; // I will create this

@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { receiverId: string; content: string }) {
    // In a real app, extract senderId from JWT attached to client
    const senderId = client.data.user?.userId; // Assuming WsJwtGuard populates this

    if (!senderId) return;

    const message = await this.chatService.saveMessage(senderId, payload.receiverId, payload.content);

    // Emit to specific receiver if they are connected (simplification: emit to all for now or use rooms)
    this.server.emit('messageReceived', message);
  }
}
