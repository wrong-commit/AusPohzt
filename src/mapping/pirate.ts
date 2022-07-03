import { FieldDef, QueryResultRow } from "pg";
import { getEntity, getEntityName, getFields } from "../decorator/entityDecorators";
import { getJoinData, joinData } from "../decorator/joinDecorator";
import { Dto } from "../types/Dto";
import { DtoNewable } from "../types/DtoNewable";

export { pirate, JoinQueryResult };

type JoinQueryResult = {
    joinedEntity: string
    row?: QueryResultRow,
    fieldDefs: FieldDef[]
};

// TODO: cache instances of pirate, should make field and entity lookup faster ? quantify
class pirate<T extends object> {
    row: QueryResultRow | QueryResultRow[];
    fieldDefs: FieldDef[];
    joinResults?: JoinQueryResult[];

    constructor(row: QueryResultRow, fieldDefs: FieldDef[]);
    constructor(row: QueryResultRow[], fieldDefs: FieldDef[]);
    constructor(row: QueryResultRow, fieldDefs: FieldDef[], joinResults: JoinQueryResult[]);

    // populate with target: DtoNewable<T> instead of query row results. SHOULD HAVE DONE THIS BEFORE ADDING JOINNS
    constructor(row: any, fieldDefs: any, joinResults?: JoinQueryResult[]) {
        this.row = row;
        this.fieldDefs = fieldDefs;
        this.joinResults = joinResults;
    }

    /**
     * Map from ResultQuery to constructor argument for instance.
     */
    map(target: DtoNewable<T>): T {
        if (Array.isArray(this.row)) {
            throw new Error('Cannot map single entity when multiple rows returned. Use pirate.mapMany()')
        }

        return this._map(target, this.row);
    }

    mapMany(target: DtoNewable<T>): T[] {
        if (!Array.isArray(this.row)) {
            throw new Error('Cannot map many entities when pirate constructed with single QueryResultRow. Uses pirate.map()');
        }
        return this.row.map(row => this._map(target, row));
    }

    /**
     * Performs actual mapping
     */
    private _map(target: DtoNewable<T>, row: QueryResultRow, fieldDefs?: FieldDef[]): T {
        const entityName = getEntityName(target);
        const fields = getFields(target);
        const joins = getJoinData(target);
        console.debug(`Mapping ${fields.length} fields, ${joins?.length} joins to entity ${entityName}`);
        //@ts-expect-error
        let dto: Dto<T> = {}
        this.mapFields(row, fieldDefs ?? this.fieldDefs, fields, dto);

        if (joins) {
            this.mapJoins(joins, dto);
        }

        // // create instance of type T 
        return new target(dto);
    }

    private mapFields(row: undefined | QueryResultRow, fieldDefs: FieldDef[], fields: string[], dto: Dto<T>): Dto<T> {
        if (!row) return dto;

        for (const field of fields) {
            console.debug(`Setting field ${field}`);
            // find fieldDef
            const fieldDef: undefined | FieldDef = fieldDefs.find(x => x.name === field.toLowerCase());
            if (!fieldDef) {
                console.warn(`Could not find returned field for ${field}`);
                continue;
            }
            //@ts-expect-error
            dto[field] = row[field.toLowerCase()];
        }

        return dto;
    }

    private mapJoins(joins: joinData[], dto: Dto<T>): Dto<T> {
        for (const [field, entity, assoc] of joins) {
            // get data of joined entity 
            const jResults = this.joinResults?.filter(x => x.joinedEntity === entity);
            if (!jResults) {
                console.trace(`Entity ${entity} not joined because no results returned`);
                continue;
            }
            console.debug(`Field ${field} joins to ${assoc} entity ${entity} [x${jResults.length ?? 0}] `);
            const joinedEntity = getEntity(entity);
            if (assoc === 'multiple') {
                const mappedJoined = jResults.map(x =>
                    this._map(joinedEntity.constructor as unknown as DtoNewable<any>,
                        x.row!,
                        x.fieldDefs
                    ));
                //@ts-expect-error
                dto[field] = mappedJoined;

            } else {
                if (jResults.length > 1) {
                    throw new Error(`Entity ${entity} joined ${jResults.length} times, expected at most one`)
                }
                // TODO: check row is not undefined
                const mappedJoined = this._map(joinedEntity.constructor as unknown as DtoNewable<any>,
                    jResults[0]!.row!,
                    jResults[0]!.fieldDefs
                )
                //@ts-expect-error
                dto[field] = mappedJoined;
            }
        }

        return dto;
    }
}
