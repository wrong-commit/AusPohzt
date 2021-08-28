import { entity, getEntity } from "../entityDecorators"
import { getJoinData, join, joinData } from "../joinDecorator";

class _notEntity { }

@entity('_joinedEntity')
class _joinedEntity {
    id?: number;
}

// entity annotation required to join properly
@entity('_joiningEntity')
class _testClassWithJoin {
    id?: number;
    @join('_joinedEntity', { joinColumnName: 'noJoinId' })
    joinEntity?: _joinedEntity;


    @join('_joinedEntity', { association: 'multiple', joinColumnName: 'otherJoinId' })
    joinMany?: _joinedEntity[];

    /**
     * This is valid because join decorator does not check type of object to be joined. Errors are instead
     * raised when trying to join against a non-existent entity
     */
    @join('_notEntity', { joinColumnName: 'goesNowhereId' })
    joinNotEntity?: _notEntity;
};

describe("@join", () => {
    test("get joinData from invalid entity throws error", () => {
        expect(() => getJoinData(_notEntity)).toThrow();
    })
    test("get joinData from entity with no joins returns undefined", () => {
        expect(getJoinData(_joinedEntity)).toBeUndefined();
    })
    test("get joinData from entity returns joinData", () => {
        const joinFields = getJoinData(_testClassWithJoin);
        expect(joinFields).toStrictEqual<joinData[]>([
            ['joinEntity', '_joinedEntity', 'single', `noJoinId`],
            ['joinMany', '_joinedEntity', 'multiple', `otherJoinId`],
            ['joinNotEntity', '_notEntity', 'single', `goesNowhereId`],
        ]);
    })

    test("joinData entity name can lookup entity", () => {
        const joinFields = getJoinData(_testClassWithJoin);
        expect(getEntity(joinFields![0]![1])).toBe(_joinedEntity.prototype)
    })
})