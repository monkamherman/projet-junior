import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpCode } from '../core/constants';
import log from '../utils/logger';


const prisma = new PrismaClient();

const userController = {

    postUser: async (req: Request, res: Response)=> {
        const {name} = req.body
        const user = await prisma.user.create({
            data:
            name
            })
        res.status(HttpCode.OK).json(user)
        log.info(user)
    }
}

export default userController