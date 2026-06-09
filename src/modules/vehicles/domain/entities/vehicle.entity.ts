export class Vehicle {
  constructor(
    public readonly id: string,
    public licensePlate: string,
    public chassis: string,
    public renavam: string,
    public year: number,
    public modelId: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
