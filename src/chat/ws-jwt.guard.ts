import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient();
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

            if (!token) return false;

            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'coffeein_secret_key_change_me',
            });

            client.data.user = payload; // Attach user to client data
            return true;
        } catch {
            return false;
        }
    }
}
