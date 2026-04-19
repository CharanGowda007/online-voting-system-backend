import { Response } from 'express';

export interface PageRequestLike {
  page: number;
  size: number;
  sort?: string;
}

export interface PageLike<T> {
  content: T[];
  totalElements: number;
  pageRequest: PageRequestLike;
}

export class HeaderUtil {
  static addEntityCreatedHeaders(
    res: Response,
    entityName: string,
    id: number | string,
  ) {
    res.set('X-Entity-Name', entityName);
    res.set('X-Entity-ID', id.toString());
  }

  static addEntityDeletedHeaders(
    res: Response,
    entityName: string,
    id: number | string,
  ) {
    res.set('X-Entity-Deleted', entityName);
    res.set('X-Entity-ID', id.toString());
  }

  static addPaginationHeaders(res: Response, page: PageLike<unknown>) {
    const { totalElements, pageRequest } = page;
    res.set('X-Total-Count', String(totalElements));
    res.set('X-Page', String(pageRequest.page));
    res.set('X-Size', String(pageRequest.size));
  }
}
