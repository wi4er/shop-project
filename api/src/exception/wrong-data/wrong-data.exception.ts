
export class WrongDataException extends Error {

  static assert(value: any, message: string) {
    if (!value) throw new this(message);
    return value;
  }

}