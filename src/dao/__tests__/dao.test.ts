import { bind, entity } from "../../decorator/entityDecorators";
import { join } from "../../decorator/joinDecorator";
import { daoFactory } from "../daoFactory";
import { pool } from '../../database/database';
import { QueryResult } from "pg";

// MOCK POOL 
const mockedPool = jest.mock('../../database/database');

@entity('author')
class _author {
    @bind
    id?: number;
}
@entity('page')
class _page {
    @bind
    id?: number;
    bookId?: number;
}
@entity('book')
class _book {
    @bind
    id?: number;
    @join('author', { joinColumnName: 'authorId', association: 'single' })
    author?: _author;
    @join('page', { joinColumnName: 'bookId', association: 'multiple' })
    pages: _page[] = [];
}

describe("dao", () => {
    describe("single association joins", () => {
        test("single association saves", async () => {
            // mocked saves to return id 1
            const AUTHOR_ID = 1;
            const BOOK_ID = 2;
            jest.spyOn(pool, 'query')
                .mockImplementationOnce((): PromiseLike<Partial<QueryResult>> =>
                    Promise.resolve({
                        rowCount: 1,
                        rows: [{
                            'id': BOOK_ID
                        }]
                    })
                ).mockImplementationOnce((): PromiseLike<Partial<QueryResult>> =>
                    Promise.resolve({
                        rowCount: 1,
                        rows: [{
                            'id': AUTHOR_ID
                        }]
                    })
                ).mockImplementation(() => Promise.reject('mock not implemented'));

            // call save
            const dao = daoFactory<_book>(_book, pool);

            let book = new _book();
            let author = new _author();
            book.author = author;

            book = (await dao.save(book))!;
            expect(book).toBeDefined();
            expect(book.id).toBe(BOOK_ID);
            expect(book.author?.id).toBe(AUTHOR_ID);
        })

        test("multiple association saves", async () => {
            // mocked saves to return id 1
            const BOOK_ID = 1;
            const PAGE_ID = 2;
            const PAGE_ID_2 = 3;
            jest.spyOn(pool, 'query')
                .mockImplementationOnce((): PromiseLike<Partial<QueryResult>> =>
                    Promise.resolve({
                        rowCount: 1,
                        rows: [{
                            'id': BOOK_ID
                        }]
                    })
                )
                .mockImplementationOnce((): PromiseLike<Partial<QueryResult>> =>
                    Promise.resolve({
                        rowCount: 1,
                        rows: [{
                            'id': PAGE_ID
                        }]
                    })
                )
                .mockImplementationOnce((): PromiseLike<Partial<QueryResult>> =>
                    Promise.resolve({
                        rowCount: 1,
                        rows: [{
                            id: PAGE_ID_2
                        }]
                    })
                ).mockImplementation(() => { Promise.reject('mock not implemented') })

            // call save
            const dao = daoFactory<_book>(_book, pool);

            let book = new _book();
            book.pages.push(new _page())
            book.pages.push(new _page())

            book = (await dao.save(book))!;
            expect(book).toBeDefined();
            expect(book.id).toBe(BOOK_ID);
            expect(book.pages![0]!.id).toBe(PAGE_ID);
            expect(book.pages![0]!.bookId).toBe(BOOK_ID);
            expect(book.pages![1]!.id).toBe(PAGE_ID_2);
            expect(book.pages![1]!.bookId).toBe(BOOK_ID);
        })
    })
})
