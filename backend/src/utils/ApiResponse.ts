export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];

  constructor(success: boolean, message: string, data?: T, errors?: any[]) {
    this.success = success;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
    if (errors !== undefined) {
      this.errors = errors;
    }
  }

  static success<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(message: string, errors: any[] = []): ApiResponse<undefined> {
    return new ApiResponse(false, message, undefined, errors);
  }
}
