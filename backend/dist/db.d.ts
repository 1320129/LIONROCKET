import Database from "better-sqlite3";
export declare function getDb(): Database.Database;
export type UserRow = {
    id: number;
    email: string;
    password_hash: string;
    created_at: number;
};
//# sourceMappingURL=db.d.ts.map