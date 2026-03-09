import {Column} from "../../shared/types"

export interface IColumnRepository{
    create(columns: Omit<Column, 'id' | 'createdAt'>): Promise<Column>;
    update(columnID: number, data: Partial<Column>): Promise<Column | null>;
    delete(columnID: number): Promise<boolean>;
    findAll(): Promise<Column[]>;
}