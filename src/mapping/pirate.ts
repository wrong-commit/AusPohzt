import { FieldDef, QueryResultRow } from "pg";
import { getEntityName, getFields } from "../decorator/entityDecorators";
import { Dto } from "../types/Dto";
import { DtoNewable } from "../types/DtoNewable";

export { pirate };
class pirate<T extends object> {
    row: QueryResultRow | QueryResultRow[];
    fieldDefs: FieldDef[];
    constructor(row: QueryResultRow | QueryResultRow[], fieldDefs: FieldDef[]) {
        this.row = row;
        this.fieldDefs = fieldDefs;
    }

    /**
     * Map from ResultQuery to constructor argument for instance.
     */
    map(target: DtoNewable<T>): T {
        const entityName = getEntityName(target);
        console.debug(`Mapping entity ${entityName}`)
        const fields = getFields(target);

        let row;
        if (Array.isArray(this.row)) {
            row = this.row[0];
        } else {
            row = this.row;
        }
        //@ts-expect-error
        let dto: Dto<T> = {}
        this.mapFields(row, fields, dto);

        // // create instance of type T 
        return new target(dto);
    }
    mapMany(target: DtoNewable<T>): T[] {
        const entityName = getEntityName(target);
        console.debug(`Mapping entity ${entityName}`)
        const fields = getFields(target);

        let rows;
        if (Array.isArray(this.row)) {
            rows = this.row;
        } else {
            rows = [this.row];
        }
        return rows.map(row => this.mapFields(row, fields, {} as Dto<T>)).map(dto => new target(dto));
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
}
