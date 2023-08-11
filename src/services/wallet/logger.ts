export class Logger {
  static error(message: string) {
    console.error('XPortal Background Activity - Error: ', message);
  }

  static trace(message: string) {
    console.trace(message);
  }
}
