export enum ResponseType {
  ERROR = 1,
  SUCCESS = 2,
  SUCCESS_WITHOUT_DATA = 3,
}

interface ResEntity<T = any> {
  code?: number;
  status?: number;
  msg?: string;
  data: T;
}

export class ResponseEntity<T = any> {
  code?: number;
  status?: number;
  msg?: string;
  data: T;

  constructor(entity: ResEntity) {
    this.data = entity.data;
    this.code = entity.code;
    this.status = entity.status;
    this.msg = entity.msg;
  }
}
