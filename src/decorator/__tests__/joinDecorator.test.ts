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
    @join('_joinedEntity')
    joinEntity?: _joinedEntity;


    @join('_joinedEntity', 'multiple')
    joinMany?: _joinedEntity[];

    /**
     * This is valid because join decorator does not check type of object to be joined. Errors are instead
     * raised when trying to join against a non-existent entity
     */
    @join('_notEntity')
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
            ['joinEntity', '_joinedEntity', 'single'],
            ['joinMany', '_joinedEntity', 'multiple'],
            ['joinNotEntity', '_notEntity', 'single'],
        ]);

        // catch any issues with entityDecorator.getEntity by name early
        expect(getEntity(joinFields![0]![1])).toBe(_joinedEntity.prototype)
    })
})