import { Server } from "socket.io";
import { IColumnRepository } from "../repositories/column-repository.interface";
import { Column } from "../../shared/types";


export class ColumnService{
    constructor(
        private columnRepository: IColumnRepository,
        private io: Server
    ){};

    async create(data: Omit<Column, 'id' | 'createdAt'>, BoardId: number){
        const column = await this.columnRepository.create(data, BoardId);
        this.io.emit('column:create', column);
        return column;
    }

    async update(columnId: number, data: Partial<Column>){
        const column = await this.columnRepository.update(columnId, data);
        this.io.emit('column:update', columnId);
        return column;
    }

    async delete(columnId: number){
        const column = await this.columnRepository.delete(columnId);
        if (column)
            this.io.emit('column:delete', columnId);
        else
            this.io.emit('column:delete error');
        return column;
    }

    async findAll(){
        return await this.columnRepository.findAll();
    }

    async find(columnId: number){
        const col = await this.columnRepository.find(columnId);
        if (col)
            this.io.emit('column:find error', columnId);
        else
            this.io.emit('column:find', columnId);
        
        return col;
    }
}