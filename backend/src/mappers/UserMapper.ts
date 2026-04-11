import {User as PrismaUser} from "@prisma/client"
import {User} from '../../../shared/types'
import { IMapper } from "./Mapper.interface";

export class UserMapper implements IMapper<User, PrismaUser>{
    toDomain(prismaUser: PrismaUser): User {
        return{
            id: prismaUser.id,
            name: prismaUser.name
        };
    }
    toDomainMany(prismaUsers: PrismaUser[]): User[] {
        return prismaUsers.map(usr => this.toDomain(usr));
    }
}