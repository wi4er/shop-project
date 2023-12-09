
export class NoDataException extends Error {

  static assert(value: any, message: string): any {
    if (!value) throw new this(message);
    return value;
  }

}