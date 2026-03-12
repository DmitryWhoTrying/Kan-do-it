import { use } from "react";
import { User } from "../../shared/types";
import { PrismaClient } from "../generated/prisma/client";
import { UserMapper } from "../mappers/userMapper";
import { IUserRepository } from "./user-repository.interface";


export class UserPrismaRepository implements IUserRepository{
    constructor(private prisma: PrismaClient){};

    async findById(userID: number): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({
            where:{id: userID}
        });

        if (!prismaUser)
            return null;

        return new UserMapper().toDomain(prismaUser);
    }

    async findByName(userName: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findFirst({
            where: {name: userName}
        })

        if (!prismaUser)
            return null;

        return new UserMapper().toDomain(prismaUser);
    }

    async create(user: Omit<User, "id" | "createdAt">): Promise<User> {
        const prismaUser = await this.prisma.user.create({
            data:{
                name: user.name
            }
        })

        return new UserMapper().toDomain(prismaUser);
    }

    async update(userID: number, data: Partial<User>): Promise<User | null> {
        const prismaUser = await this.prisma.user.update({
            where: {id: userID},
            data:{
                name: data.name
            }
        });

        if (!prismaUser)
            return null;

        return new UserMapper().toDomain(prismaUser);
    }

    async delete(userID: number): Promise<boolean> {
        const prismaUser = await this.prisma.user.delete({
            where: {id: userID}
        })

        if (!prismaUser)
            return false;

        return true;
    }

    async findAll(): Promise<User[]> {
        const prismaUser = await this.prisma.user.findMany({});

        if (!prismaUser)
            return  [];

        return new UserMapper().toDomainMany(prismaUser);
    }
}