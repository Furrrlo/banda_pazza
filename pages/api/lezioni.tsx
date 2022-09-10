import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '../../lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import {PrismaClient} from "@prisma/client";

export type Lezione = {
    alunno: {
        nome: string;
        cognome: string;
    }
    orario: Date;
}

async function lezioniRoute(req: NextApiRequest, res: NextApiResponse<Lezione[]>) {
    const { from, to } = await req.body;
    const user = req.session.user;

    if(!from || !to)
        return res.status(400).end();
    if(!user || user?.isLoggedIn !== true)
        return res.status(401).end();

    const prisma = new PrismaClient();
    const lezioni = await prisma.lezione.findMany({
        where: {
            docenteId: user.id,
            orario: { lte: to, gte: from }
        },
        include: { alunno: true },
    })

    res.status(200).json(lezioni.map(lezione => {
        return {
            alunno: {
                nome: lezione.alunno.nome,
                cognome: lezione.alunno.cognome,
            },
            orario: lezione.orario,
        }
    }))
}

export default withIronSessionApiRoute(lezioniRoute, sessionOptions)