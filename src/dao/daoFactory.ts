import { getDao } from "../decorator/daoDecorators";
import { parcel } from "../entities/parcel";
import { Newable } from "../types/Newable";
import { baseDao, dao, daoEntity } from "./dao";
import { parcelDao } from "./parcelDao";

export { daoFactory }

new parcelDao(parcel);

function daoFactory(x: Newable<parcel>): parcelDao;

function daoFactory<T extends daoEntity>(x: Newable<T>): dao<T> {
    let entityDao = getDao<T>(x);
    if (!entityDao) {
        return new baseDao(x);
    };

    return new entityDao(x);
}
