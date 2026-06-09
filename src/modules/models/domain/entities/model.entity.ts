export class Model {
  constructor(
    public readonly id: string,
    public name: string,
    public brandId: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
