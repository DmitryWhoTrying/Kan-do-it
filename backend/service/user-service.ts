import { User } from "../../shared/types";
import { IUserRepository } from "../repositories/user-repository.interface";
import {Server} from "socket.io";

export class UserService{
    constructor(
        private UserRepository: IUserRepository,
        private io: Server
    ){};

    async findById(userID: number){
        const user = await this.UserRepository.findById(userID);
        if (user)
            this.io.emit('user:find', userID);
        else
            this.io.emit('user:find error', userID);
        return user;
    }

    async findByName(userName: string){
        const user = await this.UserRepository.findByName(userName);
        if (user)
            this.io.emit('user:find', userName);
        else
            this.io.emit('user:find error', userName);
        return user;
    }

    async create(data: Omit<User, 'id' | 'createdAt'>){
        const user = await this.UserRepository.create(data);
        this.io.emit('user:create', user);
        return user;
    }

    async update(userID: number, data:Partial<User>){
        const user = await this.UserRepository.update(userID, data);
        if (user)
            this.io.emit('user:update', userID);
        else
            this.io.emit('user:update error', userID);

        return user;
    }

    async delete(userId: number){
        const user = await this.UserRepository.delete(userId);
        if (user)
            this.io.emit('user:delete', userId);
        else
            this.io.emit('user:delete error', userId);

        return user;
    }

    async findAll(){
        return await this.UserRepository.findAll();
    }
}