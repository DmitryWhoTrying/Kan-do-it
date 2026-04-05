import { User } from "../../../shared/types";
import { IUserRepository } from "../repositories/user-repository.interface";

export class UserService{
    constructor(
        private UserRepository: IUserRepository,
    ){};

    async findById(userID: number){
        const user = await this.UserRepository.findById(userID);
        return user;
    }

    async findByName(userName: string){
        const user = await this.UserRepository.findByName(userName);
        return user;
    }

    async create(data: Omit<User, 'id' | 'createdAt'>){
        const user = await this.UserRepository.create(data);
        return user;
    }

    async update(userID: number, data:Partial<User>){
        const user = await this.UserRepository.update(userID, data);
        return user;
    }

    async delete(userId: number){
        const user = await this.UserRepository.delete(userId);
        return user;
    }

    async findAll(){
        return await this.UserRepository.findAll();
    }
}