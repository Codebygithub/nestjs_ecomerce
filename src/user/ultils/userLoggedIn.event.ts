export class UserLoggedInEvent {
    constructor(
      public readonly userId: number,
      public readonly loginTime: Date,
    ) {}
  }