
export class NoDataException extends Error {

  static assert(value: any, message: string) {
    if (!value) {
      throw new this(message);
    }
  }

}