// test class with decorator
import * as entityDecorators from '../entityDecorators';

@entityDecorators.entity("test")
class _testClass {
    @entityDecorators.bind
    stringProp: string = 'default';
}
@entityDecorators.entity("noFields")
class _testClassWithNoFields {
}

class _testClassWithNoDecerator {
}

describe("Test entityDecorator", () => {
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
    })

    describe("Get fields", () => {
        test("No Entity decorator throws an error", () => {
            expect(() => {
                entityDecorators.getFields(_testClassWithNoDecerator);
            }).toThrowError();
        })

        test("fields returned for instance", () => {
            const _testClassInst: _testClass = new _testClass();
            expect(entityDecorators.getFields(_testClassInst)).toStrictEqual(['stringProp']);
        })

        test("fields returned for type", () => {
            expect(entityDecorators.getFields(_testClass)).toStrictEqual(['stringProp']);
        })

        // FIXME: does this need to be fixed ? can an entity exist without an bound fields ? 
        test("no fields for entity throws error", () => {
            expect(() => {
                entityDecorators.getFields(_testClassWithNoFields);
            }).toThrowError();
        })
    })
})
