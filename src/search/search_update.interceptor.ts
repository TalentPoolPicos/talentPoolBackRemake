import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { SearchService } from './search.service';
import { JwtPayload } from 'src/auth/interfaces/payload';
import { Request } from 'express';

@Injectable()
export class SearchUpdateInterceptor implements NestInterceptor {
  constructor(private readonly searchService: SearchService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const payload = request['user'] as JwtPayload;

    return next.handle().pipe(
      tap(() => {
        if (payload.uuid) {
          this.searchService
            .updateDocumentByUserUuid(payload.uuid)
            .catch((error) => {
              console.error('Error updating document:', error);
            });
        }
      }),
    );
  }
}
