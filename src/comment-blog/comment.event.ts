export class commentEvent {
    constructor(
      public readonly userId: number,
      public readonly commentTime: Date,
    ) {}
  }