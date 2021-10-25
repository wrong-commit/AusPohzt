import { Pool } from "pg";
import { pool } from "../database/database";
import { getDao } from "../decorator/daoDecorators";
import { parcel } from "../entities/parcel";
import { queued } from "../entities/queued";
import { Newable } from "../types/Newable";
import { baseDao, dao, daoEntity } from "./dao";
import { parcelDao } from "./parcelDao";
import { queuedDao } from "./queuedDao";

export { daoFactory }

new parcelDao(parcel, pool);
new queuedDao(queued, pool);

// parcelDao declarations
function daoFactory(x: Newable<parcel>): parcelDao;
function daoFactory(x: Newable<parcel>, overridePool: Pool): parcelDao;
// queuedDao declarations
function daoFactory(x: Newable<queued>): queuedDao;
function daoFactory(x: Newable<queued>, overridePool: Pool): queuedDao;

function daoFactory<T extends daoEntity>(x: Newable<T>): dao<T>;
function daoFactory<T extends daoEntity>(x: Newable<T>, overridePool: Pool): dao<T>;

function daoFactory<T extends daoEntity>(x: Newable<T>, overridePool?: Pool): dao<T> {
    let entityDao = getDao<T>(x);
    if (!entityDao) {
        return new baseDao(x, overridePool ?? pool);
    };

    return new entityDao(x, overridePool ?? pool);
}
