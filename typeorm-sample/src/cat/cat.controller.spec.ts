import { Test, TestingModule } from '@nestjs/testing';
import { CatController } from './cat.controller';
import { CatDTO } from './cat.dto';
import { CatService } from './cat.service';

describe('Cat Controller', () => {
  let controller: CatController;
  let service: CatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatController],
      // If you've looked at the complex sample you'll notice that these functions
      // are a little bit more in depth using mock implementation
      // to give us a little bit more control and flexibility in our tests
      // this is not necessary, but can sometimes be helpful in a test scenario
      providers: [
        {
          provide: CatService,
          useValue: {
            getAll: jest
              .fn()
              .mockResolvedValue([
                { name: 'Test Cat 1', breed: 'Test Breed 1', age: 4 },
                { name: 'Test Cat 2', breed: 'Test Breed 2', age: 3 },
                { name: 'Test Cat 3', breed: 'Test Breed 3', age: 2 },
              ]),
            getOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                name: 'Test Cat 1',
                breed: 'Test Breed 1',
                age: 4,
                id,
              }),
            ),
            getOneByName: jest
              .fn()
              .mockImplementation((name: string) =>
                Promise.resolve({ name, breed: 'Test Breed 1', age: 4 }),
              ),
            insertOne: jest
              .fn()
              .mockImplementation((cat: CatDTO) =>
                Promise.resolve({ id: 'a uuid', ...cat }),
              ),
            updateOne: jest
              .fn()
              .mockImplementation((cat: CatDTO) =>
                Promise.resolve({ id: 'a uuid', ...cat }),
              ),
            deleteOne: jest.fn().mockResolvedValue({ deleted: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<CatController>(CatController);
    service = module.get<CatService>(CatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCats', () => {
    it('should get an array of cats', () => {
      expect(controller.getCats()).resolves.toEqual([
        {
          name: 'Test Cat 1',
          breed: 'Test Breed 1',
          age: 4,
        },
        {
          name: 'Test Cat 2',
          breed: 'Test Breed 2',
          age: 3,
        },
        {
          name: 'Test Cat 3',
          breed: 'Test Breed 3',
          age: 2,
        },
      ]);
    });
  });
  describe('getById', () => {
    it('should get a single cat', () => {
      expect(controller.getById('a strange id')).resolves.toEqual({
        name: 'Test Cat 1',
        breed: 'Test Breed 1',
        age: 4,
        id: 'a strange id',
      });
      expect(controller.getById('a different id')).resolves.toEqual({
        name: 'Test Cat 1',
        breed: 'Test Breed 1',
        age: 4,
        id: 'a different id',
      });
    });
  });
  describe('getByName', () => {
    it('should get a cat back', () => {
      expect(controller.getByName('Ventus')).resolves.toEqual({
        name: 'Ventus',
        breed: 'Test Breed 1',
        age: 4,
      });
      const getByNameSpy = jest
        .spyOn(service, 'getOneByName')
        .mockResolvedValueOnce({
          name: 'Aqua',
          breed: 'Maine Coon',
          age: 5,
          id: 'a new uuid',
        });
      expect(controller.getByName('Aqua')).resolves.toEqual({
        name: 'Aqua',
        breed: 'Maine Coon',
        age: 5,
        id: 'a new uuid',
      });
      expect(getByNameSpy).toBeCalledWith('Aqua');
    });
  });
  describe('newCat', () => {
    it('should create a new cat', () => {
      const newCatDTO: CatDTO = {
        name: 'New Cat 1',
        breed: 'New Breed 1',
        age: 4,
      };
      expect(controller.newCat(newCatDTO)).resolves.toEqual({
        id: 'a uuid',
        ...newCatDTO,
      });
    });
  });
  describe('updateCat', () => {
    it('should update a new cat', () => {
      const newCatDTO: CatDTO = {
        name: 'New Cat 1',
        breed: 'New Breed 1',
        age: 4,
      };
      expect(controller.updateCat(newCatDTO)).resolves.toEqual({
        id: 'a uuid',
        ...newCatDTO,
      });
    });
  });
  describe('deleteCat', () => {
    it('should return that it deleted a cat', () => {
      expect(controller.deleteCat('a uuid that exists')).resolves.toEqual({
        deleted: true,
      });
    });
    it('should return that it did not delete a cat', () => {
      const deleteSpy = jest
        .spyOn(service, 'deleteOne')
        .mockResolvedValueOnce({ deleted: false });
      expect(
        controller.deleteCat('a uuid that does not exist'),
      ).resolves.toEqual({ deleted: false });
      expect(deleteSpy).toBeCalledWith('a uuid that does not exist');
    });
  });
});
