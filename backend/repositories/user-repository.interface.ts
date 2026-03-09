import {User} from "../../shared/types"

export interface IUserRepository{
    findById(userID: number) : Promise<User | null>;
    findByName(userName: string) : Promise<User | null>;

    create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
    update(userID: number, data: Partial<User>): Promise<User | null>;
    delete(userID: number): Promise<boolean>;
    findAll(): Promise<User[]>;
}