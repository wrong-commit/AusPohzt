import { FieldDef, QueryResultRow } from "pg";
import { createNoSubstitutionTemplateLiteral } from "typescript";
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
    target: DtoNewable<T>;

    constructor(target: DtoNewable<T>) {
        this.target = target;
    }

    /**
     * Map ResultQuery to constructor argument for instance.
     * @param row SQL Table Row
     * @param fieldDefs column definitions for row arg
     * @param joinResult optional entity join results
     */
    map(row: QueryResultRow, fields: FieldDef[], joinResult?: JoinQueryResult[]): T {
        return this._map(row, fields, joinResult);
    }

    /**
     * Map multiple ResultQuery to constructor argument for instances.
     * @param rows SQL Table Rows
     * @param fieldDefs column definitions for SQL Table rows arg
     * @param joinResult optional entity join results. if defined, must have same number of entries as rows arg
     */
    mapMany(rows: QueryResultRow[], fields: FieldDef[], joinResults?: JoinQueryResult[][]): T[] {
        if (joinResults && rows.length !== joinResults?.length) {
            throw new Error('Cannot map many entities with different number of join results. Ensure joinResults populated with undefined for rows without join results');
        }
        return rows.map((row, i) => this._map(row, fields, (joinResults ?? [])[i]));
    }

    /**
     * Creates a class of type T from the provided row and field definitions.
     */
    private _map(row: QueryResultRow, fieldDefs: FieldDef[], joinResults?: JoinQueryResult[]): T {
        // CACHE
        const entityName = getEntityName(this.target);
        const fields = getFields(this.target);
        const joins = getJoinData(this.target);
        console.debug(`Mapping ${fields.length} fields, ${joins?.length} joins to entity ${entityName}`);
        //@ts-expect-error
        let dto: Dto<T> = {}
        this.mapFields(row, fieldDefs, fields, dto);

        if (joins) {
            if (!joinResults) {
                console.warn(`Joins defined for ${entityName} but no joinResults provided`)
            } else {
                this.mapJoins(joinResults, joins, dto);
            }
        }

        // // create instance of type T 
        return new this.target(dto);
    }

    private mapFields(row: undefined | QueryResultRow, fieldDefs: FieldDef[], fields: string[], dto: Dto<T>): Dto<T> {
        if (!row) return dto;

        for (const field of fields) {
            // find fieldDef
            const fieldDef: undefined | FieldDef = fieldDefs.find(x => x.name === field.toLowerCase());
            if (!fieldDef) {
                console.warn(`Could not find returned field for ${field}`);
                continue;
            }
            console.debug(`Setting field ${field} to ${row[field.toLowerCase()]}`);
            //@ts-expect-error
            dto[field] = row[field.toLowerCase()];
        }

        return dto;
    }

    // TODO: return an object that should be assigned to created dto 
    private mapJoins(joinResults: JoinQueryResult[], joins: joinData[], dto: Dto<T>): Dto<T> {
        for (const [field, entity, assoc] of joins) {
            // get data of joined entity 
            const jResults = joinResults?.filter(x => x.joinedEntity === entity);
            if (!jResults) {
                console.trace(`Entity ${entity} not joined because no results returned`);
                continue;
            }
            const joinedEntity = getEntity(entity);
            // TODO: fix typing
            // create pirate instance for join entity
            const joinPirate = new pirate(joinedEntity.constructor as unknown as DtoNewable<any>)
            console.debug(`Field ${field} joins to ${assoc} entity ${entity} [x${jResults.length ?? 0}] `);
            if (assoc === 'multiple') {
                // TODO: test what happens when x.row is undefined
                const mappedJoined = jResults.map(x =>
                    joinPirate.map(x.row!, x.fieldDefs, undefined));
                //@ts-expect-error
                dto[field] = mappedJoined;

            } else {
                if (jResults.length > 1) {
                    throw new Error(`Entity ${entity} joined ${jResults.length} times, expected at most one`)
                }
                // TODO: test what happens when jResults[0]!.row is undefined
                const mappedJoined = joinPirate.map(jResults[0]!.row!, jResults[0]!.fieldDefs, undefined);
                //@ts-expect-error
                dto[field] = mappedJoined;
            }
        }

        return dto;
    }
}
