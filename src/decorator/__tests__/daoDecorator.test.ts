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

describe("Test daoDecorator", () => {
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

    // describe("Get fields", () => {
    //     test("No Entity decorator throws an error", () => {
    //         expect(() => {
    //             entityDecorators.getFields(_testClassWithNoDecerator);
    //         }).toThrowError();
    //     })

    //     test("fields returned for instance", () => {
    //         const _testClassInst: _testClass = new _testClass();
    //         expect(entityDecorators.getFields(_testClassInst)).toStrictEqual(['stringProp']);
    //     })

    //     test("fields returned for type", () => {
    //         expect(entityDecorators.getFields(_testClass)).toStrictEqual(['stringProp']);
    //     })

    //     // FIXME: does this need to be fixed ? can an entity exist without an bound fields ? 
    //     test("no fields for entity throws error", () => {
    //         expect(() => {
    //             entityDecorators.getFields(_testClassWithNoFields);
    //         }).toThrowError();
    //     })
    // })
})
