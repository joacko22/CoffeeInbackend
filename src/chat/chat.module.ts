import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [AuthModule],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController]
})
export class ChatModule { }
