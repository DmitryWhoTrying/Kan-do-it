import { IColumnRepository } from "../repositories/column-repository.interface";
import { Column } from "../../shared/types";


export class ColumnService{
    constructor(
        private columnRepository: IColumnRepository,
    ){};

    async create(data: Omit<Column, 'id' | 'createdAt'>, BoardId: number){
        const column = await this.columnRepository.create(data, BoardId);
        return column;
    }

    async update(columnId: number, data: Partial<Column>){
        const column = await this.columnRepository.update(columnId, data);
        return column;
    }

    async delete(columnId: number){
        const column = await this.columnRepository.delete(columnId);
        return column;
    }

    async findAll(){
        return await this.columnRepository.findAll();
    }

    async find(columnId: number){
        const col = await this.columnRepository.find(columnId);
        return col;
    }

    async findByBoard(boardId: number){
        const cols = await this.columnRepository.findByBoard(boardId);
        return cols;
    }
}