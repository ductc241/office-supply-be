import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { createPagination } from "./pagination.helper";

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return createPagination(request.query.page, request.query.perPage);
  },
);
