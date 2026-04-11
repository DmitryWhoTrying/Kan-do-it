import {Request, Response} from 'express';
import { UserService } from "../service/user-service";


export class UserController{
    constructor(private userService: UserService){};
    
    async findUsers(req: Request, res: Response){
        const users = await this.userService.findAll()
        res.json({success:true, data:users});
    };

    async findById(req: Request, res: Response){
        const user = await this.userService.findById(Number(req.params.id));
        if (user)
            res.json({success:true, data:user});
        else
            res.status(404).json({success:false, error: "not found user with id: " + req.params.id});
    }

    async findByName(req: Request, res: Response){
        const user = await this.userService.findByName(req.body);
        if (user)
            res.json({success:true, data:user});
        else
            res.status(404).json({success:false, error: "not found user with id: " + req.params.id});
    }

    async create(req: Request, res: Response){
        if (!(await this.userService.findByName(req.body.userName)))
            res.status(500).json({success:false, error: "User with such name already exists"});
        else
        {
            const user = await this.userService.create(req.body);
            res.status(200).json({success:true, data:user});
        }
    }

    async update(req: Request, res: Response){
        if (await this.userService.findByName(req.body.userName))
            res.status(500).json({success:false, error: "cannot update username, username already using, args: " + req.params + req.body});
        
        else
        {
            const user = this.userService.update(Number(req.params.id), req.body);
            if (user) 
                res.status(200).json({success:true, data:user});
            else
                res.status(500).json({success:false, error: "cannot update user with id:" + req.params.id});
        }
    }

    async delete(req: Request, res: Response){
        const user = await this.userService.delete(Number(req.params.id));
        if (user)
            res.status(200).json({success:true, data: "delete user with id: " + req.params.id});
        else
            res.status(500).json({success:false, error: "cannot delete user with id: " + req.params.id});
    }
}