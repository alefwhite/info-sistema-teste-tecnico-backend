export class Brand {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
