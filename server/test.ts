import express from 'express'
import type { Request, Response } from 'express'

const app = express()
app.use(express.json())

app.post('/login', async (req: Request, res: Response) => {
    res.json({ ok: true })
})

app.listen(5050)
