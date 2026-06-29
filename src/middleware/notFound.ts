import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({
        message: 'Route not found! Please input right Route.',
        path: req.originalUrl,
        date: new Date(),
    });
};
