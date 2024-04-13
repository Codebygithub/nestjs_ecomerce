import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { BlogService } from "src/blog/blog.service";

@Injectable()
export class ValidTitleGuard implements CanActivate {
    constructor(private readonly blogService: BlogService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const title = request.body.title;

        if (await this.blogService.titleExists(title)) {
            throw new BadRequestException('Tiêu đề đã tồn tại');
        }

        return true;
    }
}
