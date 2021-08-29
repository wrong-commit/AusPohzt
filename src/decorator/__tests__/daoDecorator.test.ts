// test class with decorator
import * as daoDecorators from '../daoDecorators';
import { entity } from '../entityDecorators';

@entity('test')
class testEntity {

}

@daoDecorators.dao("test")
class _testDao {
    // use findAll as it is on dao, and requires no args
    findAll = mockDaoMethod;
}

class _testEntityWithoutDecorator {
}

let mockDaoMethod = jest.fn();

describe("@dao", () => {
    beforeEach(() => {
        // reset between tests
        mockDaoMethod = jest.fn();
    })
    describe("Get dao constructor", () => {
        test("Non existent entity name returns undefined", () => {
            expect(daoDecorators.getDao('notfound')).toBeUndefined()
        });
        test("Non entity throws error", () => {
            expect(() => daoDecorators.getDao(new _testEntityWithoutDecorator())).toThrowError()
        });

        test("dao returned for class instance", () => {
            const inst = new testEntity();
            const dao = daoDecorators.getDao(inst);
            new dao!().findAll()
            expect(mockDaoMethod).toBeCalledTimes(1);
        })

        test("dao returned for entity name", () => {
            const dao = daoDecorators.getDao('test');
            new dao!().findAll()
            expect(mockDaoMethod).toBeCalledTimes(1);
        })
    })
    test("Cannot assign entity to mutliple daos", () => {
        expect(() => {
            class _secondDao { }
            // entity test already assigned to dao _testDao
            daoDecorators.dao("test")(_secondDao);
        }).toThrowError();
    })
})
