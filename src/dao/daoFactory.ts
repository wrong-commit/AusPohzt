import { Pool } from "pg";
import { pool } from "../database/database";
import { getDao } from "../decorator/daoDecorators";
import { parcel } from "../entities/parcel";
import { Newable } from "../types/Newable";
import { baseDao, dao, daoEntity } from "./dao";
import { parcelDao } from "./parcelDao";

export { daoFactory }

new parcelDao(parcel, pool);

function daoFactory(x: Newable<parcel>): parcelDao;
function daoFactory(x: Newable<parcel>, overridePool: Pool): parcelDao;
function daoFactory<T extends daoEntity>(x: Newable<T>): dao<T>;
function daoFactory<T extends daoEntity>(x: Newable<T>, overridePool: Pool): dao<T>;

function daoFactory<T extends daoEntity>(x: Newable<T>, overridePool?: Pool): dao<T> {
    let entityDao = getDao<T>(x);
    if (!entityDao) {
        return new baseDao(x, overridePool ?? pool);
    };

    return new entityDao(x, overridePool ?? pool);
}
