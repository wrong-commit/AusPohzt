import { FieldDef, QueryResultRow } from "pg";
import { getEntityName, getFields } from "../decorator/entityDecorators";
import { getJoinData, joinData } from "../decorator/joinDecorator";
import { Dto } from "../types/Dto";
import { DtoNewable } from "../types/DtoNewable";

export { pirate };


type JoinQueryResult = {
    row: QueryResultRow,
    fieldDefs: FieldDef[]
};
class pirate<T extends object> {
    row: QueryResultRow | QueryResultRow[];
    fieldDefs: FieldDef[];
    joinResults?: JoinQueryResult[];

    constructor(row: QueryResultRow, fieldDefs: FieldDef[]);
    constructor(row: QueryResultRow[], fieldDefs: FieldDef[]);
    constructor(row: QueryResultRow, fieldDefs: FieldDef[], joinResults: JoinQueryResult[]);

    // populate with target: DtoNewable<T> instead of query row results.
    constructor(row: any, fieldDefs: any, joinResults?: any) {
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
    private _map(target: DtoNewable<T>, row: QueryResultRow): T {
        const entityName = getEntityName(target);
        const fields = getFields(target);
        const joins = getJoinData(target);
        console.debug(`Mapping ${fields.length} fields, ${joins?.length} joins to entity ${entityName}`);
        //@ts-expect-error
        let dto: Dto<T> = {}
        this.mapFields(row, fields, dto);

        if (joins) {
            this.mapJoins(joins, dto);
        }

        // // create instance of type T 
        return new target(dto);
    }

    private mapFields(row: undefined | QueryResultRow, fields: string[], dto: Dto<T>): Dto<T> {
        if (!row) return dto;

        for (const field of fields) {
            console.debug(`Setting field ${field}`);
            // find fieldDef
            const fieldDef: undefined | FieldDef = this.fieldDefs.find(x => x.name === field.toLowerCase());
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
            console.debug(`Field ${field} joins to ${assoc} entity ${entity}`);
            // // find fieldDef
            // const fieldDef: undefined | FieldDef = this.fieldDefs.find(x => x.name === field.toLowerCase());
            // if (!fieldDef) {
            //     console.warn(`Could not find returned field for ${field}`);
            //     continue;
            // }
            if (assoc === 'multiple') {
                //@ts-expect-error
                dto[field] = [];
            } else {
                //@ts-expect-error
                dto[field] = null;
            }
        }

        return dto;
    }
}
