import { FleetStoreService } from '../../../../shared/infrastructure/fleet-store.service';
import { InMemoryBrandRepository } from '../../infrastructure/repositories/in-memory-brand.repository';
import { CreateBrandUseCase } from './create-brand.use-case';
import { UpdateBrandUseCase } from './update-brand.use-case';
import { DeleteBrandUseCase } from './delete-brand.use-case';
import { FindBrandUseCase } from './find-brand.use-case';
import { ListBrandsUseCase } from './list-brands.use-case';
import { BrandAlreadyExistsError } from '../../domain/errors/brand-already-exists.error';
import { BrandNotFoundError } from '../../domain/errors/brand-not-found.error';
import { BrandHasModelsError } from '../../domain/errors/brand-has-models.error';

describe('Brands Use Cases', () => {
  let store: FleetStoreService;
  let repository: InMemoryBrandRepository;
  let createBrandUseCase: CreateBrandUseCase;
  let updateBrandUseCase: UpdateBrandUseCase;
  let deleteBrandUseCase: DeleteBrandUseCase;
  let findBrandUseCase: FindBrandUseCase;
  let listBrandsUseCase: ListBrandsUseCase;

  beforeEach(() => {
    store = new FleetStoreService();
    repository = new InMemoryBrandRepository(store);
    createBrandUseCase = new CreateBrandUseCase(repository);
    updateBrandUseCase = new UpdateBrandUseCase(repository);
    deleteBrandUseCase = new DeleteBrandUseCase(repository);
    findBrandUseCase = new FindBrandUseCase(repository);
    listBrandsUseCase = new ListBrandsUseCase(repository);
  });

  describe('CreateBrandUseCase', () => {
    it('should create a new brand successfully', async () => {
      const result = await createBrandUseCase.execute({
        name: 'Toyota',
        userId: 'user-1',
      });
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Toyota');
      expect(result.createdBy).toBe('user-1');
      expect(store.brands.length).toBe(1);
    });

    it('should throw BrandAlreadyExistsError if name exists', async () => {
      await createBrandUseCase.execute({ name: 'Toyota', userId: 'user-1' });
      await expect(
        createBrandUseCase.execute({ name: 'toyota', userId: 'user-2' }),
      ).rejects.toThrow(BrandAlreadyExistsError);
    });
  });

  describe('UpdateBrandUseCase', () => {
    it('should update an existing brand successfully', async () => {
      const brand = await createBrandUseCase.execute({
        name: 'Toyota',
        userId: 'user-1',
      });
      const updated = await updateBrandUseCase.execute({
        id: brand.id,
        name: 'Toyota Updated',
        userId: 'user-1',
      });
      expect(updated.name).toBe('Toyota Updated');
    });

    it('should throw BrandNotFoundError if brand does not exist', async () => {
      await expect(
        updateBrandUseCase.execute({
          id: 'non-existing-uuid',
          name: 'New Name',
          userId: 'user-1',
        }),
      ).rejects.toThrow(BrandNotFoundError);
    });

    it('should throw BrandAlreadyExistsError on name collision', async () => {
      const brand1 = await createBrandUseCase.execute({
        name: 'Toyota',
        userId: 'user-1',
      });
      await createBrandUseCase.execute({ name: 'Honda', userId: 'user-1' });
      await expect(
        updateBrandUseCase.execute({
          id: brand1.id,
          name: 'Honda',
          userId: 'user-1',
        }),
      ).rejects.toThrow(BrandAlreadyExistsError);
    });
  });

  describe('FindBrandUseCase', () => {
    it('should find brand by id', async () => {
      const brand = await createBrandUseCase.execute({
        name: 'Toyota',
        userId: 'user-1',
      });
      const found = await findBrandUseCase.execute(brand.id);
      expect(found.id).toBe(brand.id);
    });

    it('should throw BrandNotFoundError', async () => {
      await expect(
        findBrandUseCase.execute('non-existing-uuid'),
      ).rejects.toThrow(BrandNotFoundError);
    });
  });

  describe('ListBrandsUseCase', () => {
    it('should list all brands', async () => {
      await createBrandUseCase.execute({ name: 'Toyota', userId: 'user-1' });
      await createBrandUseCase.execute({ name: 'Honda', userId: 'user-1' });
      const list = await listBrandsUseCase.execute();
      expect(list.length).toBe(2);
    });
  });

  describe('DeleteBrandUseCase', () => {
    it('should delete a brand successfully', async () => {
      const brand = await createBrandUseCase.execute({
        name: 'Toyota',
        userId: 'user-1',
      });
      await deleteBrandUseCase.execute({ id: brand.id, userId: 'user-1' });
      expect(store.brands.length).toBe(0);
    });

    it('should throw BrandNotFoundError', async () => {
      await expect(
        deleteBrandUseCase.execute({
          id: 'non-existing-uuid',
          userId: 'user-1',
        }),
      ).rejects.toThrow(BrandNotFoundError);
    });

    it('should throw BrandHasModelsError if models exist', async () => {
      const brand = await createBrandUseCase.execute({
        name: 'Toyota',
        userId: 'user-1',
      });
      store.models.push({
        id: 'model-1',
        name: 'Corolla',
        brandId: brand.id,
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(
        deleteBrandUseCase.execute({ id: brand.id, userId: 'user-1' }),
      ).rejects.toThrow(BrandHasModelsError);
    });
  });
});
