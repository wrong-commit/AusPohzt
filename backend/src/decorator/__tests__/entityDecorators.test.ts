// test class with decorator
import * as entityDecorators from '../entityDecorators';

@entityDecorators.entity("test")
class _testClass {
    @entityDecorators.bind
    stringProp: string = 'default';
    @entityDecorators.bind
    numberProp: number = -1;
}
@entityDecorators.entity("noFields")
class _testClassWithNoFields {
}

class _testClassWithNoDecerator {
}

@entityDecorators.entity('lookupByName')
class _testLookupByName {
    test: string;
    constructor(value: string) {
        this.test = value;
    }
}

describe("@entity", () => {
    describe("Get entity name", () => {
        test("No Decorator on class throws an error", () => {
            const _testClassInst: _testClassWithNoDecerator = new _testClassWithNoDecerator();
            expect(() => {
                expect(entityDecorators.getEntityName(_testClassInst))
            }).toThrowError();
        });

        test("entity name returned for instance", () => {
            const _testClassInst: _testClass = new _testClass();
            expect(entityDecorators.getEntityName(_testClassInst)).toBe('test');
        })

        test("entity name returned for type", () => {
            expect(entityDecorators.getEntityName(_testClass)).toBe('test');
        })

        test("entity name returned for prototype", () => {
            expect(entityDecorators.getEntityName(_testClass.prototype)).toBe('test');
        })
    })

    describe("Get entity by name", () => {
        test("Invalid entity name throws error", () => {
            expect(() => entityDecorators.getEntity('invalid')).toThrowError();
        })
        test("Can constuct class instance from getEntity()", () => {
            const proto = entityDecorators.getEntity('lookupByName');
            expect(proto).toBe(_testLookupByName.prototype);

            const obj = new proto.constructor('reflection FTW!!') as _testLookupByName;
            expect(obj.test).toBe('reflection FTW!!')
        })
    })

    describe("Get fields", () => {
        test("No Entity decorator throws an error", () => {
            expect(() => {
                entityDecorators.getFields(_testClassWithNoDecerator);
            }).toThrowError();
        })

        test("fields returned for instance", () => {
            const _testClassInst: _testClass = new _testClass();
            expect(entityDecorators.getFields(_testClassInst)).toStrictEqual(
                ['stringProp', 'numberProp']
            );
        })

        test("fields returned for type", () => {
            expect(entityDecorators.getFields(_testClass)).toStrictEqual(
                ['stringProp', 'numberProp']
            );
        })
        test("fields returned for prototype", () => {
            expect(entityDecorators.getFields(_testClass.prototype)).toStrictEqual(
                ['stringProp', 'numberProp']
            );
        })

        // FIXME: does this need to be fixed ? can an entity exist without an bound fields ? 
        test("no fields for entity throws error", () => {
            expect(() => {
                entityDecorators.getFields(_testClassWithNoFields);
            }).toThrowError();
        })
    })
})
