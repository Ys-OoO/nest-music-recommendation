import { ResponseExceptionFilter } from './response-exception.filter';

describe('ExceptionFilter', () => {
  it('should be defined', () => {
    expect(new ResponseExceptionFilter()).toBeDefined();
  });
});
