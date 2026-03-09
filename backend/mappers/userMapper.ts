import {User as PrismaUser} from "../generated/prisma/client.ts"
import {User} from '../../shared/types.ts'
import { IMapper } from "./Mapper.interface.ts";

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